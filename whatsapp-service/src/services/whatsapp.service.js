const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { backupSession, restoreSession, clearLocalSession } = require("./backup.service");

function log(level, msg, meta = {}) {
  const timestamp = new Date().toISOString();
  const memMB = Math.floor(process.memoryUsage().rss / 1024 / 1024);
  console.log(JSON.stringify({ timestamp, level, message: msg, memMB, ...meta }));
}

class WhatsAppService {
  constructor() {
    this.client = null;
    this.isReady = false;
    this.latestQr = null;
    this.reconnecting = false;
    this.initializing = false;
    this.backupInterval = null;
    this.cacheCleanupInterval = null;
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

    this.createClient();
  }

  createClient() {
    if (this.client) {
      this.detachListeners();
    }

    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.AUTH_DIR,
      }),
      puppeteer: {
        headless: "new",
        args: config.puppeteerArgs,
        protocolTimeout: 180000,
        executablePath: config.chromePath,
        defaultViewport: null,
      },
      qrMaxRetries: 3,
    });

    this.initListeners();
  }

  detachListeners() {
    if (!this.client) return;
    this.client.removeAllListeners("qr");
    this.client.removeAllListeners("ready");
    this.client.removeAllListeners("authenticated");
    this.client.removeAllListeners("disconnected");
    this.client.removeAllListeners("auth_failure");
  }

  initListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrCount++;
      this.metrics.qrGenerations++;
      if (this.qrCount === 1 || this.qrCount % 6 === 0) {
        log("info", `QR generated #${this.qrCount}`, { qrCount: this.qrCount });
      }
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.latestQr = null;
      this.qrCount = 0;
      this.reconnecting = false;
      this.reconnectAttempt = 0;
      log("info", "WhatsApp client ready");

      if (this.backupInterval) clearInterval(this.backupInterval);
      this.backupInterval = setInterval(() => {
        this.metrics.backups++;
        backupSession().catch((err) => log("error", "Scheduled backup failed", { error: err.message }));
      }, config.BACKUP_INTERVAL);

      this.startCacheCleanup();
    });

    this.client.on("authenticated", () => {
      this.latestQr = null;
      this.qrCount = 0;
      log("info", "WhatsApp authenticated — backing up session...");
      backupSession().catch((err) => log("error", "Auth backup failed", { error: err.message }));
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      if (this.backupInterval) clearInterval(this.backupInterval);
      log("warn", "WhatsApp disconnected", { reason });
      this.scheduleReconnect("disconnected");
    });

    this.client.on("auth_failure", (message) => {
      log("error", "WhatsApp auth failure", { message });
      this.latestQr = null;
      this.isReady = false;
      if (this.backupInterval) clearInterval(this.backupInterval);
      clearLocalSession();
      this.scheduleReconnect("auth_failure");
    });
  }

  getReconnectDelay() {
    const base = config.RECONNECT_BASE_DELAY_MS;
    const max = config.RECONNECT_MAX_DELAY_MS;
    const jitter = Math.floor(Math.random() * config.RECONNECT_JITTER_MS);
    const delay = Math.min(base + this.reconnectAttempt * 15000 + jitter, max);
    return delay;
  }

  scheduleReconnect(reason) {
    if (this.reconnecting || this.initializing) {
      log("info", "Reconnect already scheduled or initializing, skipping", { reason });
      return;
    }

    const now = Date.now();
    const timeSinceLastReconnect = now - this.lastReconnectTime;
    if (timeSinceLastReconnect < config.RECONNECT_BASE_DELAY_MS) {
      log("info", "Reconnect requested too soon after last attempt, skipping", {
        timeSinceLastReconnect,
        reason,
      });
      return;
    }

    this.reconnecting = true;
    this.reconnectAttempt++;
    this.metrics.reconnects++;
    const delay = this.getReconnectDelay();

    log("info", `Scheduling reconnect in ${delay}ms`, {
      attempt: this.reconnectAttempt,
      reason,
    });

    setTimeout(() => {
      this.lastReconnectTime = Date.now();
      this.reconnecting = false;
      this.initialize().catch((err) => {
        log("error", "Re-initialize failed after scheduled delay", { error: err.message });
      });
    }, delay);
  }

  async initialize() {
    if (this.initializing) {
      log("info", "Initialize already in progress");
      return;
    }
    this.initializing = true;

    try {
      const restored = await restoreSession();
      if (restored) {
        this.metrics.restorations++;
      }

      await this.client.initialize();
      log("info", "WhatsApp client initialized successfully");
    } catch (err) {
      log("error", "WhatsApp initialization failed", { error: err.message });
      this.initializing = false;
      this.scheduleReconnect("init_error");
      return;
    }

    this.initializing = false;
  }

  startCacheCleanup() {
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);
    this.cacheCleanupInterval = setInterval(() => this.cleanupMemory(), config.CACHE_CLEANUP_INTERVAL);
  }

  async cleanupMemory() {
    const sessionDir = config.SESSION_DIR;
    const safeCacheDirs = [
      "GPUCache", "DawnCache", "GrShaderCache", "ShaderCache", "blob_storage",
      "Code Cache", "optimization_guide",
    ];

    let cleaned = 0;
    for (const dir of safeCacheDirs) {
      const fullPath = path.join(sessionDir, "Default", dir);
      try {
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
          cleaned++;
        }
      } catch {}
    }

    if (global.gc) global.gc();
    const memMB = Math.floor(process.memoryUsage().rss / 1024 / 1024);
    const heapMB = Math.floor(process.memoryUsage().heapUsed / 1024 / 1024);
    log("info", "Memory cleanup done", { rssMB: memMB, heapMB, cleaned });
  }

  async destroy() {
    log("info", "Destroying WhatsApp service...");
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);

    try {
      await Promise.race([
        backupSession(),
        new Promise((_, reject) => setTimeout(() => reject(new Error("backup timeout")), 10000)),
      ]);
    } catch (err) {
      log("error", "Shutdown backup failed or timed out", { error: err.message });
    }

    try {
      await this.client.destroy();
      log("info", "WhatsApp client destroyed");
    } catch (err) {
      log("error", "Client destroy failed", { error: err.message });
    }

    try {
      if (this.client.pupBrowser) {
        await this.client.pupBrowser.close();
        log("info", "Browser closed");
      }
    } catch (err) {
      log("error", "Browser close failed", { error: err.message });
    }
  }

  getStatus() {
    return {
      isReady: this.isReady,
      reconnecting: this.reconnecting,
      initializing: this.initializing,
      latestQr: !!this.latestQr,
      metrics: this.metrics,
      uptimeSec: Math.floor((Date.now() - this.metrics.startTime) / 1000),
    };
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    const result = await this.client.sendMessage(chatId, message);
    this.metrics.messagesSent++;
    return result;
  }

  async requestPairingCode(phone) {
    if (this.isReady) throw new Error("Already connected");
    if (!this.latestQr) throw new Error("Client not ready yet — QR not generated");

    try {
      const code = await this.client.requestPairingCode(phone, true);
      return code;
    } catch (err) {
      if (err.message && err.message.includes("onCodeReceivedEvent")) {
        log("warn", "Pairing code unsupported in this WhatsApp Web version", { phone: phone.slice(0, 6) + "****" });
        throw new Error("Pairing code is not available. Please use QR code authentication.");
      }
      log("error", "Pairing code request failed", { error: err.message });
      throw new Error("Failed to request pairing code: " + err.message);
    }
  }
}

module.exports = new WhatsAppService();
