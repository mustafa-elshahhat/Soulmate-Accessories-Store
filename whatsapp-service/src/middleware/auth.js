const config = require("../config");

const authMiddleware = (req, res, next) => {
  const key = req.headers["x-internal-key"];
  if (process.env.NODE_ENV === "production" && !process.env.INTERNAL_API_KEY) {
    console.error("INTERNAL_API_KEY is not set in production!");
    return res.status(500).json({ error: "Security configuration error" });
  }
  if (key !== config.INTERNAL_KEY) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  next();
};

module.exports = authMiddleware;
