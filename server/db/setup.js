const { pool } = require("./index");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcrypt");

async function setupDatabase() {
  try {
    console.log("🔄 Setting up database...");

    // Read and execute schema
    const schema = fs.readFileSync(path.join(__dirname, "schema.sql"), "utf8");
    await pool.query(schema);
    console.log("✅ Database schema created successfully");

    // Create default admin user if not exists
    const hashedPassword = await bcrypt.hash("admin1203", 10);
    await pool.query(
      `
      INSERT INTO admin_users (email, password, first_name, last_name, role, is_active) 
      VALUES ($1, $2, $3, $4, $5, $6)
      ON CONFLICT (email) DO NOTHING
    `,
      ["admin@123gmail.com", hashedPassword, "Admin", "User", "admin", true],
    );
    console.log(
      "✅ Default admin user created (admin@123gmail.com / admin1203)",
    );

    // Insert sample articles
    await pool.query(`
      INSERT INTO articles (title, author, type, description, price, currency, in_stock, featured, isbn, published_year, page_count, language, publisher) 
      VALUES 
        ('Journal of South Asian Studies', 'Multiple Authors', 'journal', 'A comprehensive study of South Asian culture, politics, and economics', 49.99, 'INR', true, true, '978-93-8000-001-2', 2024, 250, 'English', 'Academic Press'),
        ('The Quiet Library', 'Alan Beasts', 'book', 'A beautiful collection of stories about silence and discovery', 24.99, 'INR', true, true, '978-93-8000-002-9', 2023, 180, 'English', 'Literary House'),
        ('The European Review', 'European Academic Press', 'journal', 'Spring Issue featuring contemporary European thought', 39.99, 'INR', true, true, '978-93-8000-003-6', 2024, 320, 'English', 'EuroPress')
      ON CONFLICT DO NOTHING
    `);
    console.log("✅ Sample articles created");

    console.log("🎉 Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Database setup error:", error.message);
  } finally {
    await pool.end();
  }
}

setupDatabase();
