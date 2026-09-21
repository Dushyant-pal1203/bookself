const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const {
  validateEmail,
  validatePhoneNumber,
  paginate,
} = require("../utils/helpers");

const router = express.Router();

// Public route for creating orders (no auth required)
router.post("/", async (req, res) => {
  try {
    const {
      article_id,
      article_title,
      article_author,
      quantity = 1,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      payment_method,
      total_amount,
      currency = "INR",
      notes,
    } = req.body;

    // Validation
    if (
      !article_id ||
      !article_title ||
      !customer_name ||
      !customer_phone ||
      !customer_address ||
      !payment_method ||
      !total_amount
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    if (customer_email && !validateEmail(customer_email)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    if (!validatePhoneNumber(customer_phone)) {
      return res.status(400).json({ error: "Invalid phone number format" });
    }

    // Check if article exists and is in stock
    const articleCheck = await pool.query(
      "SELECT id, title, price, in_stock FROM articles WHERE id = $1",
      [article_id],
    );

    if (articleCheck.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    const article = articleCheck.rows[0];
    if (!article.in_stock) {
      return res.status(400).json({ error: "Article is out of stock" });
    }

    const result = await pool.query(
      `INSERT INTO orders 
       (article_id, article_title, article_author, quantity, customer_name, 
        customer_email, customer_phone, customer_address, payment_method, 
        status, total_amount, currency, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13) 
       RETURNING *`,
      [
        article_id,
        article_title,
        article_author,
        quantity,
        customer_name,
        customer_email,
        customer_phone,
        customer_address,
        payment_method,
        "pending",
        total_amount,
        currency,
        notes,
      ],
    );

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error("Create order error:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

// Admin routes
router.get("/", requireAuth, async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM orders WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (status) {
      query += ` AND status = $${paramIndex}`;
      params.push(status);
      paramIndex++;
    }

    const { limit: queryLimit, offset } = paginate(page, limit);
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(queryLimit, offset);

    const result = await pool.query(query, params);

    let countQuery = "SELECT COUNT(*) as count FROM orders WHERE 1=1";
    const countParams = [];
    let countIndex = 1;

    if (status) {
      countQuery += ` AND status = $${countIndex}`;
      countParams.push(status);
      countIndex++;
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      orders: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: queryLimit,
      totalPages: Math.ceil(countResult.rows[0].count / queryLimit),
    });
  } catch (error) {
    console.error("Get orders error:", error);
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM orders WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error("Get order error:", error);
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

router.patch("/:id/status", requireAuth, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = [
      "pending",
      "confirmed", // ✅ ADD THIS
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ];

    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const result = await pool.query(
      "UPDATE orders SET status = $1 WHERE id = $2 RETURNING *",
      [status, req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, order: result.rows[0] });
  } catch (error) {
    console.error("Update order status error:", error);
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM orders WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({ success: true, message: "Order deleted successfully" });
  } catch (error) {
    console.error("Delete order error:", error);
    res.status(500).json({ error: "Failed to delete order" });
  }
});

// Get order statistics
router.get("/stats/summary", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_orders,
        COUNT(CASE WHEN status = 'confirmed' THEN 1 END) as confirmed_orders,
        COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_orders,
        COUNT(CASE WHEN status = 'shipped' THEN 1 END) as shipped_orders,
        COUNT(CASE WHEN status = 'delivered' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'cancelled' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'delivered' THEN total_amount ELSE 0 END), 0) as total_revenue
      FROM orders
    `);

    res.json({ success: true, stats: result.rows[0] });
  } catch (error) {
    console.error("Get order stats error:", error);
    res.status(500).json({ error: "Failed to fetch order statistics" });
  }
});

module.exports = router;
