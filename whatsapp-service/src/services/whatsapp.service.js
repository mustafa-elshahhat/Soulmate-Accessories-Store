const { Client, RemoteAuth } = require("whatsapp-web.js");
const { MongoStore } = require("wwebjs-mongo");
const mongoose = require("mongoose");
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
    this.store = null;

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
      // 1. Connect to MongoDB and initialize Store
      await this._connectMongo();

      // 2. Explicitly verify session existence
      const sessionExists = await this._verifyRemoteSession();
      if (sessionExists) {
        log("info", "remote_session_exists", { clientId: "main", pid: config.PID });
      } else {
        log("info", "remote_session_not_found", { clientId: "main", pid: config.PID });
      }

      // 3. Clear old client if exists
      await this._destroyClient("initialization");

      // 4. Create fresh client
      this._createClient(source);

      // 5. Launch browser
      this.browserState = "launching";
      log("info", "browser_launch_start", { source, pid: config.PID });
      
      // We wrap initialize to detect successful restoration
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

  async _connectMongo() {
    if (mongoose.connection.readyState === 1 && this.store) return;

    if (!config.MONGODB_URI) {
      throw new Error("MONGODB_URI is not configured");
    }

    log("info", "mongodb_connecting", { pid: config.PID });
    
    try {
      await mongoose.connect(config.MONGODB_URI, {
        serverSelectionTimeoutMS: 15000,
        socketTimeoutMS: 45000,
      });
      
      // Diagnostics: List collections
      const collections = await mongoose.connection.db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      log("info", "mongodb_connected", { 
        pid: config.PID, 
        collections: collectionNames 
      });

      this.store = new MongoStore({ mongoose: mongoose });
      log("info", "remote_store_connected", { pid: config.PID });
    } catch (err) {
      log("error", "mongodb_connection_failed", { error: err.message });
      throw err;
    }
  }

  async _verifyRemoteSession() {
    try {
      if (!this.store) return false;
      
      // Diagnostics: check all sessions in the store
      const allSessions = await mongoose.connection.db.collection("whatsapp-sessions").find({}).toArray();
      const sessionIds = allSessions.map(s => s.id);
      
      log("info", "session_detection_diagnostics", { 
        pid: config.PID, 
        foundIds: sessionIds 
      });

      const exists = await this.store.sessionExists({ session: "main" });
      return exists;
    } catch (err) {
      log("warn", "session_verification_failed", { error: err.message });
      return false;
    }
  }

  _createClient(source) {
    log("info", "client_creation", { 
      authStrategy: "RemoteAuth",
      clientId: "main", 
      source 
    });
    
    const puppeteerOptions = {
      headless: true,
      protocolTimeout: 180_000,
      defaultViewport: null,
      args: config.puppeteerArgs,
    };

    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
      log("info", "using_custom_executable_path", { path: config.chromePath });
    }

    this.client = new Client({
      authStrategy: new RemoteAuth({
        clientId: "main",
        store: this.store,
        backupSyncIntervalMs: 300_000,
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
        if (this.client.pupBrowser) {
          await this.client.pupBrowser.close().catch(() => {});
        }
        await this.client.destroy();
      } catch (err) {
        log("warn", "client_destroy_error", { error: err.message, source });
      }
      this.client = null;
    }
    
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

      // If we thought a session existed but got a QR, it might be expired or corrupted
      const wasExpected = this.sessionState === "launching" && this.isReady === false; 
      log("info", "qr_generated", { 
        pid: config.PID, 
        attempt: this.metrics.qrGenerations,
        unexpected: wasExpected
      });
    });

    this.client.on("authenticated", () => {
      this.sessionState = "authenticated";
      this.latestQr = null;
      this.qrGeneratedAt = null;
      log("info", "authenticated", { pid: config.PID });
    });

    this.client.on("remote_session_saved", () => {
      log("info", "remote_session_saved", { pid: config.PID });
    });

    this.client.on("auth_failure", (msg) => {
      this.sessionState = "error";
      this.isReady = false;
      log("error", "auth_failure", { message: msg, pid: config.PID });
      this.scheduleReconnect("auth_failure");
    });

    this.client.on("ready", () => {
      const wasRestored = this.metrics.qrGenerations === 0;
      this.isReady = true;
      this.sessionState = "ready";
      this.browserState = "open";
      this.reconnectAttempt = 0;
      this.reconnecting = false;
      
      log("info", "ready", { 
        pid: config.PID,
        pushname: this.client.info?.pushname,
        restored: wasRestored
      });

      if (wasRestored) {
        log("info", "remote_session_restored", { pid: config.PID });
      }

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
    
    try {
      if (mongoose.connection.readyState === 1) {
        await mongoose.disconnect();
        log("info", "mongodb_disconnected", { pid: config.PID });
      }
    } catch (err) {
      log("error", "mongodb_disconnect_failed", { error: err.message });
    }

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
