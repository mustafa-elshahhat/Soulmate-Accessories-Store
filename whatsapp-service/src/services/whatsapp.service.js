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
    // Client reference — null until first initialize() call.
    this.client = null;

    // Readiness / QR state.
    this.isReady = false;
    this.latestQr = null;
    this.qrGeneratedAt = null;   // Date.now() when the current QR was generated.

    // Lifecycle flags.
    this.initializing = false;
    this.reconnecting = false;
    this.reconnectTimer = null;

    // Interval handles.
    this.backupInterval = null;
    this.cacheCleanupInterval = null;

    // Counters / metrics.
    this.qrCount = 0;
    this.reconnectAttempt = 0;
    this.lastReconnectTime = 0;
    this.metrics = {
      qrGenerations: 0,
      reconnects: 0,
      restorations: 0,
      backups: 0,
      messagesSent: 0,
      startTime: Date.now(),
    };

    // Human-readable state labels exposed on /status.
    // idle | restoring | launching | qr | authenticated | ready
    // | disconnected | reconnecting | error
    this.sessionState = "idle";
    // none | launching | open | closed | error
    this.browserState = "none";

    // Startup diagnostics — log Chrome path availability immediately so the
    // very first lines of the Render log tell us whether the build worked.
    this._logBrowserDiagnostics();
  }

  // ── Startup diagnostics ────────────────────────────────────────────────────
  _logBrowserDiagnostics() {
    if (!config.chromePath) {
      log("error", "browser_path_unresolved", {
        hint: "puppeteer.executablePath() returned undefined — check .puppeteerrc.cjs",
      });
      return;
    }
    const exists = fs.existsSync(config.chromePath);
    log(exists ? "info" : "error", "browser_path_resolved", {
      path: config.chromePath,
      exists,
      ...(exists
        ? {}
        : { hint: "Chrome binary missing — npm run build did not complete successfully" }),
    });
  }

  // ── Browser validation ─────────────────────────────────────────────────────
  // Called at the start of every initialize() so failures are caught early and
  // produce an actionable log entry rather than an opaque Puppeteer error.
  _validateBrowser() {
    if (!config.chromePath) {
      throw new Error(
        "Chrome path could not be resolved — check Puppeteer configuration and .puppeteerrc.cjs"
      );
    }
    if (!fs.existsSync(config.chromePath)) {
      throw new Error(
        `Chrome executable not found at: ${config.chromePath}\n` +
          "The Render build step (npm run build) did not install Chrome. " +
          "Check build logs for PUPPETEER_SKIP_DOWNLOAD or network errors."
      );
    }
  }

  // ── Client factory ─────────────────────────────────────────────────────────
  // Creates a fresh Client instance on every initialize() attempt so stale
  // Puppeteer state from a failed attempt cannot contaminate the next one.
  _createClient() {
    if (this.client) {
      try { this.client.removeAllListeners(); } catch {}
      this.client = null;
    }

    this.client = new Client({
      authStrategy: new LocalAuth({ dataPath: config.AUTH_DIR }),
      puppeteer: {
        headless: true,
        executablePath: config.chromePath,
        protocolTimeout: 180_000,
        defaultViewport: null,
        args: config.puppeteerArgs,
      },
      qrMaxRetries: 3,
    });

    this._attachListeners();
  }

  // ── Event listeners ────────────────────────────────────────────────────────
  _attachListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrGeneratedAt = Date.now();
      this.qrCount++;
      this.metrics.qrGenerations++;
      this.sessionState = "qr";
      log("info", "qr_generated", { qrCount: this.qrCount });
    });

    this.client.on("authenticated", () => {
      this.latestQr = null;
      this.qrGeneratedAt = null;
      this.qrCount = 0;
      this.sessionState = "authenticated";
      log("info", "whatsapp_authenticated");
      backupSession().catch((err) =>
        log("error", "auth_backup_failed", { error: err.message })
      );
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.latestQr = null;
      this.qrGeneratedAt = null;
      this.qrCount = 0;
      this.reconnecting = false;
      this.reconnectAttempt = 0;
      this.sessionState = "ready";
      this.browserState = "open";
      log("info", "whatsapp_ready");

      if (this.backupInterval) clearInterval(this.backupInterval);
      this.backupInterval = setInterval(() => {
        this.metrics.backups++;
        backupSession().catch((err) =>
          log("error", "scheduled_backup_failed", { error: err.message })
        );
      }, config.BACKUP_INTERVAL);

      this._startCacheCleanup();
    });

    this.client.on("auth_failure", (msg) => {
      this.isReady = false;
      this.sessionState = "error";
      this.browserState = "closed";
      if (this.backupInterval) clearInterval(this.backupInterval);
      log("error", "auth_failure", { msg });
      clearLocalSession();
      this.scheduleReconnect("auth_failure");
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.sessionState = "disconnected";
      this.browserState = "closed";
      if (this.backupInterval) clearInterval(this.backupInterval);
      log("warn", "whatsapp_disconnected", { reason });
      this.scheduleReconnect("disconnected");
    });
  }

  // ── Initialize ─────────────────────────────────────────────────────────────
  async initialize() {
    if (this.initializing) {
      log("info", "whatsapp_init_skipped", { reason: "already_initializing" });
      return;
    }
    this.initializing = true;
    log("info", "whatsapp_init_start");

    try {
      // 1. Validate Chrome exists (fast, no side effects).
      this._validateBrowser();
      log("info", "browser_validated", { path: config.chromePath });

      // 2. Restore session from backend if no local session exists.
      this.sessionState = "restoring";
      try {
        const restored = await restoreSession();
        if (restored) this.metrics.restorations++;
      } catch (restoreErr) {
        log("warn", "session_restore_error", { error: restoreErr.message });
      }

      // 3. Create a fresh Client and launch the browser.
      this.sessionState = "launching";
      this.browserState = "launching";
      this._createClient();

      log("info", "browser_launch_start");
      await this.client.initialize();
      this.browserState = "open";
      log("info", "browser_launch_success");
    } catch (err) {
      this.browserState = "error";
      this.sessionState = "error";

      const isChromeError =
        /executablePath|not found|Chrome|Chromium|ENOENT/i.test(err.message || "");

      log("error", "whatsapp_init_failure", {
        error: err.message,
        isChromeError,
        ...(isChromeError && {
          hint: "Chrome binary missing — verify npm run build in Render build logs",
        }),
      });

      this.initializing = false;
      this.scheduleReconnect("init_error");
      return;
    }

    this.initializing = false;
  }

  // ── Reconnect ──────────────────────────────────────────────────────────────
  scheduleReconnect(reason) {
    if (this.reconnecting || this.initializing) {
      log("info", "reconnect_skipped", {
        reason,
        reconnecting: this.reconnecting,
        initializing: this.initializing,
      });
      return;
    }

    const timeSince = Date.now() - this.lastReconnectTime;
    if (timeSince < config.RECONNECT_BASE_DELAY_MS) {
      log("info", "reconnect_skipped", {
        reason,
        cooldownRemainingMs: config.RECONNECT_BASE_DELAY_MS - timeSince,
      });
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempt++;
    this.metrics.reconnects++;
    this.sessionState = "reconnecting";

    const delay = this._getReconnectDelay();
    log("info", "reconnect_scheduled", {
      reason,
      delayMs: delay,
      attempt: this.reconnectAttempt,
    });

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = setTimeout(async () => {
      this.lastReconnectTime = Date.now();
      this.reconnecting = false;
      await this.initialize();
    }, delay);
  }

  _getReconnectDelay() {
    const jitter = Math.floor(Math.random() * config.RECONNECT_JITTER_MS);
    return Math.min(
      config.RECONNECT_BASE_DELAY_MS + (this.reconnectAttempt - 1) * 15_000 + jitter,
      config.RECONNECT_MAX_DELAY_MS
    );
  }

  // ── Memory management ──────────────────────────────────────────────────────
  _startCacheCleanup() {
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);
    this.cacheCleanupInterval = setInterval(
      () => this._cleanupMemory(),
      config.CACHE_CLEANUP_INTERVAL
    );
  }

  async _cleanupMemory() {
    const safeDirs = [
      "GPUCache", "DawnCache", "GrShaderCache", "ShaderCache",
      "blob_storage", "Code Cache", "optimization_guide",
    ];
    let cleaned = 0;
    for (const dir of safeDirs) {
      const fullPath = path.join(config.SESSION_DIR, "Default", dir);
      try {
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          cleaned++;
        }
      } catch {}
    }
    if (global.gc) global.gc();
    const mem = process.memoryUsage();
    log("info", "memory_cleanup", {
      rssMB: Math.floor(mem.rss / 1024 / 1024),
      heapMB: Math.floor(mem.heapUsed / 1024 / 1024),
      cleaned,
    });
  }

  // ── Graceful destroy ───────────────────────────────────────────────────────
  async destroy() {
    log("info", "graceful_shutdown_start");

    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

    try {
      await Promise.race([
        backupSession(),
        new Promise((_, rej) =>
          setTimeout(() => rej(new Error("backup timeout")), 10_000)
        ),
      ]);
    } catch (err) {
      log("warn", "shutdown_backup_failed", { error: err.message });
    }

    if (this.client) {
      try {
        await this.client.destroy();
        log("info", "browser_closed");
      } catch (err) {
        log("warn", "browser_close_failed", { error: err.message });
      }
    }

    log("info", "graceful_shutdown_complete");
  }

  // ── Status / Public API ────────────────────────────────────────────────────
  getStatus() {
    const mem = process.memoryUsage();
    return {
      status: this.isReady ? "ready" : this.initializing ? "initializing" : "not_ready",
      isReady: this.isReady,
      initializing: this.initializing,
      reconnecting: this.reconnecting,
      sessionState: this.sessionState,
      browserState: this.browserState,
      hasQr: !!this.latestQr,
      qrAgeMs: this.qrGeneratedAt ? Date.now() - this.qrGeneratedAt : null,
      memMB: Math.floor(mem.rss / 1024 / 1024),
      uptimeSec: Math.floor((Date.now() - this.metrics.startTime) / 1000),
      reconnectAttempt: this.reconnectAttempt,
      metrics: this.metrics,
    };
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    const result = await this.client.sendMessage(chatId, message);
    this.metrics.messagesSent++;
    return result;
  }

  async requestPairingCode(phone) {
    if (this.isReady) throw new Error("Already connected — no pairing needed");
    if (!this.latestQr) throw new Error("QR not yet generated — wait for initialization");
    try {
      const code = await this.client.requestPairingCode(phone, true);
      return code;
    } catch (err) {
      if (err.message?.includes("onCodeReceivedEvent")) {
        throw new Error("Pairing code unavailable in this WhatsApp version — use QR instead");
      }
      throw new Error(`Failed to request pairing code: ${err.message}`);
    }
  }
}

module.exports = new WhatsAppService();
