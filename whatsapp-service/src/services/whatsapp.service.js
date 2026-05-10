const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const config = require("../config");
const log = require("../utils/logger");

// Runtime Version Diagnostic
const pkg = require("../../package.json");
log("info", "dependency_versions", {
  "whatsapp-web.js": require("whatsapp-web.js/package.json").version,
  "wwebjs-mongo": require("wwebjs-mongo/package.json").version,
  "mongodb": require("mongodb/package.json").version,
  "mongoose": require("mongoose/package.json").version,
  "puppeteer": require("puppeteer/package.json").version,
  package_json: pkg.dependencies
});

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.latestQr = null;
    this.qrGeneratedAt = null;
    this.store = null;

    // Single-instance guards
    this.isInitializing = false;
    this.reconnectTimer = null;
    this.reconnectAttempt = 0;

    // Session state
    this.sessionState = "idle";
    this.sessionSaved = false;
    this.syncInProgress = false;
    this.wasAuthenticatedThisSession = false;

    // Memory monitor handle
    this.memoryMonitorInterval = null;

    this._logMemory("service_constructor");
  }

  _logMemory(event, meta = {}) {
    const mem = process.memoryUsage();
    const stats = {
      rssMB: Math.floor(mem.rss / 1024 / 1024),
      heapUsedMB: Math.floor(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.floor(mem.heapTotal / 1024 / 1024),
      externalMB: Math.floor(mem.external / 1024 / 1024),
      arrayBuffersMB: Math.floor(mem.arrayBuffers / 1024 / 1024),
      pid: process.pid,
      uptimeSec: Math.floor(process.uptime()),
    };

    log("info", "memory_diagnostic", { event, ...stats, ...meta });

    if (stats.rssMB > 400) {
      log("warn", "memory_critical_warning", { event, rssMB: stats.rssMB });
    } else if (stats.rssMB > 300) {
      log("warn", "memory_pressure_warning", { event, rssMB: stats.rssMB });
    }
  }

  _triggerGC(event) {
    if (global.gc) {
      log("info", "manual_gc_start", { event });
      global.gc();
      this._logMemory(`post_gc_${event}`);
    }
  }

  // ── Initialization ──────────────────────────────────────────────────────────
  async initialize(source = "unknown") {
    this._logMemory("initialization_start", { source });

    if (this.client || this.isInitializing) {
      log("warn", "duplicate_init_blocked", { source, hasClient: !!this.client, isInitializing: this.isInitializing });
      return;
    }

    this.isInitializing = true;
    this.sessionState = "launching";
    this.wasAuthenticatedThisSession = false;
    log("info", "whatsapp_init_start", { source });

    try {
      await this._connectMongo();
      this._createClient();
      
      this._logMemory("client_launch_pre_init");
      await this.client.initialize();
      
      const browserPid = this.client.puppeteer?.process()?.pid;
      this._logMemory("client_launch_post_init", { chromium_pid: browserPid });

      this.isInitializing = false;
    } catch (err) {
      log("error", "whatsapp_init_failure", { error: err.message, source });
      this.isInitializing = false;
      this.sessionState = "error";
      this._scheduleReconnect("init_failure");
    }
  }

  async _connectMongo() {
    if (mongoose.connection.readyState === 1 && this.store) return;

    if (!config.MONGODB_URI) throw new Error("MONGODB_URI not configured");

    log("info", "connecting_mongodb", { pid: process.pid });
    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 5,
    });

    const db = mongoose.connection.db;
    
    // Cleanup malformed collections
    const collections = await db.listCollections().toArray();
    const malformed = collections.filter(c => 
      c.name.includes("/opt/render/") || 
      c.name.includes(".wwebjs_auth") || 
      c.name.includes("RemoteAuth-")
    );

    if (malformed.length > 0) {
      log("info", "cleanup_malformed_collections_start", { count: malformed.length });
      for (const coll of malformed) {
        await db.dropCollection(coll.name).catch(() => {});
      }
    }

    this.store = new MongoStore({ mongoose });
    log("info", "mongodb_connected", { 
      activeCollections: (await db.listCollections().toArray()).map(c => c.name) 
    });
  }

  _createClient() {
    const puppeteerOptions = {
      headless: true,
      args: [
        ...config.puppeteerArgs,
        "--disable-extensions",
        "--disable-component-update",
        "--disable-features=Translate",
        "--disable-background-networking",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-breakpad",
        "--disable-client-side-phishing-detection",
        "--disable-default-apps",
        "--disable-hang-monitor",
        "--disable-ipc-flooding-protection",
        "--disable-notifications",
        "--disable-prompt-on-repost",
        "--disable-renderer-backgrounding",
        "--disable-sync",
        "--password-store=basic",
        "--use-gl=swiftshader",
        "--js-flags=--max-old-space-size=200",
      ],
    };

    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
    }

    const authStrategy = new RemoteAuth({
      clientId: "main",
      store: this.store,
      backupSyncIntervalMs: 300000,
    });

    authStrategy.sessionName = "main";

    // ── TASK 4: RemoteAuth Execution Tracing (Monkey-patching) ──
    if (this.store && typeof this.store.save === "function") {
      const originalSave = this.store.save.bind(this.store);
      this.store.save = async (...args) => {
        log("info", "remoteauth_trace_store_save_started", { argsLength: args.length });
        const start = Date.now();
        try {
          await originalSave(...args);
          log("info", "remoteauth_trace_store_save_success", { duration_ms: Date.now() - start });
        } catch (err) {
          log("error", "remoteauth_trace_store_save_error", { error: err.message });
          throw err;
        }
      };
    }

    // Wrap compressSession if it exists
    if (typeof authStrategy.compressSession === "function") {
      const originalCompress = authStrategy.compressSession.bind(authStrategy);
      authStrategy.compressSession = async () => {
        log("info", "remoteauth_trace_compress_started");
        const start = Date.now();
        await originalCompress();
        log("info", "remoteauth_trace_compress_success", { duration_ms: Date.now() - start });
      };
    }

    // The backup() method might be added dynamically or exist on prototype. We wrap it later in authenticated event if it appears, or try now if it exists.
    if (typeof authStrategy.backup === "function") {
      const originalBackup = authStrategy.backup.bind(authStrategy);
      authStrategy.backup = async () => {
        log("info", "remoteauth_trace_backup_started");
        try {
          await originalBackup();
          log("info", "remoteauth_trace_backup_success");
        } catch (err) {
          log("error", "remoteauth_trace_backup_error", { error: err.message });
          throw err;
        }
      };
    }

    this.client = new Client({
      authStrategy,
      puppeteer: puppeteerOptions,
      qrMaxRetries: 15,
      authTimeoutMs: 300_000,
    });

    this.client.removeAllListeners();
    this._attachListeners();
  }

  async _destroyClient() {
    this._logMemory("client_destroy_start");
    
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }

    if (!this.client) return;
    const c = this.client;
    this.client = null;
    this.isReady = false;
    this.latestQr = null;

    try {
      c.removeAllListeners();
      await c.destroy();
    } catch (err) {
      log("warn", "client_destroy_error", { error: err.message });
    }

    this._triggerGC("after_client_destroy");
  }

  // ── Event Listeners ─────────────────────────────────────────────────────────
  _attachListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrGeneratedAt = Date.now();
      this.sessionState = "awaiting_qr_scan";
      this._logMemory("qr_generated");
    });

    this.client.on("authenticated", () => {
      // ── TASK 3: Auth Flow Timing ──
      const authDurationS = this.qrGeneratedAt ? ((Date.now() - this.qrGeneratedAt) / 1000).toFixed(2) : "unknown";
      
      this.sessionState = "authenticated";
      this.wasAuthenticatedThisSession = true;
      this.latestQr = null;
      this.qrGeneratedAt = null;
      this.syncInProgress = true;
      this.authCompleteAt = Date.now(); // Track when auth finished
      
      log("info", "remote_session_save_started", { 
        pid: process.pid,
        auth_duration_seconds: authDurationS
      });
      this._logMemory("authenticated");

      // Check if backup method was added dynamically and trace it
      if (this.client.authStrategy && typeof this.client.authStrategy.backup === "function" && !this.client.authStrategy.backup.isWrapped) {
        const originalBackup = this.client.authStrategy.backup.bind(this.client.authStrategy);
        this.client.authStrategy.backup = async () => {
          log("info", "remoteauth_trace_backup_started_dynamic");
          try {
            await originalBackup();
            log("info", "remoteauth_trace_backup_success_dynamic");
          } catch (err) {
            log("error", "remoteauth_trace_backup_error_dynamic", { error: err.message });
            throw err;
          }
        };
        this.client.authStrategy.backup.isWrapped = true;
      }

      // Fallback: Trigger RemoteAuth backup if it hasn't started within 5s
      setTimeout(async () => {
        if (this.syncInProgress && this.client?.authStrategy?.backup) {
          log("info", "triggering_manual_remote_backup", {});
          try {
            await this.client.authStrategy.backup();
          } catch (err) {
            log("error", "manual_backup_failed", { error: err.message });
          }
        }
      }, 5000);
    });

    this.client.on("remote_session_saved", () => {
      // ── TASK 3: Save Flow Timing ──
      const saveDurationS = this.authCompleteAt ? ((Date.now() - this.authCompleteAt) / 1000).toFixed(2) : "unknown";

      this.sessionState = "saved";
      this.sessionSaved = true;
      this.syncInProgress = false;
      log("info", "remote_session_saved", { 
        clientId: "main",
        save_duration_seconds: saveDurationS
      });
      this._logMemory("remote_session_saved");
      this._verifySessionSync();
      this._triggerGC("after_sync");
    });

    this.client.on("auth_failure", (msg) => {
      this.isReady = false;
      log("error", "auth_failure", { message: msg });
      this._logMemory("auth_failure");
      this._scheduleReconnect("auth_failure");
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.sessionState = "ready";
      this.isInitializing = false;
      this.reconnectAttempt = 0;

      // Restoration Detection: If 'ready' fires without 'authenticated', it was restored from Mongo
      if (!this.wasAuthenticatedThisSession) {
        log("info", "remote_session_restored", { clientId: "main" });
      }

      this._logMemory("ready", { pushname: this.client.info?.pushname });
      this._startMemoryMonitor();
      this._triggerGC("after_ready");
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this._logMemory("disconnected", { reason });
      
      if (reason === "Max qrcode retries reached") {
        this.sessionState = "awaiting_qr_scan";
        return; 
      }

      this.sessionState = "disconnected";
      this._scheduleReconnect("disconnected");
    });
  }

  // ── RemoteAuth Persistence Verification ─────────────────────────────────────
  _verifySessionSync() {
    if (mongoose.connection.readyState !== 1) return;
    const db = mongoose.connection.db;

    Promise.all([
      db.collection("whatsapp-main.files").countDocuments(),
      db.collection("whatsapp-sessions").findOne({ id: "main" }),
    ])
      .then(([filesCount, metaDoc]) => {
        if (!filesCount || !metaDoc) {
          log("error", "remote_session_save_failed", { filesCount, hasMeta: !!metaDoc });
        } else {
          log("info", "session_persistence_confirmed", { filesFound: filesCount });
        }
      })
      .catch((err) => {
        log("error", "remote_session_restore_failed", { error: err.message });
      });
  }

  _startMemoryMonitor() {
    if (this.memoryMonitorInterval) return;
    this.memoryMonitorInterval = setInterval(() => {
      this._logMemory("periodic_monitor");
    }, 5 * 60 * 1000);
  }

  _scheduleReconnect(reason) {
    if (this.isInitializing || this.reconnectTimer) return;

    if (this.reconnectAttempt >= config.MAX_RECONNECT_ATTEMPTS) {
      log("error", "max_reconnect_attempts_reached", { attempts: this.reconnectAttempt });
      this.sessionState = "error";
      return;
    }

    this.reconnectAttempt++;
    const delay = Math.min(30_000 * this.reconnectAttempt, 300_000);
    this._logMemory("reconnect_scheduled", { reason, delay });

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this._destroyClient();
      await this.initialize("reconnect");
    }, delay);
  }

  async destroy(source = "unknown") {
    this._logMemory("shutdown_start", { source });
    
    if (this.syncInProgress) {
      log("info", "shutdown_waiting_for_sync", { timeout: "15s" });
      let waited = 0;
      while (this.syncInProgress && waited < 15000) {
        await new Promise((r) => setTimeout(r, 500));
        waited += 500;
      }
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    await this._destroyClient();

    if (mongoose.connection.readyState === 1) {
      try { 
        log("info", "disconnecting_mongodb");
        await mongoose.disconnect(); 
      } catch (_) {}
    }

    this._logMemory("shutdown_complete");
  }

  getStatus() {
    const ageSeconds = this.qrGeneratedAt ? Math.floor((Date.now() - this.qrGeneratedAt) / 1000) : null;
    const mem = process.memoryUsage();
    return {
      status: this.isReady ? "ready" : this.isInitializing ? "initializing" : "not_ready",
      isReady: this.isReady,
      sessionState: this.sessionState,
      reconnectAttempt: this.reconnectAttempt,
      hasQr: !!this.latestQr,
      qr_age_seconds: ageSeconds,
      uptimeSec: Math.floor(process.uptime()),
      memory: {
        rssMB: Math.floor(mem.rss / 1024 / 1024),
        heapUsedMB: Math.floor(mem.heapUsed / 1024 / 1024),
      },
    };
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    return await this.client.sendMessage(chatId, message);
  }

  async requestPairingCode(phone) {
    if (this.isReady) throw new Error("Already connected");
    if (!this.client) throw new Error("Client not initialized");
    return await this.client.requestPairingCode(phone);
  }
}

module.exports = new WhatsAppService();
