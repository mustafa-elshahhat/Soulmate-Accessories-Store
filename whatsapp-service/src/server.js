const app = require("./app");
const config = require("./config");
const whatsappService = require("./services/whatsapp.service");

// Graceful Shutdown
const gracefulShutdown = async (signal) => {
  console.log(`${signal} received — shutting down...`);
  await whatsappService.destroy();
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start WhatsApp Service
whatsappService.initialize();

// Start Server
app.listen(config.PORT, () => {
  console.log(`WhatsApp service running on port ${config.PORT}`);

  // Self-ping keep-alive for Render free tier
  if (config.RENDER_URL) {
    setInterval(async () => {
      try {
        const res = await fetch(`${config.RENDER_URL}/health`);
        const data = await res.json().catch(() => ({}));
        console.log(`Keep-alive: ${data.status || res.status}, mem:${data.memoryMB || "?"}MB`);
      } catch (err) {
        console.error("Keep-alive ping failed:", err.message);
      }
    }, config.KEEP_ALIVE_INTERVAL);
    console.log(`Keep-alive enabled: pinging ${config.RENDER_URL}/health every ${config.KEEP_ALIVE_INTERVAL / 1000}s`);
  }
});
