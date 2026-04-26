const { Client, LocalAuth } = require("whatsapp-web.js");
const fs = require("fs");
const path = require("path");
const config = require("../config");
const { backupSession, restoreSession } = require("./backup.service");

class WhatsAppService {
  constructor() {
    this.client = new Client({
      authStrategy: new LocalAuth({
        dataPath: config.AUTH_DIR
      }),
      puppeteer: {
        headless: true,
        args: config.puppeteerArgs,
        protocolTimeout: 180000,
        executablePath: config.chromePath,
      },
    });

    this.isReady = false;
    this.latestQr = null;
    this.reconnecting = false;
    this.backupInterval = null;
    this.cacheCleanupInterval = null;
    this.qrCount = 0;

    this.initListeners();
  }

  initListeners() {
    this.client.on("qr", (qr) => {
      this.latestQr = qr;
      this.qrCount++;
      if (this.qrCount === 1 || this.qrCount % 6 === 0) {
        console.log(`QR #${this.qrCount} generated — scan at /qr endpoint`);
      }
    });

    this.client.on("ready", () => {
      this.isReady = true;
      this.latestQr = null;
      this.qrCount = 0;
      this.reconnecting = false;
      console.log("WhatsApp client is ready!");

      if (this.backupInterval) clearInterval(this.backupInterval);
      this.backupInterval = setInterval(() => backupSession(), config.BACKUP_INTERVAL);

      this.startCacheCleanup();
    });

    this.client.on("authenticated", () => {
      this.latestQr = null;
      this.qrCount = 0;
      console.log("WhatsApp client authenticated — starting backup...");
      backupSession();
    });

    this.client.on("disconnected", (reason) => {
      this.isReady = false;
      if (this.backupInterval) clearInterval(this.backupInterval);
      console.log("WhatsApp client disconnected:", reason);
      this.reconnectWithDelay();
    });

    this.client.on("auth_failure", (message) => {
      console.error("WhatsApp authentication failed:", message);
      this.latestQr = null;
      const sessionDir = path.join(config.AUTH_DIR, "session");
      try { fs.rmSync(sessionDir, { recursive: true, force: true }); } catch {}
      this.reconnectWithDelay();
    });
  }

  reconnectWithDelay() {
    if (this.reconnecting) return;
    this.reconnecting = true;
    console.log("Reconnecting in 10 seconds...");
    setTimeout(() => {
      this.reconnecting = false;
      this.initialize();
    }, 10000);
  }

  async initialize() {
    try {
      await restoreSession();
      await this.client.initialize();
    } catch (err) {
      console.error("WhatsApp initialization failed:", err.message);
      this.reconnectWithDelay();
    }
  }

  startCacheCleanup() {
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);
    this.cacheCleanupInterval = setInterval(() => this.cleanupMemory(), config.CACHE_CLEANUP_INTERVAL);
  }

  async cleanupMemory() {
    const sessionDir = path.join(config.AUTH_DIR, "session");
    const safeCacheDirs = [
      "GPUCache", "DawnCache", "GrShaderCache", "ShaderCache", "blob_storage",
    ];

    for (const dir of safeCacheDirs) {
      const fullPath = path.join(sessionDir, "Default", dir);
      try {
        if (fs.existsSync(fullPath)) {
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      } catch {}
    }

    if (global.gc) global.gc();
    const memMB = Math.floor(process.memoryUsage().rss / 1024 / 1024);
    console.log(`Memory cleanup done — RSS: ${memMB}MB`);
  }

  async destroy() {
    if (this.backupInterval) clearInterval(this.backupInterval);
    if (this.cacheCleanupInterval) clearInterval(this.cacheCleanupInterval);
    try {
      await backupSession();
      await this.client.destroy();
    } catch (err) {
      console.error("WhatsApp destroy failed:", err.message);
    }
  }

  async sendMessage(chatId, message) {
    if (!this.isReady) throw new Error("WhatsApp client not ready");
    return this.client.sendMessage(chatId, message);
  }

  async requestPairingCode(phone) {
    if (this.isReady) throw new Error("Already connected");
    if (!this.latestQr) throw new Error("Client not ready yet");
    return this.client.requestPairingCode(phone, true);
  }
}

module.exports = new WhatsAppService();
