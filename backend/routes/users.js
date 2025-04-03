import express from "express";
import { pool } from "../config/database.js";
import bcrypt from "bcrypt";
import auditLog from "../middlewares/auditLog.js";

const router = express.Router();

// Get all users
router.get("/", auditLog("list_users"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id, u.username, u.email, u.status, u.user_type, 
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
    res.status(500).json({ error: err.message });
  }
});

// Get user by ID
router.get(
  "/:id",
  auditLog("get_user_by_id", (req) => ({ userId: req.params.id })),
  async (req, res) => {
    try {
      const { id } = req.params;
      const result = await pool.query(
        "SELECT user_id, username, email, status, user_type, last_login_time FROM users WHERE user_id = $1",
        [id]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json(result.rows[0]);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Create new user (admin only)
router.post("/", auditLog("create_user"), async (req, res) => {
  try {
    const { username, email, password, user_type, roles } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const client = await pool.connect();
    try {
      await client.query("BEGIN");

      // 1. Create user
      const userResult = await client.query(
        `INSERT INTO users (username, email, password, user_type, auth_provider)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING user_id`,
        [username, email, hashedPassword, user_type, "local"]
      );

      const userId = userResult.rows[0].user_id;

      // 2. Assign roles
      if (roles && roles.length > 0) {
        const roleQuery = await client.query(
          "SELECT role_id FROM roles WHERE role_name = ANY($1)",
          [roles]
        );

        for (const role of roleQuery.rows) {
          await client.query(
            "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
            [userId, role.role_id]
          );
        }
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

// Update user
router.put(
  "/:id",
  auditLog("update_user", (req) => ({ userId: req.params.id })),
  async (req, res) => {
    try {
      const { id } = req.params;
      const { username, email, user_type, status, roles } = req.body;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // 1. Update user details (removed updated_at field)
        const userResult = await client.query(
          `UPDATE users 
         SET username = COALESCE($1, username),
             email = COALESCE($2, email),
             user_type = COALESCE($3, user_type),
             status = COALESCE($4, status)
         WHERE user_id = $5
         RETURNING *`,
          [username, email, user_type, status, id]
        );

        if (userResult.rows.length === 0) {
          throw new Error("User not found");
        }

        // 2. Update roles if provided
        if (roles) {
          // Remove existing roles
          await client.query("DELETE FROM user_roles WHERE user_id = $1", [id]);

          // Add new roles
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
      res.status(500).json({ error: err.message });
    }
  }
);

// Delete user
router.delete(
  "/:id",
  auditLog("delete_user", (req) => ({ userId: req.params.id })),
  async (req, res) => {
    try {
      const { id } = req.params;

      const client = await pool.connect();
      try {
        await client.query("BEGIN");

        // 1. Remove user roles
        await client.query("DELETE FROM user_roles WHERE user_id = $1", [id]);

        // 2. Delete user
        const result = await client.query(
          "DELETE FROM users WHERE user_id = $1 RETURNING *",
          [id]
        );

        if (result.rows.length === 0) {
          throw new Error("User not found");
        }

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
  }
);

export default router;
