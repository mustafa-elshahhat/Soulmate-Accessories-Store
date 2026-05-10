// Events always emitted in production regardless of DEBUG_WHATSAPP
const ESSENTIAL_EVENTS = new Set([
  "ready",
  "authenticated",
  "qr_generated",
  "remote_session_saved",
  "disconnected",
  "auth_failure",
  "whatsapp_init_failure",
  "max_reconnect_attempts_reached",
  "http_server_start",
  "mongodb_connected",
  "shutdown_start",
  "shutdown_complete",
]);

/**
 * Structured logger. In production, only essential events and error/warn
 * levels are emitted. Set DEBUG_WHATSAPP=true for full verbose output.
 */
function log(level, event, meta = {}) {
  const isError = level === "error" || level === "fatal" || level === "warn";
  if (!process.env.DEBUG_WHATSAPP && !isError && !ESSENTIAL_EVENTS.has(event)) {
    return;
  }

  console.log(JSON.stringify({
    t: new Date().toISOString(),
    level,
    event,
    memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    ...meta,
  }));
}

module.exports = log;
