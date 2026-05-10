const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { backupSession, restoreSession, clearLocalSession } = require("./backup.service");

// ── Structured logger ─────────────────────────────────────────────────────────
function log(level, event, meta = {}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
      ...meta,
    })
  );
}

// ── WhatsApp service ──────────────────────────────────────────────────────────
class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.latestQr = null;
    this.qrGeneratedAt = null;

    // Lifecycle control
    this.initializing = false;
    this.reconnecting = false;
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;
    this.lastReconnectTime = 0;

    // Intervals
    this.backupInterval = null;
    this.cacheCleanupInterval = null;

    this.metrics = {
      qrGenerations: 0,
      reconnects: 0,
      restorations: 0,
      backups: 0,
      messagesSent: 0,
      startTime: Date.now(),
    };

    this.sessionState = "idle"; // idle | launching | qr | authenticated | ready | disconnected | error
    this.browserState = "none"; // none | launching | open | closed | error
  }

  // ── Initialization ─────────────────────────────────────────────────────────
  async initialize() {
    if (this.initializing) {
      log("info", "whatsapp_init_skipped", { reason: "already_initializing" });
      return;
    }

    if (this.isReady && this.client) {
      log("info", "whatsapp_init_skipped", { reason: "already_ready" });
      return;
    }

    this.initializing = true;
    this.sessionState = "launching";
    log("info", "whatsapp_init_start");

    try {
      // 1. Optional restoration (keep for Render compatibility if needed)
      try {
        const restored = await restoreSession();
        if (restored) this.metrics.restorations++;
      } catch (err) {
        log("warn", "session_restore_error", { error: err.message });
      }

      // 2. Clear old client if exists
      await this._destroyClient();

      // 3. Create fresh client
      this._createClient();

      // 4. Launch browser
      this.browserState = "launching";
      log("info", "browser_launch_start");
      await this.client.initialize();
      
      this.initializing = false;
    } catch (err) {
      log("error", "whatsapp_init_failure", { error: err.message, stack: err.stack });
      this.initializing = false;
      this.sessionState = "error";
      this.browserState = "error";
      this.scheduleReconnect("init_failure");
    }
  }

  _createClient() {
    log("info", "client_creation", { clientId: "main", dataPath: "./sessions" });
    
    const puppeteerOptions = {
      headless: true,
      protocolTimeout: 180_000,
      defaultViewport: null,
      args: config.puppeteerArgs,
    };

    // Only use executablePath if explicitly required (Render or manually set)
    if (config.RENDER_URL || process.env.PUPPETEER_EXECUTABLE_PATH) {
      puppeteerOptions.executablePath = config.chromePath;
      log("info", "using_custom_executable_path", { path: config.chromePath });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "main",
        dataPath: path.join(process.cwd(), "sessions"),
      }),
      puppeteer: puppeteerOptions,
      qrMaxRetries: 5,
      authTimeoutMs: 60_000,
    });

    this._attachListeners();
  }

  async _destroyClient() {
    if (this.client) {
      log("info", "destroying_existing_client");
      try {
        this.client.removeAllListeners();
        await this.client.destroy();
      } catch (err) {
        log("warn", "client_destroy_error", { error: err.message });
      }
      this.client = null;
    }
  }

  // ── Event Listeners ────────────────────────────────────────────────────────
  _attachListeners() {
    if (!this.client) return;

    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrGeneratedAt = Date.now();
      this.metrics.qrGenerations++;
      this.sessionState = "qr";
      log("info", "qr_received", { attempt: this.metrics.qrGenerations });
    });

    this.client.on("authenticated", () => {
      this.sessionState = "authenticated";
      this.latestQr = null;
      this.qrGeneratedAt = null;
      log("info", "whatsapp_authenticated");
      
      // Immediate backup after authentication
      backupSession().catch(err => log("error", "post_auth_backup_failed", { error: err.message }));
    });

    this.client.on("auth_failure", (msg) => {
      this.sessionState = "error";
      this.isReady = false;
      log("error", "whatsapp_auth_failure", { message: msg });
      
      // If auth fails, we might have a corrupted session. Clear it.
      clearLocalSession();
      this.scheduleReconnect("auth_failure");
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.sessionState = "ready";
      this.browserState = "open";
      this.reconnectAttempt = 0;
      this.reconnecting = false;
      log("info", "whatsapp_ready", { 
        session: "main",
        pushname: this.client.info?.pushname 
      });

      this._setupIntervals();
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.sessionState = "disconnected";
      this.browserState = "closed";
      log("warn", "whatsapp_disconnected", { reason });
      this.scheduleReconnect("disconnected");
    });
  }

  _setupIntervals() {
    // Clear existing to prevent duplicates
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

    this.backupInterval = setInterval(() => {
      if (this.isReady) {
        this.metrics.backups++;
        backupSession().catch(err => log("error", "periodic_backup_failed", { error: err.message }));
      }
    }, config.BACKUP_INTERVAL);

    this.cacheCleanupInterval = setInterval(() => {
      this._cleanupMemory();
    }, config.CACHE_CLEANUP_INTERVAL);
  }

  // ── Reconnection Logic ─────────────────────────────────────────────────────
  scheduleReconnect(reason) {
    if (this.reconnecting) return;
    
    if (this.reconnectAttempt >= config.MAX_RECONNECT_ATTEMPTS) {
      log("fatal", "max_reconnect_attempts_reached", { attempts: this.reconnectAttempt });
      this.sessionState = "error";
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempt++;
    this.metrics.reconnects++;
    this.sessionState = "reconnecting";

    const delay = this._calculateReconnectDelay();
    log("info", "reconnect_scheduled", { reason, attempt: this.reconnectAttempt, delayMs: delay });

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnecting = false;
      this.lastReconnectTime = Date.now();
      await this.initialize();
    }, delay);
  }

  _calculateReconnectDelay() {
    const base = config.RECONNECT_BASE_DELAY_MS;
    const jitter = Math.floor(Math.random() * config.RECONNECT_JITTER_MS);
    const exponential = Math.pow(2, Math.min(this.reconnectAttempt - 1, 5)) * 1000;
    return Math.min(base + exponential + jitter, config.RECONNECT_MAX_DELAY_MS);
  }

  // ── Memory & Cleanup ───────────────────────────────────────────────────────
  async _cleanupMemory() {
    try {
      if (global.gc) global.gc();
      
      const mem = process.memoryUsage();
      log("info", "memory_usage_report", {
        rssMB: Math.floor(mem.rss / 1024 / 1024),
        heapUsedMB: Math.floor(mem.heapUsed / 1024 / 1024),
      });

      // Browser cache cleanup if browser is open
      if (this.client && this.client.pupPage) {
        try {
          await this.client.pupPage.evaluate(() => {
            try { window.localStorage.clear(); } catch {}
            try { window.sessionStorage.clear(); } catch {}
          });
        } catch {}
      }
    } catch (err) {
      log("warn", "memory_cleanup_error", { error: err.message });
    }
  }

  async destroy() {
    log("info", "whatsapp_service_destroy_start");
    
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

    // Final backup before exit
    if (this.isReady) {
      try {
        await Promise.race([
          backupSession(),
          new Promise((_, r) => setTimeout(() => r(new Error("Timeout")), 5000))
        ]);
      } catch {}
    }

    await this._destroyClient();
    log("info", "whatsapp_service_destroy_complete");
  }

  // ── Status & Helpers ───────────────────────────────────────────────────────
  getStatus() {
    return {
      status: this.isReady ? "ready" : this.initializing ? "initializing" : "not_ready",
      isReady: this.isReady,
      sessionState: this.sessionState,
      browserState: this.browserState,
      reconnectAttempt: this.reconnectAttempt,
      metrics: this.metrics,
      hasQr: !!this.latestQr,
      qrAgeMs: this.qrGeneratedAt ? Date.now() - this.qrGeneratedAt : null,
      uptimeSec: Math.floor((Date.now() - this.metrics.startTime) / 1000),
    };
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    try {
      const result = await this.client.sendMessage(chatId, message);
      this.metrics.messagesSent++;
      return result;
    } catch (err) {
      log("error", "send_message_failure", { chatId, error: err.message });
      throw err;
    }
  }

  async requestPairingCode(phone) {
    if (this.isReady) throw new Error("Already connected");
    if (!this.client) throw new Error("Client not initialized");
    return await this.client.requestPairingCode(phone);
  }
}

module.exports = new WhatsAppService();
