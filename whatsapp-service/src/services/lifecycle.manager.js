const log = require("../utils/logger");
const config = require("../config");

class LifecycleManager {
  constructor() {
    this.server = null;
    this.whatsappService = null;
    this.shutdownInProgress = false;
  }

  setup(server, whatsappService) {
    this.server = server;
    this.whatsappService = whatsappService;

    process.on("SIGTERM", () => this.gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => this.gracefulShutdown("SIGINT"));
    
    process.on("uncaughtException", (err) => {
      log("fatal", "uncaught_exception", { 
        error: err.message, 
        stack: err.stack 
      });
      this.gracefulShutdown("uncaughtException");
    });

    process.on("unhandledRejection", (reason) => {
      log("fatal", "unhandled_rejection", { reason: String(reason) });
      // We don't necessarily exit on unhandled rejection unless it's critical
    });
  }

  async gracefulShutdown(signal) {
    if (this.shutdownInProgress) return;
    this.shutdownInProgress = true;

    log("warn", "shutdown_start", { signal });

    const timeout = setTimeout(() => {
      log("error", "shutdown_timeout", { signal });
      process.exit(1);
    }, config.SHUTDOWN_TIMEOUT_MS);

    try {
      if (this.server) {
        await new Promise((resolve) => {
          this.server.close(() => {
            log("info", "http_server_closed");
            resolve();
          });
        });
      }
    } catch (err) {
      log("error", "http_server_close_failed", { error: err.message });
    }

    try {
      if (this.whatsappService) {
        await this.whatsappService.destroy("shutdown");
      }
    } catch (err) {
      log("error", "whatsapp_destroy_failed", { error: err.message });
    }

    clearTimeout(timeout);
    log("info", "shutdown_complete");
    process.exit(0);
  }
}

module.exports = new LifecycleManager();
