const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
const config = require("../config");
const log = require("../utils/logger");

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

    // Memory monitor handle (started on ready, cleared on destroy)
    this.memoryMonitorInterval = null;
  }

  // ── Initialization ──────────────────────────────────────────────────────────
  async initialize(source = "unknown") {
    // Hard guard: no duplicate clients or concurrent initialization
    if (this.client || this.isInitializing) {
      return;
    }

    this.isInitializing = true;
    this.sessionState = "launching";
    log("info", "whatsapp_init_start", { source });

    try {
      await this._connectMongo();
      this._createClient();
      await this.client.initialize();
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

    await mongoose.connect(config.MONGODB_URI, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 45000,
    });

    const db = mongoose.connection.db;
    
    // 1. Automatic Cleanup: Delete all malformed collections
    const collections = await db.listCollections().toArray();
    const malformed = collections.filter(c => 
      c.name.includes("/opt/render/") || 
      c.name.includes(".wwebjs_auth") || 
      c.name.includes("RemoteAuth-")
    );

    if (malformed.length > 0) {
      log("info", "cleanup_malformed_collections_start", { count: malformed.length });
      for (const coll of malformed) {
        await db.dropCollection(coll.name);
        log("info", "malformed_collection_dropped", { name: coll.name });
      }
    }

    // 2. Namespace Validation Guard
    const finalCollections = await db.listCollections().toArray();
    const invalid = finalCollections.find(c => c.name.includes("/") || c.name.includes(".wwebjs_auth"));
    if (invalid) {
      log("fatal", "invalid_remoteauth_namespace", { sample: invalid.name });
      process.exit(1);
    }

    this.store = new MongoStore({ mongoose });
    log("info", "mongodb_connected", { 
      activeCollections: finalCollections.map(c => c.name) 
    });
  }

  _createClient() {
    const puppeteerOptions = {
      headless: true,
      args: config.puppeteerArgs,
    };

    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
    }

    const authStrategy = new RemoteAuth({
      clientId: "main",
      store: this.store,
      backupSyncIntervalMs: 300000,
    });

    // CRITICAL: Override the forced 'RemoteAuth-' prefix to ensure clean 
    // GridFS collections (whatsapp-main.files/chunks)
    authStrategy.sessionName = "main";

    this.client = new Client({
      authStrategy,
      puppeteer: puppeteerOptions,
      qrMaxRetries: 3,
      authTimeoutMs: 60_000,
    });

    this.client.removeAllListeners();
    this._attachListeners();
  }

  async _destroyClient() {
    // Stop memory monitor before tearing down the client
    if (this.memoryMonitorInterval) {
      clearInterval(this.memoryMonitorInterval);
      this.memoryMonitorInterval = null;
    }

    if (!this.client) return;
    const c = this.client;
    this.client = null;
    this.isReady = false;
    try {
      c.removeAllListeners();
      await c.destroy();
    } catch (_) {}
  }

  // ── Event Listeners ─────────────────────────────────────────────────────────
  _attachListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrGeneratedAt = Date.now();
      this.sessionState = "qr";
      log("info", "qr_generated", {});
    });

    this.client.on("authenticated", () => {
      this.sessionState = "authenticated";
      this.latestQr = null;
      this.qrGeneratedAt = null;
      log("info", "authenticated", {});
    });

    this.client.on("remote_session_saved", () => {
      this.sessionSaved = true;
      log("info", "remote_session_saved", {});
      // Lightweight post-sync verification — logs an error if GridFS/metadata is missing
      this._verifySessionSync();
    });

    this.client.on("auth_failure", (msg) => {
      this.isReady = false;
      log("error", "auth_failure", { message: msg });
      this._scheduleReconnect("auth_failure");
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.sessionState = "ready";
      this.isInitializing = false;
      this.reconnectAttempt = 0;
      log("info", "ready", { pushname: this.client.info?.pushname });
      this._startMemoryMonitor();
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.sessionState = "disconnected";
      log("warn", "disconnected", { reason });
      this._scheduleReconnect("disconnected");
    });
  }

  // ── RemoteAuth Persistence Verification ─────────────────────────────────────
  // Called after every remote_session_saved. Verifies GridFS files and metadata
  // exist in MongoDB. Logs an error if either is missing — always visible in prod.
  _verifySessionSync() {
    if (mongoose.connection.readyState !== 1) return;
    const db = mongoose.connection.db;

    Promise.all([
      db.collection("whatsapp-main.files").countDocuments(),
      db.collection("whatsapp-sessions").findOne({ id: "main" }),
    ])
      .then(([filesCount, metaDoc]) => {
        if (!filesCount || !metaDoc) {
          log("error", "remote_session_save_failed", {
            filesCount,
            hasMeta: !!metaDoc,
          });
        } else if (config.DEBUG_WHATSAPP) {
          log("debug", "session_sync_verified", { filesCount });
        }
      })
      .catch((err) => {
        log("error", "remote_session_save_failed", { error: err.message });
      });
  }

  // ── Memory Pressure Monitor ──────────────────────────────────────────────────
  // Runs every 5 minutes while the client is active. Emits a warning (always
  // visible in prod) if RSS exceeds 350 MB. Does NOT auto-restart.
  _startMemoryMonitor() {
    if (this.memoryMonitorInterval) return; // already running
    this.memoryMonitorInterval = setInterval(() => {
      const mem = process.memoryUsage();
      if (mem.rss > 350 * 1024 * 1024) {
        log("warn", "memory_pressure_warning", {
          rss: Math.floor(mem.rss / 1024 / 1024),
          heapUsed: Math.floor(mem.heapUsed / 1024 / 1024),
          heapTotal: Math.floor(mem.heapTotal / 1024 / 1024),
        });
      }
    }, 5 * 60 * 1000);
  }

  // ── Reconnection ────────────────────────────────────────────────────────────
  _scheduleReconnect(reason) {
    // Prevent reconnect storms: skip if already initializing or a timer is pending
    if (this.isInitializing || this.reconnectTimer) return;

    if (this.reconnectAttempt >= config.MAX_RECONNECT_ATTEMPTS) {
      log("error", "max_reconnect_attempts_reached", { attempts: this.reconnectAttempt });
      this.sessionState = "error";
      return;
    }

    this.reconnectAttempt++;
    // Simple linear backoff: 30s, 60s, 90s … capped at 5 minutes
    const delay = Math.min(30_000 * this.reconnectAttempt, 300_000);

    if (config.DEBUG_WHATSAPP) {
      log("debug", "reconnect_scheduled", { reason, attempt: this.reconnectAttempt, delayMs: delay });
    }

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      await this._destroyClient();
      await this.initialize("reconnect");
    }, delay);
  }

  // ── Graceful Shutdown ───────────────────────────────────────────────────────
  async destroy(source = "unknown") {
    // Wait for any pending RemoteAuth sync before tearing down (up to 15s).
    // Covers: (a) first-time QR auth before ready, (b) re-auth after reconnect.
    // Mongo is disconnected AFTER this wait to guarantee sync completes first.
    if (this.client && !this.sessionSaved) {
      let waited = 0;
      while (!this.sessionSaved && waited < 15000) {
        await new Promise((r) => setTimeout(r, 500));
        waited += 500;
      }
      if (!this.sessionSaved) {
        log("warn", "shutdown_sync_timeout", {});
      }
    }

    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // _destroyClient also clears memoryMonitorInterval
    await this._destroyClient();

    // Mongo disconnect is intentionally AFTER client destroy and sync wait
    if (mongoose.connection.readyState === 1) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }

  // ── Status & API ────────────────────────────────────────────────────────────
  getStatus() {
    return {
      status: this.isReady ? "ready" : this.isInitializing ? "initializing" : "not_ready",
      isReady: this.isReady,
      sessionState: this.sessionState,
      reconnectAttempt: this.reconnectAttempt,
      hasQr: !!this.latestQr,
      qrAgeMs: this.qrGeneratedAt ? Date.now() - this.qrGeneratedAt : null,
      uptimeSec: Math.floor(process.uptime()),
      memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
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
