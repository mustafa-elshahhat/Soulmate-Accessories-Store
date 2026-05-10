function resolveChromePath() {
  try {
    return require("puppeteer").executablePath();
  } catch (_) {
    return undefined;
  }
}

module.exports = {
  PORT: process.env.PORT || 3001,
  RENDER_URL: process.env.RENDER_EXTERNAL_URL || null,
  INTERNAL_KEY: process.env.INTERNAL_API_KEY || "dev-internal-key-change-in-production",
  ENABLE_WHATSAPP_PAIRING_UI:
    process.env.ENABLE_WHATSAPP_PAIRING_UI === "true" ||
    process.env.ENABLE_PAIRING === "true",
  PAIRING_ADMIN_TOKEN: process.env.PAIRING_ADMIN_TOKEN || null,
  KEEP_ALIVE_INTERVAL: 10 * 60 * 1000,
  MAX_MESSAGE_LENGTH: 1000,
  MONGODB_URI: process.env.MONGODB_URI || null,
  chromePath: process.env.PUPPETEER_EXECUTABLE_PATH || resolveChromePath(),
};
