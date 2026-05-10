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

    this.store = new MongoStore({ mongoose });
    log("info", "mongodb_connected", {});
  }

  _createClient() {
    const puppeteerOptions = {
      headless: true,
      args: config.puppeteerArgs,
    };

    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
    }

    this.client = new Client({
      authStrategy: new RemoteAuth({
        clientId: "main",
        store: this.store,
        backupSyncIntervalMs: 15000,
      }),
      puppeteer: puppeteerOptions,
      qrMaxRetries: 3,
      authTimeoutMs: 60_000,
    });

    this._attachListeners();
  }

  async _destroyClient() {
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
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      this.sessionState = "disconnected";
      log("warn", "disconnected", { reason });
      this._scheduleReconnect("disconnected");
    });
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
    // Wait for pending RemoteAuth sync before shutdown (up to 15s)
    if (this.sessionState === "authenticated" && !this.sessionSaved) {
      let waited = 0;
      while (!this.sessionSaved && waited < 15000) {
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
