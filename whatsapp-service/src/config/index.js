function resolveChromePath() {
  try {
    return require("puppeteer").executablePath();
  } catch (_) {
    return undefined;
  }
}

const config = {
  PORT: process.env.PORT || 3001,
  PID: process.pid,
  RENDER_URL: process.env.RENDER_EXTERNAL_URL || null,
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  INTERNAL_KEY: process.env.INTERNAL_API_KEY || "dev-internal-key-change-in-production",
  ENABLE_WHATSAPP_PAIRING_UI:
    process.env.ENABLE_WHATSAPP_PAIRING_UI === "true" ||
    process.env.ENABLE_PAIRING === "true",
  PAIRING_ADMIN_TOKEN: process.env.PAIRING_ADMIN_TOKEN || null,
  // 10 minutes — keeps Render Free container awake without aggressive spam
  KEEP_ALIVE_INTERVAL: 10 * 60 * 1000,
  MAX_MESSAGE_LENGTH: 1000,
  MONGODB_URI: process.env.MONGODB_URI || null,
  MAX_RECONNECT_ATTEMPTS: 3,
  SHUTDOWN_TIMEOUT_MS: 25_000,
  // Set DEBUG_WHATSAPP=true to enable verbose diagnostic logs
  DEBUG_WHATSAPP: process.env.DEBUG_WHATSAPP === "true",
  chromePath: process.env.PUPPETEER_EXECUTABLE_PATH || resolveChromePath(),
  // Minimal required args for Render Free (512MB RAM, single-process)
  puppeteerArgs: [
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

module.exports = config;
