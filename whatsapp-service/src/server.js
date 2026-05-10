const app = require("./app");
const config = require("./config");
const log = require("./utils/logger");
const whatsappService = require("./services/whatsapp.service");
const lifecycleManager = require("./services/lifecycle.manager");
const { monitorEventLoopDelay } = require("perf_hooks");

let server = null;

// ── Event Loop Diagnostics ──────────────────────────────────────────────────
const elHistogram = monitorEventLoopDelay({ resolution: 20 });
elHistogram.enable();

setInterval(() => {
  log("info", "system_heartbeat", { 
    event_loop_lag_mean_ms: Math.floor(elHistogram.mean / 1e6),
    event_loop_lag_p99_ms: Math.floor(elHistogram.percentile(99) / 1e6),
    active_handles: process._getActiveHandles ? process._getActiveHandles().length : 0,
    active_requests: process._getActiveRequests ? process._getActiveRequests().length : 0,
    uptime_s: Math.floor(process.uptime())
  });
  elHistogram.reset();
}, 5000);

// ── Health endpoint ────────────────────────────────────────────────────────────
app.get("/health", (req, res) => {
  const start = process.hrtime.bigint();
  const status = whatsappService.getStatus();
  const end = process.hrtime.bigint();
  const latencyMs = Number(end - start) / 1e6;
  
  log("info", "healthcheck_accessed", { latencyMs });
  res.json({ ...status, healthcheck_latency_ms: latencyMs });
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
