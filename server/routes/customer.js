// server/routes/customer.js
const express = require("express");
const bcrypt = require("bcryptjs");
const { pool } = require("../db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Helper functions
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Configure multer for user avatar uploads
const userUploadDir = path.join(__dirname, "../uploads/users");
if (!fs.existsSync(userUploadDir)) {
  fs.mkdirSync(userUploadDir, { recursive: true });
}

const userStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, userUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const userFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, gif, webp)"));
  }
};

const uploadUserAvatar = multer({
  storage: userStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 }, // 5MB
  fileFilter: userFileFilter,
});

const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const validatePhoneNumber = (phone) => {
  // Support both with and without country code
  const re =
    /^[+]?[(]?[0-9]{1,4}[)]?[-\s.]?[(]?[0-9]{1,4}[)]?[-\s.]?[0-9]{1,9}$/;
  return re.test(phone);
};

// Get current customer
router.get("/me", async (req, res) => {
  console.log("GET /customer/me - Session ID:", req.sessionID);
  console.log(
    "GET /customer/me - Session customerId:",
    req.session?.customerId,
  );

  if (!req.session || !req.session.customerId) {
    console.log("No session or customerId found");
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    const result = await pool.query(
      `SELECT id, email, phone_number, first_name, last_name, profile_image_url, created_at 
       FROM users WHERE id = $1`,
      [req.session.customerId],
    );

    if (result.rows.length === 0) {
      console.log("User not found for id:", req.session.customerId);
      return res.status(401).json({ error: "User not found" });
    }

    console.log(
      "Customer found:",
      result.rows[0].email || result.rows[0].phone_number,
    );
    res.json({ user: result.rows[0] });
  } catch (error) {
    console.error("GET /customer/me error:", error);
    res
      .status(500)
      .json({ error: "Internal server error", details: error.message });
  }
});

// Customer Signup
router.post("/signup", async (req, res) => {
  const { email, password, first_name, last_name, phone_number } = req.body;

  console.log("Signup request for email:", email);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (password.length < 6) {
    return res
      .status(400)
      .json({ error: "Password must be at least 6 characters" });
  }

  if (phone_number && !validatePhoneNumber(phone_number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    // Check if user already exists
    const existingUser = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email],
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO users (email, password, first_name, last_name, phone_number, created_at, updated_at) 
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) 
       RETURNING id, email, first_name, last_name, phone_number, profile_image_url, created_at`,
      [
        email,
        hashedPassword,
        first_name || "",
        last_name || "",
        phone_number || null,
      ],
    );

    const newUser = result.rows[0];

    // Set session
    req.session.customerId = newUser.id;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      console.log("Signup successful for:", email);
      console.log("Session saved. customerId:", req.session.customerId);

      res.json({
        success: true,
        user: newUser,
      });
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ error: "Signup failed", details: error.message });
  }
});

// Customer Login with Email/Password
// Customer Login with Email/Password (modified to accept phone number as email)
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  console.log("Customer login attempt for email/phone:", email);

  if (!email || !password) {
    return res.status(400).json({ error: "Email and password required" });
  }

  try {
    // Check if the input is a phone number or email
    const isPhoneNumber = validatePhoneNumber(email);

    let result;
    if (isPhoneNumber) {
      // If input is a phone number, search by phone_number
      result = await pool.query(
        `SELECT id, email, first_name, last_name, phone_number, password, profile_image_url 
         FROM users WHERE phone_number = $1`,
        [email],
      );
    } else {
      // Otherwise search by email
      result = await pool.query(
        `SELECT id, email, first_name, last_name, phone_number, password, profile_image_url 
         FROM users WHERE email = $1`,
        [email],
      );
    }

    if (result.rows.length === 0) {
      console.log("User not found:", email);
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
      console.log("Invalid password for user:", email);
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Set session
    req.session.customerId = user.id;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      console.log("Customer login successful for:", email);
      console.log("Session saved. customerId:", req.session.customerId);

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
          phone_number: user.phone_number,
          profile_image_url: user.profile_image_url,
        },
      });
    });
  } catch (error) {
    console.error("Customer Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Send OTP for customer
router.post("/send-otp", async (req, res) => {
  const { phone_number } = req.body;

  console.log("Send OTP request for phone:", phone_number);

  if (!phone_number) {
    return res.status(400).json({ error: "Phone number required" });
  }

  if (!validatePhoneNumber(phone_number)) {
    return res.status(400).json({ error: "Invalid phone number format" });
  }

  try {
    // Mark old OTPs as used
    await pool.query(
      "UPDATE otp_verifications SET is_used = true WHERE phone_number = $1 AND is_used = false",
      [phone_number],
    );

    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes expiry

    await pool.query(
      `INSERT INTO otp_verifications (phone_number, otp, expires_at, created_at) 
       VALUES ($1, $2, $3, NOW())`,
      [phone_number, otp, expiresAt],
    );

    console.log(`📱 Customer OTP for ${phone_number}: ${otp}`);
    console.log(`OTP expires at: ${expiresAt}`);

    res.json({
      success: true,
      message: "OTP sent successfully",
      debug_otp: process.env.NODE_ENV === "development" ? otp : undefined,
    });
  } catch (error) {
    console.error("Send OTP error:", error);
    res
      .status(500)
      .json({ error: "Failed to send OTP", details: error.message });
  }
});

// Login with OTP
router.post("/login-otp", async (req, res) => {
  const { phone_number, otp } = req.body;

  console.log("OTP login attempt for phone:", phone_number);

  if (!phone_number || !otp) {
    return res.status(400).json({ error: "Phone number and OTP required" });
  }

  try {
    // Verify OTP
    const otpResult = await pool.query(
      `SELECT * FROM otp_verifications 
       WHERE phone_number = $1 AND otp = $2 AND is_used = false AND expires_at > NOW()
       ORDER BY created_at DESC LIMIT 1`,
      [phone_number, otp],
    );

    if (otpResult.rows.length === 0) {
      console.log("Invalid or expired OTP for phone:", phone_number);
      return res.status(401).json({ error: "Invalid or expired OTP" });
    }

    // Mark OTP as used
    await pool.query(
      "UPDATE otp_verifications SET is_used = true WHERE id = $1",
      [otpResult.rows[0].id],
    );

    // Check if user exists
    let userResult = await pool.query(
      `SELECT id, email, first_name, last_name, phone_number, profile_image_url, password, created_at
       FROM users WHERE phone_number = $1`,
      [phone_number],
    );

    let isNewUser = false;
    const defaultPassword = "123456";

    // If user doesn't exist, create new account with default password
    if (userResult.rows.length === 0) {
      console.log("Creating new user for phone:", phone_number);
      const firstName = `User_${phone_number.slice(-4)}`;

      // Hash the default password
      const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);

      userResult = await pool.query(
        `INSERT INTO users (phone_number, first_name, last_name, password, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, NOW(), NOW()) 
         RETURNING id, email, first_name, last_name, phone_number, profile_image_url, password, created_at`,
        [phone_number, firstName, "", hashedDefaultPassword],
      );
      isNewUser = true;
    } else {
      // If user exists but doesn't have a password (from old registration), set default password
      const user = userResult.rows[0];
      if (!user.password) {
        console.log(
          "Existing user without password, setting default password for phone:",
          phone_number,
        );
        const hashedDefaultPassword = await bcrypt.hash(defaultPassword, 10);

        await pool.query(
          "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
          [hashedDefaultPassword, user.id],
        );

        // Update the user result to include the new password info
        userResult.rows[0].password = hashedDefaultPassword;
      }
    }

    const user = userResult.rows[0];

    // Set session
    req.session.customerId = user.id;

    // Save session explicitly
    req.session.save((err) => {
      if (err) {
        console.error("Session save error:", err);
        return res.status(500).json({ error: "Failed to save session" });
      }

      console.log(
        `OTP login successful for ${isNewUser ? "new user" : "existing user"}:`,
        phone_number,
      );
      console.log("Session saved. customerId:", req.session.customerId);

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.json({
        success: true,
        user: userWithoutPassword,
        isNewUser,
        // Optional: Add flag to indicate if user needs to change default password
        needsPasswordChange:
          isNewUser || !userResult.rows[0].password_changed_at,
      });
    });
  } catch (error) {
    console.error("OTP Login error:", error);
    res.status(500).json({ error: "Login failed", details: error.message });
  }
});

// Update customer profile
router.put("/profile", async (req, res) => {
  console.log(
    "Update profile request for customerId:",
    req.session?.customerId,
  );

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { first_name, last_name, email, phone_number } = req.body;

  try {
    // Check if email is taken by another user
    if (email) {
      const emailCheck = await pool.query(
        "SELECT id FROM users WHERE email = $1 AND id != $2",
        [email, req.session.customerId],
      );

      if (emailCheck.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Email already in use by another account" });
      }
    }

    // Check if phone is taken by another user
    if (phone_number) {
      const phoneCheck = await pool.query(
        "SELECT id FROM users WHERE phone_number = $1 AND id != $2",
        [phone_number, req.session.customerId],
      );

      if (phoneCheck.rows.length > 0) {
        return res
          .status(400)
          .json({ error: "Phone number already in use by another account" });
      }
    }

    const result = await pool.query(
      `UPDATE users 
       SET first_name = COALESCE($1, first_name),
           last_name = COALESCE($2, last_name),
           email = COALESCE($3, email),
           phone_number = COALESCE($4, phone_number),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, email, first_name, last_name, phone_number, profile_image_url, created_at`,
      [first_name, last_name, email, phone_number, req.session.customerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    console.log("Profile updated for user:", req.session.customerId);
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error("Update profile error:", error);
    res
      .status(500)
      .json({ error: "Failed to update profile", details: error.message });
  }
});

// Change password
router.put("/profile", async (req, res) => {
  console.log(
    "Change password request for customerId:",
    req.session?.customerId,
  );

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { current_password, new_password } = req.body;

  if (!current_password || !new_password) {
    return res.status(400).json({ error: "Current and new password required" });
  }

  if (new_password.length < 6) {
    return res
      .status(400)
      .json({ error: "New password must be at least 6 characters" });
  }

  try {
    const result = await pool.query(
      "SELECT password FROM users WHERE id = $1",
      [req.session.customerId],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];

    if (!user.password) {
      return res.status(400).json({
        error:
          "This account uses OTP login. Password cannot be changed. Please use OTP to login.",
      });
    }

    const validPassword = await bcrypt.compare(current_password, user.password);

    if (!validPassword) {
      console.log("Invalid current password for user:", req.session.customerId);
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    const hashedPassword = await bcrypt.hash(new_password, 10);

    await pool.query(
      "UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2",
      [hashedPassword, req.session.customerId],
    );

    console.log("Password changed for user:", req.session.customerId);
    res.json({ success: true, message: "Password changed successfully" });
  } catch (error) {
    console.error("Change password error:", error);
    res
      .status(500)
      .json({ error: "Failed to change password", details: error.message });
  }
});

// Customer logout
router.post("/logout", (req, res) => {
  console.log("Customer logout request for session:", req.sessionID);

  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({ error: "Logout failed" });
    }
    res.clearCookie("connect.sid", {
      path: "/",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
    });
    console.log("Customer logged out successfully");
    res.json({ success: true, message: "Logged out successfully" });
  });
});

// Get customer orders (optional - if you want to fetch orders for customer)
router.get("/orders", async (req, res) => {
  console.log("GET /customer/orders - customerId:", req.session?.customerId);

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // First get customer details
    const customerResult = await pool.query(
      "SELECT email, phone_number FROM users WHERE id = $1",
      [req.session.customerId],
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerResult.rows[0];

    // Get orders for this customer (by email or phone)
    const ordersResult = await pool.query(
      `SELECT * FROM orders 
       WHERE customer_email = $1 OR customer_phone = $2
       ORDER BY created_at DESC`,
      [customer.email, customer.phone_number],
    );

    res.json({ success: true, orders: ordersResult.rows });
  } catch (error) {
    console.error("Get customer orders error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Get customer's orders
router.get("/my-orders", async (req, res) => {
  console.log("GET /customer/my-orders - customerId:", req.session?.customerId);

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Get customer details
    const customerResult = await pool.query(
      "SELECT email, phone_number, first_name, last_name FROM users WHERE id = $1",
      [req.session.customerId],
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerResult.rows[0];

    // Get orders for this customer
    const ordersResult = await pool.query(
      `SELECT 
        o.id, o.article_id, o.article_title, o.article_author, 
        o.quantity, o.total_amount, o.status, o.payment_method,
        o.customer_address, o.created_at, o.notes,
        CASE 
          WHEN o.status = 'shipped' THEN 'SHIP' || LPAD(o.id::text, 8, '0')
          ELSE NULL
        END as tracking_number,
        CASE 
          WHEN o.status = 'shipped' THEN (NOW() + INTERVAL '5 days')::date
          ELSE NULL
        END as estimated_delivery
       FROM orders o
       WHERE o.customer_email = $1 OR o.customer_phone = $2
       ORDER BY o.created_at DESC`,
      [customer.email, customer.phone_number],
    );

    res.json({
      success: true,
      orders: ordersResult.rows,
      customer: {
        name: `${customer.first_name} ${customer.last_name}`,
        email: customer.email,
        phone: customer.phone_number,
      },
    });
  } catch (error) {
    console.error("Get customer orders error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch orders", details: error.message });
  }
});

// Get single order details
router.get("/orders/:id", async (req, res) => {
  console.log(
    "GET /customer/orders/:id - customerId:",
    req.session?.customerId,
  );

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  const { id } = req.params;

  try {
    // Get customer details
    const customerResult = await pool.query(
      "SELECT email, phone_number FROM users WHERE id = $1",
      [req.session.customerId],
    );

    if (customerResult.rows.length === 0) {
      return res.status(404).json({ error: "Customer not found" });
    }

    const customer = customerResult.rows[0];

    // Get order details
    const orderResult = await pool.query(
      `SELECT 
        o.*,
        CASE 
          WHEN o.status = 'shipped' THEN 'SHIP' || LPAD(o.id::text, 8, '0')
          ELSE NULL
        END as tracking_number,
        CASE 
          WHEN o.status = 'shipped' THEN (NOW() + INTERVAL '5 days')::date
          ELSE NULL
        END as estimated_delivery
       FROM orders o
       WHERE o.id = $1 AND (o.customer_email = $2 OR o.customer_phone = $3)`,
      [id, customer.email, customer.phone_number],
    );

    if (orderResult.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order: orderResult.rows[0] });
  } catch (error) {
    console.error("Get order details error:", error);
    res
      .status(500)
      .json({ error: "Failed to fetch order details", details: error.message });
  }
});

// Add this route after your existing routes - Upload avatar
router.post(
  "/upload-avatar",
  uploadUserAvatar.single("avatar"),
  async (req, res) => {
    console.log(
      "Upload avatar request for customerId:",
      req.session?.customerId,
    );

    if (!req.session || !req.session.customerId) {
      return res.status(401).json({ error: "Authentication required" });
    }

    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    try {
      // Get current user to delete old avatar if exists
      const currentUser = await pool.query(
        "SELECT profile_image_url FROM users WHERE id = $1",
        [req.session.customerId],
      );

      // Delete old avatar file if exists
      if (currentUser.rows[0]?.profile_image_url) {
        const oldAvatarPath = path.join(
          __dirname,
          "..",
          currentUser.rows[0].profile_image_url,
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update user with new avatar URL
      const avatarUrl = `/uploads/users/${req.file.filename}`;
      const result = await pool.query(
        `UPDATE users 
         SET profile_image_url = $1, updated_at = NOW()
         WHERE id = $2
         RETURNING id, email, first_name, last_name, phone_number, profile_image_url, created_at`,
        [avatarUrl, req.session.customerId],
      );

      console.log(
        "Avatar uploaded successfully for user:",
        req.session.customerId,
      );
      res.json({
        success: true,
        message: "Avatar uploaded successfully",
        user: result.rows[0],
        avatarUrl: avatarUrl,
      });
    } catch (error) {
      console.error("Upload avatar error:", error);
      res
        .status(500)
        .json({ error: "Failed to upload avatar", details: error.message });
    }
  },
);

// Delete avatar route
router.delete("/delete-avatar", async (req, res) => {
  console.log("Delete avatar request for customerId:", req.session?.customerId);

  if (!req.session || !req.session.customerId) {
    return res.status(401).json({ error: "Authentication required" });
  }

  try {
    // Get current user
    const currentUser = await pool.query(
      "SELECT profile_image_url FROM users WHERE id = $1",
      [req.session.customerId],
    );

    // Delete file if exists
    if (currentUser.rows[0]?.profile_image_url) {
      const avatarPath = path.join(
        __dirname,
        "..",
        currentUser.rows[0].profile_image_url,
      );
      if (fs.existsSync(avatarPath)) {
        fs.unlinkSync(avatarPath);
      }
    }

    // Update user to remove avatar URL
    const result = await pool.query(
      `UPDATE users 
       SET profile_image_url = NULL, updated_at = NOW()
       WHERE id = $1
       RETURNING id, email, first_name, last_name, phone_number, profile_image_url, created_at`,
      [req.session.customerId],
    );

    console.log(
      "Avatar deleted successfully for user:",
      req.session.customerId,
    );
    res.json({
      success: true,
      message: "Avatar deleted successfully",
      user: result.rows[0],
    });
  } catch (error) {
    console.error("Delete avatar error:", error);
    res
      .status(500)
      .json({ error: "Failed to delete avatar", details: error.message });
  }
});

module.exports = router;
