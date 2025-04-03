import express from "express";
import { pool } from "../config/database.js";
import XLSX from "xlsx";
import dayjs from "dayjs";

const router = express.Router();

/**
 * 📄 Get user operation logs (with pagination)
 */
router.get("/user-logs", async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const pageSize = parseInt(req.query.pageSize) || 50;
  const offset = (page - 1) * pageSize;

  try {
    const result = await pool.query(
      `SELECT * FROM user_logs ORDER BY created_at DESC LIMIT $1 OFFSET $2`,
      [pageSize, offset]
    );
    const totalResult = await pool.query(`SELECT COUNT(*) FROM user_logs`);

    res.json({
      total: parseInt(totalResult.rows[0].count),
      page,
      pageSize,
      logs: result.rows,
    });
  } catch (err) {
    console.error("❌ Failed to fetch user logs:", err);
    res.status(500).json({ error: "Failed to fetch user logs" });
  }
});

router.get("/user-logs/export", async (req, res) => {
  const { user_email, action, startDate, endDate } = req.query;

  const conditions = [];
  const values = [];
  let idx = 1;

  if (user_email) {
    conditions.push(`user_email ILIKE $${idx++}`);
    values.push(`%${user_email}%`);
  }
  if (action) {
    conditions.push(`action ILIKE $${idx++}`);
    values.push(`%${action}%`);
  }
  if (startDate) {
    conditions.push(`created_at >= $${idx++}`);
    values.push(startDate);
  }
  if (endDate) {
    conditions.push(`created_at <= $${idx++}`);
    values.push(endDate);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  try {
    const result = await pool.query(
      `SELECT * FROM user_logs ${whereClause} ORDER BY created_at DESC`,
      values
    );

    const worksheet = XLSX.utils.json_to_sheet(result.rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "User Logs");

    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    const filename = `user_logs_${dayjs().format("YYYYMMDD")}.xlsx`;
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.send(buffer);
  } catch (err) {
    console.error("❌ Failed to export user logs:", err);
    res.status(500).json({ error: "Failed to export user logs" });
  }
});

export default router;
