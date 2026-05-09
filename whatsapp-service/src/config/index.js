const path = require("path");

/**
 * Resolves the Chrome executable path via Puppeteer's built-in API.
 * Puppeteer reads .puppeteerrc.cjs (cacheDirectory) so both the build step
 * (`npm run build`) and this runtime call agree on the same location.
 *
 * whatsapp-web.js uses puppeteer-core internally, which requires an explicit
 * executablePath. We supply the one Puppeteer computed from .puppeteerrc.cjs
 * so the paths always stay in sync without any hardcoded strings.
 *
 * Returns undefined if puppeteer cannot be required (should not happen after
 * `npm install` unless there is a packaging issue).
 */
function resolveChromePath() {
  try {
    return require("puppeteer").executablePath();
  } catch (err) {
    // Log deferred to whatsapp.service.js which has structured logging.
    return undefined;
  }
}

const config = {
  PORT: process.env.PORT || 3001,
  RENDER_URL: process.env.RENDER_EXTERNAL_URL || null,
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  INTERNAL_KEY: process.env.INTERNAL_API_KEY || "dev-internal-key-change-in-production",
  ENABLE_WHATSAPP_PAIRING_UI:
    process.env.ENABLE_WHATSAPP_PAIRING_UI === "true" ||
    process.env.ENABLE_PAIRING === "true",
  PAIRING_ADMIN_TOKEN: process.env.PAIRING_ADMIN_TOKEN || null,
  KEEP_ALIVE_INTERVAL: 4 * 60 * 1000,
  MAX_MESSAGE_LENGTH: 1000,
  AUTH_DIR: path.join(__dirname, "../../.wwebjs_auth"),
  SESSION_DIR: path.join(__dirname, "../../.wwebjs_auth", "session"),
  BACKUP_KEY: "wa-session-backup",
  BACKUP_INTERVAL: 10 * 60 * 1000,
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000,
  RECONNECT_BASE_DELAY_MS: 60_000,
  RECONNECT_MAX_DELAY_MS: 120_000,
  RECONNECT_JITTER_MS: 30_000,
  SHUTDOWN_TIMEOUT_MS: 15_000,
  BACKUP_MAX_SIZE_MB: 80,
  // Resolved once at startup; validated at runtime in whatsapp.service.js.
  chromePath: resolveChromePath(),
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-extensions",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=TranslateUI",
    "--disable-software-rasterizer",
    "--memory-pressure-off",
  ],
};

module.exports = config;
