const ESSENTIAL_EVENTS = new Set([
  "http_server_start",
  "mongodb_connected",
  "qr_generated",
  "authenticated",
  "ready",
  "remote_session_saved",
  "remote_session_restored",
  "disconnected",
  "auth_failure",
  "whatsapp_init_failure",
  "shutdown_start",
  "shutdown_complete",
]);

function log(level, event, meta = {}) {
  const isError = level === "error" || level === "fatal" || level === "warn";
  if (!process.env.DEBUG_WHATSAPP && !isError && !ESSENTIAL_EVENTS.has(event)) return;

  console.log(JSON.stringify({
    t: new Date().toISOString(),
    level,
    event,
    ...meta,
  }));
}

module.exports = log;
