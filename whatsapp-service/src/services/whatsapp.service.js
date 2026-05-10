const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const log = require("../utils/logger");

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
    this.cacheCleanupInterval = null;

    this.metrics = {
      qrGenerations: 0,
      reconnects: 0,
      messagesSent: 0,
      startTime: Date.now(),
    };

    this.sessionState = "idle";
    this.browserState = "none";
  }

  // ── Initialization ─────────────────────────────────────────────────────────
  async initialize(source = "unknown") {
    if (this.initializing) {
      log("warn", "whatsapp_init_skipped", { 
        reason: "already_initializing", 
        source,
        pid: config.PID 
      });
      return;
    }

    if (this.isReady && this.client) {
      log("info", "whatsapp_init_skipped", { 
        reason: "already_ready", 
        source,
        pid: config.PID 
      });
      return;
    }

    this.initializing = true;
    this.sessionState = "launching";
    log("info", "whatsapp_init_start", { source, pid: config.PID });

    try {
      // 1. Ensure auth directory exists (especially on Render persistent disk)
      if (!fs.existsSync(config.AUTH_DIR)) {
        log("info", "creating_auth_dir", { path: config.AUTH_DIR });
        fs.mkdirSync(config.AUTH_DIR, { recursive: true });
      }

      // 2. Clear old client if exists
      await this._destroyClient("initialization");

      // 3. Create fresh client
      this._createClient(source);

      // 4. Launch browser
      this.browserState = "launching";
      log("info", "browser_launch_start", { source, pid: config.PID });
      await this.client.initialize();
      
      this.initializing = false;
    } catch (err) {
      log("error", "whatsapp_init_failure", { 
        error: err.message, 
        source, 
        pid: config.PID 
      });
      this.initializing = false;
      this.sessionState = "error";
      this.browserState = "error";
      this.scheduleReconnect("init_failure");
    }
  }

  _createClient(source) {
    log("info", "client_creation", { 
      clientId: "main", 
      dataPath: config.AUTH_DIR,
      source 
    });
    
    const puppeteerOptions = {
      headless: true,
      protocolTimeout: 180_000,
      defaultViewport: null,
      args: config.puppeteerArgs,
    };

    // Use executablePath on Render
    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
      log("info", "using_custom_executable_path", { path: config.chromePath });
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        clientId: "main",
        dataPath: config.AUTH_DIR,
      }),
      puppeteer: puppeteerOptions,
      qrMaxRetries: 3,
      authTimeoutMs: 60_000,
    });

    this._attachListeners();
  }

  async _destroyClient(source = "unknown") {
    if (this.client) {
      log("info", "destroying_client", { source, pid: config.PID });
      try {
        this.client.removeAllListeners();
        // Force close browser if possible to prevent zombies
        if (this.client.pupBrowser) {
          await this.client.pupBrowser.close().catch(() => {});
        }
        await this.client.destroy();
      } catch (err) {
        log("warn", "client_destroy_error", { error: err.message, source });
      }
      this.client = null;
    }
    
    // Clear intervals
    if (this.cacheCleanupInterval) {
      clearInterval(this.cacheCleanupInterval);
      this.cacheCleanupInterval = null;
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
      log("info", "qr_generated", { 
        pid: config.PID, 
        attempt: this.metrics.qrGenerations 
      });
    });

    this.client.on("authenticated", () => {
      this.sessionState = "authenticated";
      this.latestQr = null;
      this.qrGeneratedAt = null;
      log("info", "authenticated", { pid: config.PID });
    });

    this.client.on("auth_failure", (msg) => {
      this.sessionState = "error";
      this.isReady = false;
      log("error", "auth_failure", { message: msg, pid: config.PID });
      this.scheduleReconnect("auth_failure");
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.sessionState = "ready";
      this.browserState = "open";
      this.reconnectAttempt = 0;
      this.reconnecting = false;
      log("info", "ready", { 
        pid: config.PID,
        pushname: this.client.info?.pushname 
      });

      this._setupIntervals();
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.sessionState = "disconnected";
      this.browserState = "closed";
      log("warn", "disconnected", { reason, pid: config.PID });
      this.scheduleReconnect("disconnected");
    });
  }

  _setupIntervals() {
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);
    this.cacheCleanupInterval = setInterval(() => {
      this._cleanupMemory();
    }, config.CACHE_CLEANUP_INTERVAL);
  }

  // ── Reconnection Logic ─────────────────────────────────────────────────────
  scheduleReconnect(reason) {
    if (this.reconnecting || this.initializing) {
      log("info", "reconnect_skipped", { 
        reason, 
        reconnecting: this.reconnecting, 
        initializing: this.initializing 
      });
      return;
    }
    
    if (this.reconnectAttempt >= config.MAX_RECONNECT_ATTEMPTS) {
      log("fatal", "max_reconnect_attempts_reached", { 
        attempts: this.reconnectAttempt,
        pid: config.PID 
      });
      this.sessionState = "error";
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempt++;
    this.metrics.reconnects++;
    this.sessionState = "reconnecting";

    const delay = this._calculateReconnectDelay();
    log("info", "reconnect_scheduled", { 
      reason, 
      attempt: this.reconnectAttempt, 
      delayMs: delay,
      pid: config.PID
    });

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(async () => {
      this.reconnecting = false;
      this.lastReconnectTime = Date.now();
      await this.initialize("reconnect");
    }, delay);
  }

  _calculateReconnectDelay() {
    const base = config.RECONNECT_BASE_DELAY_MS;
    const jitter = Math.floor(Math.random() * config.RECONNECT_JITTER_MS);
    const exponential = Math.pow(2, Math.min(this.reconnectAttempt - 1, 4)) * 1000;
    return Math.min(base + exponential + jitter, config.RECONNECT_MAX_DELAY_MS);
  }

  // ── Memory & Cleanup ───────────────────────────────────────────────────────
  async _cleanupMemory() {
    try {
      if (global.gc) global.gc();
      const mem = process.memoryUsage();
      log("info", "memory_cleanup", {
        rssMB: Math.floor(mem.rss / 1024 / 1024),
        heapMB: Math.floor(mem.heapUsed / 1024 / 1024),
        pid: config.PID
      });
    } catch (err) {
      log("warn", "memory_cleanup_error", { error: err.message });
    }
  }

  async destroy(source = "unknown") {
    log("info", "whatsapp_destroy_start", { source, pid: config.PID });
    
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

    await this._destroyClient(source);
    log("info", "whatsapp_destroy_complete", { source, pid: config.PID });
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
      pid: config.PID
    };
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    try {
      const result = await this.client.sendMessage(chatId, message);
      this.metrics.messagesSent++;
      return result;
    } catch (err) {
      log("error", "send_message_failure", { chatId, error: err.message, pid: config.PID });
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
