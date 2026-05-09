const path = require("path");
const fs = require("fs");

function findChromePath() {
  const localChrome = path.join(__dirname, "../../chrome");
  if (fs.existsSync(localChrome)) {
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        const isDir = fs.statSync(fullPath).isDirectory();
        if ((file === "chrome" || file === "chrome.exe") && !isDir) {
          console.log("Using Chrome at:", fullPath);
          return fullPath;
        }
        if (isDir) {
          const found = walkDir(fullPath);
          if (found) return found;
        }
      }
      return null;
    };
    const found = walkDir(localChrome);
    if (found) return found;
  }

  // Fallback to Puppeteer cache path for Render/cloud environments
  const puppeteerCache = path.join(__dirname, "../../node_modules/puppeteer/.cache");
  if (fs.existsSync(puppeteerCache)) {
    try {
      const files = fs.readdirSync(puppeteerCache, { recursive: true });
      for (const f of files) {
        const name = path.basename(f);
        if (name === "chrome" || name === "chrome.exe") {
          const fullPath = path.join(puppeteerCache, f);
          if (!fs.statSync(fullPath).isDirectory()) {
            console.log("Using Puppeteer cache Chrome at:", fullPath);
            return fullPath;
          }
        }
      }
    } catch {}
  }

  return undefined;
}

const config = {
  PORT: process.env.PORT || 3001,
  RENDER_URL: process.env.RENDER_EXTERNAL_URL || null,
  BACKEND_URL: process.env.BACKEND_URL || "http://localhost:5000",
  INTERNAL_KEY: process.env.INTERNAL_API_KEY || "dev-internal-key-change-in-production",
  ENABLE_WHATSAPP_PAIRING_UI: process.env.ENABLE_WHATSAPP_PAIRING_UI === "true",
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
  chromePath: findChromePath(),
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-accelerated-2d-canvas",
    "--disable-gpu",
    "--no-first-run",
    "--no-zygote",
    "--single-process",
    "--disable-extensions",
    "--disable-background-timer-throttling",
    "--disable-backgrounding-occluded-windows",
    "--disable-renderer-backgrounding",
    "--disable-features=TranslateUI",
    "--memory-pressure-off",
  ]
};

module.exports = config;
