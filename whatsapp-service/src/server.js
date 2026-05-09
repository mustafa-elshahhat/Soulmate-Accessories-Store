const app = require("./app");
const config = require("./config");
const whatsappService = require("./services/whatsapp.service");

function log(level, msg, meta = {}) {
  const timestamp = new Date().toISOString();
  const memMB = Math.floor(process.memoryUsage().rss / 1024 / 1024);
  console.log(JSON.stringify({ timestamp, level, message: msg, memMB, ...meta }));
}

let server = null;
let shutdownInProgress = false;

// Graceful Shutdown with timeout
const gracefulShutdown = async (signal) => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;

  log("warn", `${signal} received — starting graceful shutdown...`);

  const shutdownTimer = setTimeout(() => {
    log("error", "Shutdown timed out, forcing exit");
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS);

  try {
    if (server) {
      server.close(() => log("info", "HTTP server closed"));
    }
  } catch (err) {
    log("error", "Error closing HTTP server", { error: err.message });
  }

  try {
    await whatsappService.destroy();
  } catch (err) {
    log("error", "Error during WhatsApp destroy", { error: err.message });
  }

  clearTimeout(shutdownTimer);
  log("info", "Graceful shutdown complete");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  log("fatal", "Uncaught exception", { error: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  log("fatal", "Unhandled rejection", { reason: String(reason) });
});

// Health endpoint on app so keep-alive can work before WA init
app.get("/health", (_req, res) => {
  const status = whatsappService.getStatus();
  res.json({
    status: status.isReady ? "ready" : "not_ready",
    uptime: Math.floor(process.uptime()),
    memoryMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    ...status,
  });
});

// Start Server first, then initialize WhatsApp to avoid race conditions
server = app.listen(config.PORT, "0.0.0.0", () => {
  log("info", `WhatsApp service running on port ${config.PORT}`);

  // Delay WhatsApp initialization slightly to ensure HTTP is ready first
  setTimeout(() => {
    log("info", "Starting WhatsApp initialization...");
    whatsappService.initialize().catch((err) => {
      log("error", "Initial WhatsApp initialization failed", { error: err.message });
    });
  }, 2000);

  // Self-ping keep-alive for Render free tier
  if (config.RENDER_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${config.RENDER_URL}/health`, { signal: AbortSignal.timeout(15000) });
        const data = await res.json().catch(() => ({}));
        log("info", "Keep-alive ping", { httpStatus: res.status, ...data });
      } catch (err) {
        log("error", "Keep-alive ping failed", { error: err.message });
      }
    }, config.KEEP_ALIVE_INTERVAL);
    log("info", `Keep-alive enabled: ${config.RENDER_URL}/health every ${config.KEEP_ALIVE_INTERVAL / 1000}s`);
  }
});
