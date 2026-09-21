const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");
const { upload } = require("../middleware/upload");
const { paginate } = require("../utils/helpers");

const router = express.Router();

// Public routes (no auth required)
router.get("/public", async (req, res) => {
  try {
    const { featured, type, limit = 20 } = req.query;
    let query = "SELECT * FROM articles WHERE in_stock = true";
    const params = [];
    let paramIndex = 1;

    if (featured === "true") {
      query += ` AND featured = true`;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    query += ` ORDER BY created_at DESC LIMIT $${paramIndex}`;
    params.push(parseInt(limit));

    const result = await pool.query(query, params);

    res.json({
      success: true,
      articles: result.rows,
      count: result.rows.length,
    });
  } catch (error) {
    console.error("Get public articles error:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/public/:id", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM articles WHERE id = $1 AND in_stock = true",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error("Get public article error:", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

// Admin routes (auth required)
router.get("/", requireAuth, async (req, res) => {
  try {
    const { search, type, page = 1, limit = 20 } = req.query;
    let query = "SELECT * FROM articles WHERE 1=1";
    const params = [];
    let paramIndex = 1;

    if (search) {
      query += ` AND (title ILIKE $${paramIndex} OR author ILIKE $${paramIndex} OR isbn ILIKE $${paramIndex})`;
      params.push(`%${search}%`);
      paramIndex++;
    }

    if (type) {
      query += ` AND type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    const { limit: queryLimit, offset } = paginate(page, limit);
    query += ` ORDER BY created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
    params.push(queryLimit, offset);

    const result = await pool.query(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as count FROM articles WHERE 1=1";
    const countParams = [];
    let countIndex = 1;

    if (search) {
      countQuery += ` AND (title ILIKE $${countIndex} OR author ILIKE $${countIndex} OR isbn ILIKE $${countIndex})`;
      countParams.push(`%${search}%`);
      countIndex++;
    }

    if (type) {
      countQuery += ` AND type = $${countIndex}`;
      countParams.push(type);
    }

    const countResult = await pool.query(countQuery, countParams);

    res.json({
      success: true,
      articles: result.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      limit: queryLimit,
      totalPages: Math.ceil(countResult.rows[0].count / queryLimit),
    });
  } catch (error) {
    console.error("Get articles error:", error);
    res.status(500).json({ error: "Failed to fetch articles" });
  }
});

router.get("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM articles WHERE id = $1", [
      req.params.id,
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ success: true, article: result.rows[0] });
  } catch (error) {
    console.error("Get article error:", error);
    res.status(500).json({ error: "Failed to fetch article" });
  }
});

router.post(
  "/",
  requireAuth,
  upload.single("cover_image"),
  async (req, res) => {
    try {
      const {
        title,
        author,
        type,
        description,
        price,
        currency = "INR",
        category,
        isbn,
        published_year,
        page_count,
        language,
        publisher,
        stock_quantity = 0, // Added with default value
        in_stock = true,
        featured = false,
      } = req.body;

      if (!title || !author || !type || !price) {
        return res
          .status(400)
          .json({ error: "Title, author, type, and price are required" });
      }

      const cover_image_url = req.file ? `/uploads/${req.file.filename}` : null;

      // Calculate in_stock based on stock_quantity if needed
      const stockQty = parseInt(stock_quantity) || 0;
      const finalInStock =
        stockQty > 0 ? true : in_stock === "true" || in_stock === true;

      const result = await pool.query(
        `INSERT INTO articles 
       (title, author, type, description, price, currency, cover_image_url, 
        category, isbn, published_year, page_count, language, publisher, 
        stock_quantity, in_stock, featured) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
        [
          title,
          author,
          type,
          description || "",
          price,
          currency,
          cover_image_url,
          category,
          isbn,
          published_year,
          page_count,
          language,
          publisher,
          stockQty,
          finalInStock,
          featured === "true" || featured === true,
        ],
      );

      res.json({ success: true, article: result.rows[0] });
    } catch (error) {
      console.error("Create article error:", error);
      res.status(500).json({ error: "Failed to create article" });
    }
  },
);

router.put(
  "/:id",
  requireAuth,
  upload.single("cover_image"),
  async (req, res) => {
    try {
      const articleId = req.params.id;
      const updates = req.body;

      // Check if article exists
      const checkResult = await pool.query(
        "SELECT id FROM articles WHERE id = $1",
        [articleId],
      );
      if (checkResult.rows.length === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      // Build dynamic update query
      const fields = [];
      const values = [];
      let paramIndex = 1;

      const allowedFields = [
        "title",
        "author",
        "type",
        "description",
        "price",
        "currency",
        "category",
        "isbn",
        "published_year",
        "page_count",
        "language",
        "publisher",
        "stock_quantity",
        "in_stock",
        "featured",
      ];

      for (const key of allowedFields) {
        if (updates[key] !== undefined) {
          fields.push(`${key} = $${paramIndex}`);
          values.push(updates[key]);
          paramIndex++;
        }
      }

      // If stock_quantity is being updated, also update in_stock accordingly
      if (updates.stock_quantity !== undefined) {
        const stockQty = parseInt(updates.stock_quantity) || 0;
        const shouldBeInStock = stockQty > 0;

        // Check if in_stock is already in the updates
        const hasInStock = fields.some((field) => field.includes("in_stock"));

        if (!hasInStock) {
          fields.push(`in_stock = $${paramIndex}`);
          values.push(shouldBeInStock);
          paramIndex++;
        }
      }

      if (req.file) {
        fields.push(`cover_image_url = $${paramIndex}`);
        values.push(`/uploads/${req.file.filename}`);
        paramIndex++;
      }

      if (fields.length === 0) {
        return res.status(400).json({ error: "No fields to update" });
      }

      values.push(articleId);
      const query = `UPDATE articles SET ${fields.join(", ")} WHERE id = $${paramIndex} RETURNING *`;
      const result = await pool.query(query, values);

      res.json({ success: true, article: result.rows[0] });
    } catch (error) {
      console.error("Update article error:", error);
      res.status(500).json({ error: "Failed to update article" });
    }
  },
);

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(
      "DELETE FROM articles WHERE id = $1 RETURNING id",
      [req.params.id],
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Article not found" });
    }

    res.json({ success: true, message: "Article deleted successfully" });
  } catch (error) {
    console.error("Delete article error:", error);
    res.status(500).json({ error: "Failed to delete article" });
  }
});

module.exports = router;
