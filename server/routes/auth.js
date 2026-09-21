const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

// Helper functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhoneNumber = (phone) => {
  const re =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return re.test(phone);
};

// Get current user - FIXED VERSION
router.get("/me", async (req, res) => {
  console.log("GET /me - Session ID:", req.sessionID);
  console.log("GET /me - Session userId:", req.session?.userId);

  if (!req.session || !req.session.userId) {
    console.log("No session or userId found");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await pool.query(
      "SELECT id, email, phone_number, first_name, last_name, role FROM admin_users WHERE id = $1 AND is_active = true",
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      console.log("User not found for id:", req.session.userId);
      return res.status(401).json({ error: "User not found" });
    }

    console.log(
      "User found:",
      result.rows[0].email || result.rows[0].phone_number,
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("GET /me error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Email login
router.post("/login", async (req, res) => {
  console.log("POST /login - Request received");
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM admin_users WHERE email = $1",
      [email],
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res
        .status(401)
        .json({ error: "Please use OTP login for this account" });
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    // Update last login
    await pool.query(
      "UPDATE admin_users SET last_login_at = NOW() WHERE id = $1",
      [user.id],
    );

    // Set session
    req.session.userId = user.id;
    req.session.userRole = user.role;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      console.log("Session saved. userId:", req.session.userId);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          phone_number: user.phone_number,
          first_name: user.first_name,
          last_name: user.last_name,
          role: user.role,
        },
      });
    });
  } catch (error) {
    console.error("Email Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Send OTP
router.post("/send-otp", async (req, res) => {
  const { phone_number } = req.body;

  if (!phone_number) {
    return res.status(400).json({ error: "Phone number required" });
  }

  if (!validatePhoneNumber(phone_number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    await pool.query(
      `INSERT INTO otp_verifications (phone_number, otp, expires_at) 
       VALUES ($1, $2, $3)`,
      [phone_number, otp, expiresAt],
    );

    console.log(`📱 OTP for ${phone_number}: ${otp}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      debug_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Login with OTP
router.post("/login-otp", async (req, res) => {
  const { phone_number, otp } = req.body;

  if (!phone_number || !otp) {
    return res.status(400).json({ error: "Phone number and OTP required" });
  }

  try {
    const otpResult = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE phone_number = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone_number, otp],
    );

    if (otpResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    await pool.query(
      "UPDATE otp_verifications SET is_used = true WHERE id = $1",
      [otpResult.rows[0].id],
    );

    let userResult = await pool.query(
      "SELECT * FROM admin_users WHERE phone_number = $1",
      [phone_number],
    );

    if (userResult.rows.length === 0) {
      const firstName = phone_number.slice(-4);
      userResult = await pool.query(
        `INSERT INTO admin_users (phone_number, first_name, last_name, role) 
         VALUES ($1, $2, $3, $4) RETURNING *`,
        [phone_number, `User${firstName}`, "", "admin"],
      );
    }

    const user = userResult.rows[0];

    if (!user.is_active) {
      return res.status(401).json({ error: "Account is deactivated" });
    }

    await pool.query(
      "UPDATE admin_users SET last_login_at = NOW() WHERE id = $1",
      [user.id],
    );

    req.session.userId = user.id;
    req.session.userRole = user.role;

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        phone_number: user.phone_number,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("OTP Login error:", error);
    res.status(500).json({ error: "Login failed" });
  }
});

// Setup admin user
router.post("/setup", async (req, res) => {
  const { email, password, first_name, last_name } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO admin_users (email, password, first_name, last_name, role) 
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
       RETURNING id`,
      [
        email,
        hashedPassword,
        first_name || "Admin",
        last_name || "User",
        "admin",
      ],
    );

    res.json({
      success: true,
      message: "Admin user created/updated successfully",
      userId: result.rows[0].id,
    });
  } catch (error) {
    console.error("Setup error:", error);
    res.status(500).json({ error: "Setup failed" });
  }
});

// Logout
router.post("/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Get current user profile (alias for /me with more details)
router.get("/profile", requireAuth, async (req, res) => {
  console.log("GET /profile - Session ID:", req.sessionID);
  console.log("GET /profile - Session userId:", req.session?.userId);

  if (!req.session || !req.session.userId) {
    console.log("No session or userId found");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, phone_number, first_name, last_name, role, profile_image_url, is_active, created_at, last_login_at 
       FROM admin_users 
       WHERE id = $1 AND is_active = true`,
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      console.log("User not found for id:", req.session.userId);
      return res.status(401).json({ error: "User not found" });
    }

    const admin = result.rows[0];

    console.log("User found:", admin.email || admin.phone_number);
    res.json({
      user: {
        id: admin.id,
        name: `${admin.first_name || ""} ${admin.last_name || ""}`.trim(),
        email: admin.email,
        phone_number: admin.phone_number,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        profile_image_url: admin.profile_image_url,
        created_at: admin.created_at,
        last_login_at: admin.last_login_at,
      },
    });
  } catch (error) {
    console.error("GET /profile error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Update profile
router.put("/profile", requireAuth, async (req, res) => {
  const { name, email, first_name, last_name } = req.body;

  console.log("PUT /profile - Updating user:", req.session.userId);

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  // Handle both combined name and individual fields
  let finalFirstName = first_name;
  let finalLastName = last_name;

  if (name && !first_name && !last_name) {
    const nameParts = name.trim().split(" ");
    finalFirstName = nameParts[0] || "";
    finalLastName = nameParts.slice(1).join(" ") || "";
  }

  if (!email) {
    return res.status(400).json({ error: "Email is required" });
  }

  try {
    // Check if email is already taken by another admin
    const emailCheck = await pool.query(
      "SELECT id FROM admin_users WHERE email = $1 AND id != $2",
      [email, req.session.userId],
    );

    if (emailCheck.rows.length > 0) {
      return res.status(400).json({ error: "Email already in use" });
    }

    // Update admin profile
    const result = await pool.query(
      `UPDATE admin_users 
       SET first_name = $1, last_name = $2, email = $3, updated_at = NOW() 
       WHERE id = $4 
       RETURNING id, email, first_name, last_name, role, phone_number`,
      [finalFirstName, finalLastName, email, req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const admin = result.rows[0];

    res.json({
      user: {
        id: admin.id,
        name: `${admin.first_name || ""} ${admin.last_name || ""}`.trim(),
        email: admin.email,
        first_name: admin.first_name,
        last_name: admin.last_name,
        role: admin.role,
        phone_number: admin.phone_number,
      },
    });
  } catch (error) {
    console.error("PUT /profile error:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change password
router.post("/change-password", requireAuth, async (req, res) => {
  const { current_password, new_password } = req.body;

  console.log("POST /change-password - For user:", req.session.userId);

  if (!req.session || !req.session.userId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  if (!current_password || !new_password) {
    return res.status(400).json({
      error: "Current password and new password are required",
    });
  }

  if (new_password.length < 6) {
    return res.status(400).json({
      error: "New password must be at least 6 characters long",
    });
  }

  try {
    // Get admin with password
    const result = await pool.query(
      "SELECT id, password FROM admin_users WHERE id = $1",
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const admin = result.rows[0];

    // Check if admin has a password set
    if (!admin.password) {
      return res.status(400).json({
        error:
          "This account uses OTP login. Please contact support to set up password login.",
      });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      current_password,
      admin.password,
    );
    if (!isValidPassword) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(new_password, 10);

    // Update password
    await pool.query(
      "UPDATE admin_users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.session.userId],
    );

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("POST /change-password error:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

module.exports = router;
