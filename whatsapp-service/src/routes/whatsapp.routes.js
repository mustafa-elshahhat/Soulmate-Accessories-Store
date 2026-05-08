const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const whatsappService = require("../services/whatsapp.service");
const authMiddleware = require("../middleware/auth");
const { normalizePhone, validateMessage } = require("../utils");
const config = require("../config");

const pairingCheck = (req, res, next) => {
  if (
    process.env.NODE_ENV === 'production' &&
    process.env.ENABLE_PAIRING !== 'true'
  ) {
    return res.status(403).send("WhatsApp Pairing UI is disabled in production for security.");
  }
  
  if (config.PAIRING_ADMIN_TOKEN) {
    const token = req.query.token || req.headers["x-pairing-token"];
    if (token !== config.PAIRING_ADMIN_TOKEN) {
      return res.status(401).send("Unauthorized: Invalid or missing pairing token.");
    }
  }
  next();
};

router.post("/send-message", authMiddleware, async (req, res) => {
  try {
    const { phone, message } = req.body;

    const normalized = normalizePhone(phone);
    if (!normalized) {
      return res.status(400).json({ success: false, error: "Invalid Egyptian phone number" });
    }

    if (!validateMessage(message)) {
      return res.status(400).json({
        success: false,
        error: `Invalid message (max ${config.MAX_MESSAGE_LENGTH} chars)`,
      });
    }

    const chatId = normalized + "@c.us";
    const trimmed = message.trim();

    let lastError;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        await whatsappService.sendMessage(chatId, trimmed);
        console.log(`Message sent to ${phone} (attempt ${attempt})`);
        return res.json({ success: true });
      } catch (err) {
        lastError = err;
        console.error(`Send attempt ${attempt} failed:`, err.message);
        if (attempt < 2 && err.message.includes("timed out")) {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    return res.status(500).json({ success: false, error: lastError.message || "Failed to send message" });
  } catch (error) {
    console.error("Unexpected error in send-message:", error.message);
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

router.get("/health", (_req, res) => {
  res.json({
    status: whatsappService.isReady ? "ready" : "not_ready",
    uptime: Math.floor(process.uptime()),
    memoryMB: Math.floor(process.memoryUsage().rss / 1024 / 1024),
  });
});

router.get("/qr", pairingCheck, async (_req, res) => {
  if (whatsappService.isReady) {
    return res.send(
      '<html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#111;color:#25D366"><h1>WhatsApp is already connected ✅</h1></body></html>'
    );
  }
  if (!whatsappService.latestQr) {
    return res.send(
      '<html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#111;color:#fff"><h1>Waiting for QR code...</h1><p>Refresh in a few seconds</p><script>setTimeout(()=>location.reload(),10000)</script></body></html>'
    );
  }
  try {
    const qrDataUrl = await QRCode.toDataURL(whatsappService.latestQr, {
      width: 300,
      margin: 2,
    });
    res.send(`
      <html>
        <head><title>WhatsApp QR</title></head>
        <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#111;color:#fff">
          <h1>Scan QR Code with WhatsApp</h1>
          <img src="${qrDataUrl}" alt="QR Code" style="border-radius:12px" />
          <p>Open WhatsApp → Linked Devices → Link a Device</p>
          <script>setTimeout(()=>location.reload(), 30000)</script>
        </body>
      </html>
    `);
  } catch (err) {
    res.status(500).send("Failed to generate QR");
  }
});

router.post("/pair-code", pairingCheck, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10,15}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    const code = await whatsappService.requestPairingCode(phone.trim());
    return res.json({ code });
  } catch (error) {
    console.error("Pairing code error:", error.message);
    return res.status(500).json({ error: error.message });
  }
});

router.get("/pair", pairingCheck, (_req, res) => {
  if (whatsappService.isReady) {
    return res.send(
      '<html><body style="display:flex;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#111;color:#25D366"><h1>WhatsApp is already connected ✅</h1></body></html>'
    );
  }
  res.send(`
    <html>
      <head><title>WhatsApp Pair</title></head>
      <body style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh;font-family:sans-serif;background:#111;color:#fff">
        <h1>Link with Phone Number</h1>
        <p>Enter your WhatsApp number (with country code, e.g. 201XXXXXXXXX)</p>
        <input id="phone" type="text" placeholder="201XXXXXXXXX" style="padding:12px 20px;font-size:18px;border-radius:8px;border:none;margin:10px;width:300px;text-align:center" />
        <button onclick="requestCode()" style="padding:12px 30px;font-size:16px;border-radius:8px;border:none;background:#25D366;color:#fff;cursor:pointer;margin:10px">Get Pairing Code</button>
        <div id="result" style="margin-top:20px;font-size:24px"></div>
        <p style="margin-top:30px"><a href="/qr" style="color:#25D366">Or scan QR Code instead</a></p>
        <script>
          async function requestCode() {
            const phone = document.getElementById('phone').value.trim();
            const res = document.getElementById('result');
            if (!phone) { res.innerHTML = '<p style="color:red">Enter a phone number</p>'; return; }
            res.innerHTML = '<p>Requesting code...</p>';
            
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');

            try {
              const resp = await fetch('/pair-code', { 
                method: 'POST', 
                headers: {
                  'Content-Type':'application/json',
                  'x-pairing-token': token
                }, 
                body: JSON.stringify({phone}) 
              });
              const data = await resp.json();
              if (data.code) {
                res.innerHTML = '<p>Your pairing code:</p><h1 style="color:#25D366;letter-spacing:8px">' + data.code + '</h1><p>Enter this code in WhatsApp → Linked Devices → Link a Device → Link with phone number</p>';
              } else {
                res.innerHTML = '<p style="color:red">' + (data.error || 'Failed') + '</p>';
              }
            } catch(e) { res.innerHTML = '<p style="color:red">Error: ' + e.message + '</p>'; }
          }
        </script>
      </body>
    </html>
  `);
});

module.exports = router;
