const app = require("./app");
const config = require("./config");
const log = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");

const server = app.listen(config.PORT, "0.0.0.0", () => {
  log("info", "http_server_start", { port: config.PORT });

  setTimeout(() => {
    whatsappService.initialize("bootstrap").catch((err) => {
      log("error", "whatsapp_init_failure", { error: err.message });
    });
  }, 3000);

  if (config.RENDER_URL) {
    setInterval(async () => {
      try {
        await fetch(`${config.RENDER_URL}/health`, { signal: AbortSignal.timeout(15000) });
      } catch (_) {}
    }, config.KEEP_ALIVE_INTERVAL);
  }
});

app.get("/health", (_req, res) => {
  res.json(whatsappService.getStatus());
});

let shuttingDown = false;

async function shutdown(signal) {
  if (shuttingDown) return;
  shuttingDown = true;

  log("info", "shutdown_start", { signal });
  server.close();
  await whatsappService.destroy();
  log("info", "shutdown_complete");
  process.exit(0);
}

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (err) => {
  log("error", "uncaught_exception", { error: err.message });
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason) => {
  log("error", "unhandled_rejection", { reason: String(reason) });
});
