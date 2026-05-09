const app = require("./app");
const config = require("./config");
const whatsappService = require("./services/whatsapp.service");

// ── Structured logger ─────────────────────────────────────────────────────────
function log(level, event, meta = {}) {
  console.log(
    JSON.stringify({
      timestamp: new Date().toISOString(),
      level,
      event,
      memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
      ...meta,
    })
  );
}

// ── State ─────────────────────────────────────────────────────────────────────
let server = null;
let shutdownInProgress = false;

// ── Graceful shutdown ─────────────────────────────────────────────────────────
const gracefulShutdown = async (signal) => {
  if (shutdownInProgress) return;
  shutdownInProgress = true;
  log("warn", "shutdown_start", { signal });

  const timer = setTimeout(() => {
    log("error", "shutdown_timeout", { signal });
    process.exit(1);
  }, config.SHUTDOWN_TIMEOUT_MS);

  try {
    if (server) server.close(() => log("info", "http_server_closed"));
  } catch (err) {
    log("error", "http_server_close_failed", { error: err.message });
  }

  try {
    await whatsappService.destroy();
  } catch (err) {
    log("error", "whatsapp_destroy_failed", { error: err.message });
  }

  clearTimeout(timer);
  log("info", "shutdown_complete");
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  log("fatal", "uncaught_exception", { error: err.message, stack: err.stack });
  gracefulShutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  log("fatal", "unhandled_rejection", { reason: String(reason) });
});

// ── Health endpoint ───────────────────────────────────────────────────────────
// Registered before WA init starts so Render's health checks pass immediately.
app.get("/health", (_req, res) => {
  const st = whatsappService.getStatus();
  res.json({
    status: st.status,
    uptimeSec: Math.floor(process.uptime()),
    memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    sessionState: st.sessionState,
    browserState: st.browserState,
    isReady: st.isReady,
    reconnectAttempt: st.reconnectAttempt,
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server = app.listen(config.PORT, "0.0.0.0", () => {
  log("info", "http_server_start", { port: config.PORT });

  // Brief delay so the HTTP listener is fully ready before Puppeteer adds load.
  setTimeout(() => {
    log("info", "whatsapp_init_scheduled");
    whatsappService.initialize().catch((err) => {
      log("error", "whatsapp_init_error", { error: err.message });
    });
  }, 2000);

  // Self-ping keep-alive (Render free tier spins down after 15 min idle).
  if (config.RENDER_URL) {
    log("info", "keep_alive_enabled", {
      url: `${config.RENDER_URL}/health`,
      intervalMs: config.KEEP_ALIVE_INTERVAL,
    });
    setInterval(async () => {
      try {
        const res = await fetch(`${config.RENDER_URL}/health`, {
          signal: AbortSignal.timeout(15_000),
        });
        const ok = res.ok;
        log(ok ? "info" : "warn", "keep_alive_ping", { httpStatus: res.status });
      } catch (err) {
        log("error", "keep_alive_failed", { error: err.message });
      }
    }, config.KEEP_ALIVE_INTERVAL);
  }
});
