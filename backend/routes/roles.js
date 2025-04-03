import express from "express";
import { pool } from "../config/database.js";
import { isAdmin } from "../middleware/auth.js";
import auditLog from "../middlewares/auditLog.js";

const router = express.Router();

// 获取所有角色
router.get("/", isAdmin, auditLog("list_roles"), async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT * FROM roles ORDER BY created_at DESC"
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 为用户分配角色
router.post(
  "/assign",
  isAdmin,
  auditLog("assign_role", (req) => ({
    userId: req.body.userId,
    roleId: req.body.roleId,
  })),
  async (req, res) => {
    const { userId, roleId } = req.body;
    try {
      await pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
        [userId, roleId]
      );
      res.json({ message: "角色分配成功" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 移除用户的角色
router.delete(
  "/remove",
  isAdmin,
  auditLog("remove_role", (req) => ({
    userId: req.body.userId,
    roleId: req.body.roleId,
  })),
  async (req, res) => {
    const { userId, roleId } = req.body;
    try {
      await pool.query(
        "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2",
        [userId, roleId]
      );
      res.json({ message: "角色移除成功" });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// 获取用户的所有角色
router.get(
  "/user/:userId",
  auditLog("get_user_roles", (req) => ({ userId: req.params.userId })),
  async (req, res) => {
    try {
      const result = await pool.query(
        `
            SELECT r.* 
            FROM roles r
            JOIN user_roles ur ON r.role_id = ur.role_id
            WHERE ur.user_id = $1
        `,
        [req.params.userId]
      );
      res.json(result.rows);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

export default router;
