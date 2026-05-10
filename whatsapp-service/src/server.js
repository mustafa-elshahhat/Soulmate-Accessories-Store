const app = require("./app");
const config = require("./config");
const log = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");
const lifecycleManager = require("./services/lifecycle.manager");

let server = null;

// ── Health endpoint ────────────────────────────────────────────────────────────
app.get("/health", (_req, res) => {
  res.json(whatsappService.getStatus());
});

// ── Start server ───────────────────────────────────────────────────────────────
server = app.listen(config.PORT, "0.0.0.0", () => {
  log("info", "http_server_start", { port: config.PORT });

  lifecycleManager.setup(server, whatsappService);

  // Brief delay to ensure the process is stable before launching the browser
  setTimeout(() => {
    whatsappService.initialize("bootstrap").catch((err) => {
      log("error", "whatsapp_init_error", { error: err.message });
    });
  }, 3000);

  // Keep-alive ping to prevent Render Free tier from sleeping (10-min interval)
  if (config.RENDER_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${config.RENDER_URL}/health`, {
          signal: AbortSignal.timeout(15_000),
        });
        if (config.DEBUG_WHATSAPP) {
          log("debug", "keep_alive_ping", { httpStatus: res.status });
        }
      } catch (err) {
        log("warn", "keep_alive_failed", { error: err.message });
      }
    }, config.KEEP_ALIVE_INTERVAL);
  }
});
