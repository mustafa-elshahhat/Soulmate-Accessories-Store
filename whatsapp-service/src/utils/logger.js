const config = require("../config");

/**
 * Structured logger that automatically includes process metadata
 */
function log(level, event, meta = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    pid: config.PID,
    level,
    event,
    memMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
    ...meta,
  };
  
  console.log(JSON.stringify(payload));
}

module.exports = log;
