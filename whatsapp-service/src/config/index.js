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
  AUTH_DIR: path.join(__dirname, "../../sessions"),
  SESSION_DIR: path.join(__dirname, "../../sessions/session-main"),
  BACKUP_KEY: "wa-session-backup",
  BACKUP_INTERVAL: 10 * 60 * 1000,
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000,
  RECONNECT_BASE_DELAY_MS: 30_000,
  RECONNECT_MAX_DELAY_MS: 300_000,
  RECONNECT_JITTER_MS: 5_000,
  MAX_RECONNECT_ATTEMPTS: 10,
  SHUTDOWN_TIMEOUT_MS: 15_000,
  BACKUP_MAX_SIZE_MB: 100,
  // Resolved once at startup; only used if explicitly needed (e.g. Render)
  chromePath: process.env.PUPPETEER_EXECUTABLE_PATH || resolveChromePath(),
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-extensions",
    "--disable-notifications",
    "--disable-remote-fonts",
    "--disable-setuid-sandbox",
    "--no-sandbox",
    "--disable-accelerated-2d-canvas",
    "--disable-background-networking",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-breakpad",
    "--disable-component-extensions-with-background-pages",
    "--disable-features=TranslateUI,BlinkGenPropertyTrees",
    "--disable-ipc-flooding-protection",
    "--disable-renderer-backgrounding",
    "--disable-software-rasterizer",
    "--metrics-recording-only",
    "--mute-audio",
  ],
};

module.exports = config;
