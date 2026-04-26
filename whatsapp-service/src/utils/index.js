const config = require("../config");

function normalizePhone(phone) {
  if (!phone || typeof phone !== "string") return null;
  let cleaned = phone.trim().replace(/[\s\-\+]/g, "");

  if (/^01\d{9}$/.test(cleaned)) return "2" + cleaned;
  if (/^20\d{10}$/.test(cleaned)) return cleaned;
  if (/^1\d{9}$/.test(cleaned)) return "20" + cleaned;
  if (/^002\d{11}$/.test(cleaned)) return cleaned.slice(2);

  return null;
}

function validateMessage(message) {
  if (!message || typeof message !== "string") return false;
  const trimmed = message.trim();
  return trimmed.length > 0 && trimmed.length <= config.MAX_MESSAGE_LENGTH;
}

module.exports = {
  normalizePhone,
  validateMessage,
};
