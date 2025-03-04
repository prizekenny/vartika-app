import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  // Add SSL configuration based on the environment
  ssl:
    process.env.DB_SSLMODE === "require"
      ? { rejectUnauthorized: false }
      : false,
});

// Test database connection
pool.connect((err, client, release) => {
  if (err) {
    console.error("Database connection error:", err.stack);
  } else {
    console.log("Database connected successfully");
    release();
  }
});

// Gracefully handle connection pool shutdown on process exit
process.on("SIGINT", () => {
  pool.end(() => {
    console.log("Database pool has been closed");
    process.exit(0);
  });
});

export default pool;
