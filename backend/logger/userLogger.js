import { pool } from "../config/database.js";

/**
 * ✅ Log user action directly into the user_logs table
 */
async function logUserAction(
  user_email,
  action,
  target,
  detail = {},
  ip_address = null
) {
  try {
    await pool.query(
      `INSERT INTO user_logs (user_email, action, target, detail, ip_address) VALUES ($1, $2, $3, $4, $5)`,
      [user_email, action, target, detail, ip_address]
    );
    console.log(`🟣 [UserLog] ${user_email} ${action} on ${target}`);
  } catch (err) {
    console.error("❌ Failed to write user log:", err);
  }
}

export { logUserAction };
