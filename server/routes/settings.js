const express = require("express");
const { pool } = require("../db");
const { requireAuth, requireAdmin } = require("../middleware/auth");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const router = express.Router();

// Configure multer for QR code uploads
const paymentUploadDir = path.join(__dirname, "../uploads/payment");
if (!fs.existsSync(paymentUploadDir)) {
  fs.mkdirSync(paymentUploadDir, { recursive: true });
}

const qrStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, paymentUploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "qr-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const qrFileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed for QR code"));
  }
};

const uploadQR = multer({
  storage: qrStorage,
  limits: { fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5242880 },
  fileFilter: qrFileFilter,
});

// Get settings
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    let result = await pool.query("SELECT * FROM settings LIMIT 1");

    if (result.rows.length === 0) {
      // Create default settings
      const defaultResult = await pool.query(
        `INSERT INTO settings (publisher_name, tagline, about, whatsapp_number, contact_email, contact_address, currency, upi_id, payment_instructions, account_holder_name, bank_name, account_number, ifsc_code, qr_code_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
         RETURNING *`,
        [
          "My Publishing House",
          "Quality Books for Quality Readers",
          "We are dedicated to publishing works that inspire, educate, and entertain readers around the world.",
          "",
          "",
          "",
          "INR",
          "",
          "",
          "",
          "",
          "",
          "",
          "",
        ],
      );
      result = defaultResult;
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error("Error fetching settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

// Update settings (admin only) - with optional QR upload
router.put(
  "/",
  requireAuth,
  requireAdmin,
  uploadQR.single("qr_code"),
  async (req, res) => {
    try {
      const {
        publisher_name,
        tagline,
        about,
        whatsapp_number,
        contact_email,
        contact_address,
        currency,
        upi_id,
        payment_instructions,
        account_holder_name,
        bank_name,
        account_number,
        ifsc_code,
      } = req.body;

      // Validation
      if (!publisher_name) {
        return res.status(400).json({ error: "Publisher name is required" });
      }

      // Check if settings exist
      const checkResult = await pool.query(
        "SELECT id, qr_code_url FROM settings LIMIT 1",
      );

      let qrCodeUrl = checkResult.rows[0]?.qr_code_url || null;

      // If new QR code uploaded, update the URL
      if (req.file) {
        // Delete old QR code file if it exists
        if (qrCodeUrl && qrCodeUrl !== req.file.filename) {
          const oldFilePath = path.join(
            paymentUploadDir,
            path.basename(qrCodeUrl),
          );
          if (fs.existsSync(oldFilePath)) {
            fs.unlinkSync(oldFilePath);
          }
        }
        qrCodeUrl = `/uploads/payment/${req.file.filename}`;
      }

      let result;
      if (checkResult.rows.length === 0) {
        // Insert new settings
        result = await pool.query(
          `INSERT INTO settings 
         (publisher_name, tagline, about, whatsapp_number, contact_email, 
          contact_address, currency, upi_id, payment_instructions,
          account_holder_name, bank_name, account_number, ifsc_code, qr_code_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15) 
         RETURNING *`,
          [
            publisher_name,
            tagline,
            about,
            whatsapp_number,
            contact_email,
            contact_address,
            currency,
            upi_id,
            payment_instructions,
            account_holder_name,
            bank_name,
            account_number,
            ifsc_code,
            qrCodeUrl,
          ],
        );
      } else {
        // Update existing settings
        result = await pool.query(
          `UPDATE settings SET 
         publisher_name = $1, tagline = $2, about = $3, whatsapp_number = $4,
         contact_email = $5, contact_address = $6, currency = $7,
         upi_id = $8, payment_instructions = $9,
         account_holder_name = $10, bank_name = $11, account_number = $12, 
         ifsc_code = $13, qr_code_url = $14, updated_at = NOW()
         WHERE id = $15 RETURNING *`,
          [
            publisher_name,
            tagline,
            about,
            whatsapp_number,
            contact_email,
            contact_address,
            currency,
            upi_id,
            payment_instructions,
            account_holder_name,
            bank_name,
            account_number,
            ifsc_code,
            qrCodeUrl,
            checkResult.rows[0].id,
          ],
        );
      }

      res.json({ success: true, settings: result.rows[0] });
    } catch (error) {
      console.error("Error updating settings:", error);
      res.status(500).json({ error: "Failed to update settings" });
    }
  },
);

// Delete QR code
router.delete("/qr-code", requireAuth, requireAdmin, async (req, res) => {
  try {
    const checkResult = await pool.query(
      "SELECT id, qr_code_url FROM settings LIMIT 1",
    );

    if (checkResult.rows.length > 0 && checkResult.rows[0].qr_code_url) {
      const qrCodeUrl = checkResult.rows[0].qr_code_url;
      const filePath = path.join(paymentUploadDir, path.basename(qrCodeUrl));

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }

      await pool.query("UPDATE settings SET qr_code_url = NULL WHERE id = $1", [
        checkResult.rows[0].id,
      ]);

      res.json({ success: true, message: "QR code deleted successfully" });
    } else {
      res.status(404).json({ error: "No QR code found" });
    }
  } catch (error) {
    console.error("Error deleting QR code:", error);
    res.status(500).json({ error: "Failed to delete QR code" });
  }
});

// Get public settings (no auth required)
router.get("/public", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT publisher_name, tagline, about, contact_email, contact_address, currency, whatsapp_number, upi_id, account_holder_name, bank_name, account_number, ifsc_code, qr_code_url, payment_instructions FROM settings LIMIT 1",
    );

    if (result.rows.length === 0) {
      return res.json({
        success: true,
        settings: {
          publisher_name: "Publishing House",
          tagline: "Books, journals and stories that matter",
          about: "",
          contact_email: "",
          contact_address: "",
          currency: "INR",
          whatsapp_number: "",
          upi_id: "",
          account_holder_name: "",
          bank_name: "",
          account_number: "",
          ifsc_code: "",
          qr_code_url: "",
          payment_instructions: "",
        },
      });
    }

    res.json({ success: true, settings: result.rows[0] });
  } catch (error) {
    console.error("Error fetching public settings:", error);
    res.status(500).json({ error: "Failed to fetch settings" });
  }
});

module.exports = router;
