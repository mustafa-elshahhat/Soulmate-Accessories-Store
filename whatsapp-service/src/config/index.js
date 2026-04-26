const path = require("path");
const fs = require("fs");

function findChromePath() {
  const localChrome = path.join(__dirname, "../../chrome");
  if (fs.existsSync(localChrome)) {
    const walkDir = (dir) => {
      const files = fs.readdirSync(dir);
      for (const file of files) {
        const fullPath = path.join(dir, file);
        if (file === "chrome" && !fs.statSync(fullPath).isDirectory())
          return fullPath;
        if (fs.statSync(fullPath).isDirectory()) {
          const found = walkDir(fullPath);
          if (found) return found;
        }
      }
      return null;
    };
    const found = walkDir(localChrome);
    if (found) {
      console.log("Using Chrome at:", found);
      return found;
    }
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
  BACKUP_KEY: "wa-session-backup",
  BACKUP_INTERVAL: 10 * 60 * 1000,
  CACHE_CLEANUP_INTERVAL: 5 * 60 * 1000,
  chromePath: findChromePath(),
  puppeteerArgs: [
    "--no-sandbox",
    "--disable-setuid-sandbox",
    "--disable-dev-shm-usage",
    "--disable-gpu",
    "--disable-extensions",
  ]
};

module.exports = config;
