import auditLog from "../middlewares/auditLog.js";
import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = express.Router();

// Get all users (with roles)
router.get("/", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.phone, u.status, u.user_type, 
              u.created_at, u.last_login_time,
              array_agg(r.role_name) as roles
       FROM users u
       LEFT JOIN user_roles ur ON u.user_id = ur.user_id
       LEFT JOIN roles r ON ur.role_id = r.role_id
       GROUP BY u.user_id
       ORDER BY u.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ error: err.message });
  }
});

// Create new user
router.post("/", auditLog("create_user"), async (req, res) => {
  try {
    const { username, email, password, phone, user_type, roles, status } =
      req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        `INSERT INTO users (username, email, password, phone, user_type, status, auth_provider)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING user_id`,
        [username, email, hashedPassword, phone, user_type, status, "local"]
      );

      const userId = userResult.rows[0].user_id;

      let assignedRoles = roles;
      if (!roles || roles.length === 0) {
        // 默认角色
        assignedRoles = ["client"];
      }

      const roleQuery = await client.query(
        "SELECT role_id FROM roles WHERE role_name = ANY($1)",
        [assignedRoles]
      );

      for (const role of roleQuery.rows) {
        await client.query(
          "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
          [userId, role.role_id]
        );
      }

      await client.query("COMMIT");
      res.status(201).json({ message: "User created successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update user info
router.put("/:id", auditLog("update_user"), async (req, res) => {
  try {
    console.log("🧪 req.headers.cookie:", req.headers.cookie);
    console.log("🧪 req.session:", req.session);
    console.log("🧪 req.user:", req.user);

    const { id } = req.params;
    const { username, email, phone, user_type, status, roles } = req.body;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      const userResult = await client.query(
        `UPDATE users 
         SET username = COALESCE($1, username),
             email = COALESCE($2, email),
             phone = COALESCE($3, phone),
             user_type = COALESCE($4, user_type),
             status = COALESCE($5, status),
             updated_at = NOW()
         WHERE user_id = $6
         RETURNING *`,
        [username, email, phone, user_type, status, id]
      );

      if (userResult.rows.length === 0) {
        throw new Error("User not found");
      }

      if (roles) {
        await client.query("DELETE FROM user_roles WHERE user_id = $1", [id]);

        const roleQuery = await client.query(
          "SELECT role_id FROM roles WHERE role_name = ANY($1)",
          [roles]
        );

        for (const role of roleQuery.rows) {
          await client.query(
            "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
            [id, role.role_id]
          );
        }
      }

      await client.query("COMMIT");
      res.json({ message: "User updated successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("Update error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Delete user
router.delete("/:id", auditLog("delete_user"), async (req, res) => {
  try {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query("DELETE FROM user_roles WHERE user_id = $1", [
        req.params.id,
      ]);
      const result = await client.query(
        "DELETE FROM users WHERE user_id = $1 RETURNING *",
        [req.params.id]
      );

      if (result.rows.length === 0) throw new Error("User not found");

      await client.query("COMMIT");
      res.json({ message: "User deleted successfully" });
    } catch (err) {
      await client.query("ROLLBACK");
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user roles
router.get("/:id/roles", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = $1",
      [req.params.id]
    );
    res.json(result.rows.map((row) => row.role_name));
  } catch (error) {
    res.status(500).json({ error: "Failed to retrieve user roles" });
  }
});

// Get users without associated clients
router.get("/without-client", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.user_id, u.username, u.email, u.phone, u.status, u.user_type,
             u.created_at, u.last_login_time,
             array_agg(r.role_name) as roles
      FROM users u
      LEFT JOIN user_roles ur ON u.user_id = ur.user_id
      LEFT JOIN roles r ON ur.role_id = r.role_id
      LEFT JOIN clients c ON u.user_id = c.user_id
      WHERE c.user_id IS NULL
      GROUP BY u.user_id
      ORDER BY u.created_at DESC
    `);

    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching unlinked users:", err);
    res.status(500).json({ error: err.message });
  }
});

export default router;
