const express = require("express");
const router = express.Router();
const QRCode = require("qrcode");
const whatsappService = require("../services/whatsapp.service");
const authMiddleware = require("../middleware/auth");
const { normalizePhone, validateMessage } = require("../utils");
const config = require("../config");

const log = require("../utils/logger");

// ── Pairing UI guard ──────────────────────────────────────────────────────────
const pairingCheck = (req, res, next) => {
  if (process.env.NODE_ENV === "production" && !config.ENABLE_WHATSAPP_PAIRING_UI) {
    return res
      .status(403)
      .send("WhatsApp Pairing UI is disabled in production for security.");
  }
  if (config.PAIRING_ADMIN_TOKEN) {
    const token = req.query.token || req.headers["x-pairing-token"];
    if (token !== config.PAIRING_ADMIN_TOKEN) {
      return res.status(401).send("Unauthorized: Invalid or missing pairing token.");
    }
  }
  next();
};

// ── POST /send-message ────────────────────────────────────────────────────────
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
        log("info", "message_sent", { phone: normalized.slice(0, 6) + "****", attempt });
        return res.json({ success: true });
      } catch (err) {
        lastError = err;
        log("warn", "message_send_failed", { attempt, error: err.message });
        if (attempt < 2 && err.message.includes("timed out")) {
          await new Promise((r) => setTimeout(r, 3000));
        }
      }
    }

    return res
      .status(500)
      .json({ success: false, error: lastError?.message || "Failed to send message" });
  } catch (err) {
    log("error", "message_send_error", { error: err.message });
    return res.status(500).json({ success: false, error: "Failed to send message" });
  }
});

// ── GET /status ───────────────────────────────────────────────────────────────
router.get("/status", (_req, res) => {
  res.json(whatsappService.getStatus());
});

// ── GET /qr ───────────────────────────────────────────────────────────────────
router.get("/qr", pairingCheck, async (_req, res) => {
  if (whatsappService.isReady) {
    return res.send(html(
      "WhatsApp Connected",
      `<h1 style="color:#25D366">WhatsApp is connected ✓</h1>
       <p>No QR needed — the session is active.</p>`
    ));
  }

  if (!whatsappService.latestQr) {
    const st = whatsappService.getStatus();
    return res.send(html(
      "Waiting for QR",
      `<h1>Waiting for QR code…</h1>
       <p>The page will refresh automatically.</p>
       <script>setTimeout(()=>location.reload(),5000)</script>`
    ));
  }

  try {
    const qrDataUrl = await QRCode.toDataURL(whatsappService.latestQr, {
      width: 300,
      margin: 2,
    });
    const ageS = whatsappService.qrGeneratedAt
      ? Math.floor((Date.now() - whatsappService.qrGeneratedAt) / 1000)
      : null;

    return res.send(html(
      "Scan QR Code",
      `<h1>Scan with WhatsApp</h1>
       <img src="${qrDataUrl}" alt="QR Code"
            style="border-radius:12px;display:block;margin:16px auto" />
       <p>Open WhatsApp → Linked Devices → Link a Device</p>
       ${ageS !== null ? `<p style="color:#aaa;font-size:14px">QR generated ${ageS}s ago — refreshes automatically</p>` : ""}
       <script>setTimeout(()=>location.reload(),8000)</script>`
    ));
  } catch (err) {
    log("error", "qr_render_failed", { error: err.message });
    return res.status(500).send("Failed to render QR code");
  }
});

// ── POST /pair-code ───────────────────────────────────────────────────────────
router.post("/pair-code", pairingCheck, async (req, res) => {
  try {
    const { phone } = req.body;
    if (!phone || !/^\d{10,15}$/.test(phone.trim())) {
      return res.status(400).json({ error: "Invalid phone number" });
    }
    const code = await whatsappService.requestPairingCode(phone.trim());
    return res.json({ code });
  } catch (err) {
    log("warn", "pair_code_failed", { error: err.message });
    return res.status(500).json({ error: err.message });
  }
});

// ── GET /pair ─────────────────────────────────────────────────────────────────
router.get("/pair", pairingCheck, (_req, res) => {
  if (whatsappService.isReady) {
    return res.send(html(
      "WhatsApp Connected",
      `<h1 style="color:#25D366">WhatsApp is connected ✓</h1>`
    ));
  }
  res.send(html(
    "Link with Phone Number",
    `<h1>Link with Phone Number</h1>
     <p>Enter your WhatsApp number with country code (e.g. 201XXXXXXXXX)</p>
     <input id="phone" type="text" placeholder="201XXXXXXXXX"
       style="padding:12px 20px;font-size:18px;border-radius:8px;border:none;
              margin:10px;width:300px;text-align:center" />
     <button onclick="requestCode()"
       style="padding:12px 30px;font-size:16px;border-radius:8px;border:none;
              background:#25D366;color:#fff;cursor:pointer;margin:10px">
       Get Pairing Code
     </button>
     <div id="result" style="margin-top:20px;font-size:24px"></div>
     <p style="margin-top:30px">
       <a href="/qr" style="color:#25D366">Or scan QR Code instead</a>
     </p>
     <script>
       async function requestCode() {
         const phone = document.getElementById('phone').value.trim();
         const res = document.getElementById('result');
         if (!phone) { res.innerHTML='<p style="color:red">Enter a phone number</p>'; return; }
         res.innerHTML = '<p>Requesting code…</p>';
         const token = new URLSearchParams(window.location.search).get('token');
         try {
           const resp = await fetch('/pair-code', {
             method: 'POST',
             headers: { 'Content-Type': 'application/json', 'x-pairing-token': token },
             body: JSON.stringify({ phone })
           });
           const data = await resp.json();
           if (data.code) {
             res.innerHTML =
               '<p>Your pairing code:</p>' +
               '<h1 style="color:#25D366;letter-spacing:8px">' + data.code + '</h1>' +
               '<p>Enter in WhatsApp → Linked Devices → Link a Device → Link with phone number</p>';
           } else {
             res.innerHTML = '<p style="color:red">' + (data.error || 'Failed') + '</p>';
           }
         } catch(e) {
           res.innerHTML = '<p style="color:red">Error: ' + e.message + '</p>';
         }
       }
     </script>`
  ));
});

// ── HTML wrapper ──────────────────────────────────────────────────────────────
function html(title, body) {
  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>${title}</title>
</head>
<body style="display:flex;flex-direction:column;align-items:center;
             justify-content:center;min-height:100vh;
             font-family:sans-serif;background:#111;color:#fff;
             text-align:center;padding:20px">
  ${body}
</body>
</html>`;
}

module.exports = router;
