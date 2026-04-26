const express = require("express");
const whatsappRoutes = require("./routes/whatsapp.routes");

const app = express();
app.use(express.json());

// Routes
app.use("/", whatsappRoutes);

module.exports = app;
