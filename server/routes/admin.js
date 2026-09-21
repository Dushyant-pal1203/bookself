const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const bcrypt = require("bcryptjs");

const router = express.Router();

// Get admin profile
router.get("/profile", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, email, phone_number, first_name, last_name, role, profile_image_url, is_active, created_at, last_login_at 
       FROM admin_users 
       WHERE id = $1 AND is_active = true`,
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = result.rows[0];

    // Combine first_name and last_name for the frontend
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
    console.error("Error fetching admin profile:", error);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// Update admin profile
router.put("/profile", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { name, email, first_name, last_name } = req.body;

    // Handle both combined name and individual fields
    let finalFirstName = first_name;
    let finalLastName = last_name;

    if (name && !first_name && !last_name) {
      // Split the combined name
      const nameParts = name.trim().split(" ");
      finalFirstName = nameParts[0] || "";
      finalLastName = nameParts.slice(1).join(" ") || "";
    }

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

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
       RETURNING id, email, first_name, last_name, role, created_at`,
      [finalFirstName, finalLastName, email, req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
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
        created_at: admin.created_at,
      },
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// Change admin password
router.post("/change-password", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { current_password, new_password } = req.body;

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

    // Get admin with password
    const result = await pool.query(
      "SELECT id, password FROM admin_users WHERE id = $1",
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    const admin = result.rows[0];

    // Check if admin has a password set (for OTP-only accounts)
    if (!admin.password) {
      return res.status(400).json({
        error:
          "This account uses OTP login. Please set a password first through account recovery.",
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
    console.error("Error changing password:", error);
    res.status(500).json({ error: "Failed to change password" });
  }
});

// Get profile image
router.get("/profile-image", requireAuth, requireAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT profile_image_url FROM admin_users WHERE id = $1",
      [req.session.userId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Admin not found" });
    }

    res.json({ profile_image_url: result.rows[0].profile_image_url });
  } catch (error) {
    console.error("Error fetching profile image:", error);
    res.status(500).json({ error: "Failed to fetch profile image" });
  }
});

module.exports = router;
