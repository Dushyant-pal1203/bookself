const { pool } = require("../db");

const requireAuth = async (req, res, next) => {
  console.log("requireAuth - Session ID:", req.sessionID);
  console.log("requireAuth - Session userId:", req.session?.userId);

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Verify user exists and is active
    const result = await pool.query(
      "SELECT id, role FROM admin_users WHERE id = $1 AND is_active = true",
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "User not found or inactive" });
    }

    req.userId = req.session.userId;
    req.userRole = result.rows[0].role;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    return res.status(500).json({ error: "Authentication error" });
  }
};

const requireAdmin = async (req, res, next) => {
  if (!req.userRole || req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};

module.exports = { requireAuth, requireAdmin };
