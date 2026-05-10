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
    this.isInitializing = false;
    this.reconnectTimer = null;
    this.wasAuthenticated = false;
  }

  async initialize(source = "unknown") {
    if (this.client || this.isInitializing) return;

    this.isInitializing = true;
    this.wasAuthenticated = false;

    try {
      await this._connectMongo();
      this._createClient();
      await this.client.initialize();
      this.isInitializing = false;
    } catch (err) {
      log("error", "whatsapp_init_failure", { error: err.message, source });
      this.isInitializing = false;
      this._scheduleReconnect();
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
    log("info", "mongodb_connected");
  }

  _createClient() {
    const authStrategy = new RemoteAuth({
      clientId: "main",
      store: this.store,
      backupSyncIntervalMs: 300000,
    });

    const puppeteerOptions = {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
      ],
    };

    if (config.chromePath) {
      puppeteerOptions.executablePath = config.chromePath;
    }

    this.client = new Client({
      authStrategy,
      puppeteer: puppeteerOptions,
      qrMaxRetries: 15,
      authTimeoutMs: 300000,
    });

    this._attachListeners();
  }

  _attachListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrGeneratedAt = Date.now();
      log("info", "qr_generated");
    });

    this.client.on("authenticated", () => {
      this.wasAuthenticated = true;
      this.latestQr = null;
      this.qrGeneratedAt = null;
      log("info", "authenticated");
    });

    this.client.on("remote_session_saved", () => {
      log("info", "remote_session_saved", { clientId: "main" });
    });

    this.client.on("auth_failure", (msg) => {
      this.isReady = false;
      log("error", "auth_failure", { message: msg });
      this._scheduleReconnect();
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.isInitializing = false;
      if (!this.wasAuthenticated) {
        log("info", "remote_session_restored", { clientId: "main" });
      }
      log("info", "ready");
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      log("info", "disconnected", { reason });
      if (reason !== "Max qrcode retries reached") {
        this._scheduleReconnect();
      }
    });
  }

  _scheduleReconnect() {
    if (this.reconnectTimer || this.isInitializing) return;

    this.reconnectTimer = setTimeout(async () => {
      this.reconnectTimer = null;
      if (this.client) {
        try {
          this.client.removeAllListeners();
          await this.client.destroy();
        } catch (_) {}
        this.client = null;
        this.isReady = false;
        this.latestQr = null;
      }
      await this.initialize("reconnect");
    }, 30000);
  }

  async destroy() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    if (this.client) {
      try {
        this.client.removeAllListeners();
        await this.client.destroy();
      } catch (_) {}
      this.client = null;
    }

    if (mongoose.connection.readyState === 1) {
      try { await mongoose.disconnect(); } catch (_) {}
    }
  }

  getStatus() {
    return {
      status: this.isReady ? "ready" : this.isInitializing ? "initializing" : "not_ready",
      isReady: this.isReady,
      hasQr: !!this.latestQr,
      qr_age_seconds: this.qrGeneratedAt
        ? Math.floor((Date.now() - this.qrGeneratedAt) / 1000)
        : null,
      uptimeSec: Math.floor(process.uptime()),
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
