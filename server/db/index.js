const { Pool } = require("pg");
require("dotenv").config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// Test connection with retry logic
let retries = 5;
while (retries) {
  try {
    pool.connect((err, client, release) => {
      if (err) {
        console.error(
          `❌ Database connection error (${retries} retries left):`,
          err.message,
        );
        if (retries === 0) {
          console.error(
            "❌ Failed to connect to database after multiple retries",
          );
          process.exit(1);
        }
        retries--;
        setTimeout(() => {}, 5000);
      } else {
        console.log("✅ Database connected successfully");
        release();
        retries = 0;
      }
    });
    break;
  } catch (err) {
    console.error("Database connection error:", err.message);
    retries--;
    if (retries === 0) process.exit(1);
  }
}

module.exports = { pool };
