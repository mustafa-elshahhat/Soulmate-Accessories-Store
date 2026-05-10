const app = require("./app");
const config = require("./config");
const log = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");
const lifecycleManager = require("./services/lifecycle.manager");

// ── State ─────────────────────────────────────────────────────────────────────
let server = null;

// ── Health endpoint ───────────────────────────────────────────────────────────
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
    pid: config.PID
  });
});

// ── Start server ──────────────────────────────────────────────────────────────
server = app.listen(config.PORT, "0.0.0.0", () => {
  log("info", "http_server_start", { port: config.PORT });

  // Initialize lifecycle manager
  lifecycleManager.setup(server, whatsappService);

  // Initialize WhatsApp after a brief stability delay
  setTimeout(() => {
    log("info", "whatsapp_init_scheduled", { source: "server_bootstrap" });
    whatsappService.initialize("bootstrap").catch((err) => {
      log("error", "whatsapp_init_error", { error: err.message });
    });
  }, 3000);

  // Self-ping keep-alive
  if (config.RENDER_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${config.RENDER_URL}/health`, {
          signal: AbortSignal.timeout(15_000),
        });
        log(res.ok ? "info" : "warn", "keep_alive_ping", { httpStatus: res.status });
      } catch (err) {
        log("error", "keep_alive_failed", { error: err.message });
      }
    }, config.KEEP_ALIVE_INTERVAL);
  }
});
