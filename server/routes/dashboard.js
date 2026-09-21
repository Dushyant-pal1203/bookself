const express = require("express");
const { pool } = require("../db");
const { requireAuth } = require("../middleware/auth");

const router = express.Router();

router.get("/stats", requireAuth, async (req, res) => {
  try {
    // Total revenue from delivered orders
    const revenueResult = await pool.query(
      `SELECT COALESCE(SUM(total_amount), 0) as total_revenue 
       FROM orders WHERE status = 'delivered'`,
    );

    // Total orders count
    const totalOrdersResult = await pool.query(
      "SELECT COUNT(*) as count FROM orders",
    );

    // Pending orders count
    const pendingOrdersResult = await pool.query(
      "SELECT COUNT(*) as count FROM orders WHERE status = 'pending'",
    );

    // Catalogue size
    const catalogueResult = await pool.query(
      "SELECT COUNT(*) as count FROM articles",
    );

    // Recent orders (last 5)
    const recentOrders = await pool.query(
      `SELECT id, article_title, customer_name, total_amount, status, created_at 
       FROM orders 
       ORDER BY created_at DESC 
       LIMIT 5`,
    );

    // Catalogue breakdown by type
    const catalogueBreakdown = await pool.query(
      `SELECT type, COUNT(*) as count 
       FROM articles 
       WHERE type IS NOT NULL
       GROUP BY type
       ORDER BY count DESC`,
    );

    // Monthly revenue trends (last 6 months)
    const monthlyRevenue = await pool.query(
      `SELECT 
        TO_CHAR(DATE_TRUNC('month', created_at), 'Mon YYYY') as month,
        COALESCE(SUM(total_amount), 0) as revenue
       FROM orders 
       WHERE status = 'delivered' 
         AND created_at >= NOW() - INTERVAL '6 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY DATE_TRUNC('month', created_at) DESC`,
    );

    res.json({
      success: true,
      totalRevenue: parseFloat(revenueResult.rows[0].total_revenue),
      totalOrders: parseInt(totalOrdersResult.rows[0].count),
      pendingOrders: parseInt(pendingOrdersResult.rows[0].count),
      catalogueSize: parseInt(catalogueResult.rows[0].count),
      recentOrders: recentOrders.rows,
      catalogueBreakdown: catalogueBreakdown.rows,
      monthlyRevenue: monthlyRevenue.rows,
    });
  } catch (error) {
    console.error("Dashboard stats error:", error);
    res.status(500).json({ error: "Failed to fetch dashboard statistics" });
  }
});

// Get quick stats for dashboard widgets
router.get("/quick-stats", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        (SELECT COUNT(*) FROM orders WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_orders,
        (SELECT COUNT(*) FROM articles WHERE created_at >= NOW() - INTERVAL '30 days') as new_articles,
        (SELECT COUNT(*) FROM orders WHERE status = 'pending') as pending_count,
        (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status = 'delivered' AND created_at >= NOW() - INTERVAL '30 days') as monthly_revenue
    `);

    res.json({ success: true, stats: result.rows[0] });
  } catch (error) {
    console.error("Quick stats error:", error);
    res.status(500).json({ error: "Failed to fetch quick statistics" });
  }
});

// server/routes/dashboard.js - Add this new endpoint
router.get("/inventory-value", requireAuth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(SUM(price * COALESCE(stock_quantity, 0)), 0) as total_value
      FROM articles
      WHERE stock_quantity > 0
    `);

    res.json({
      success: true,
      totalValue: parseFloat(result.rows[0].total_value),
    });
  } catch (error) {
    console.error("Inventory value error:", error);
    res.status(500).json({ error: "Failed to fetch inventory value" });
  }
});

module.exports = router;
