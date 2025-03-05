import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { pool } from "../config/database.js";

const router = express.Router();

// Create a new user
router.post("/", async (req, res) => {
  const { username, email, password, phone, status, user_type } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      "INSERT INTO users (username, email, password, phone, status, user_type) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [username, email, hashedPassword, phone, status, user_type]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create user", details: error });
  }
});

// Bulk create users
router.post("/bulk", async (req, res) => {
  const { users } = req.body;
  try {
    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await pool.query(
        "INSERT INTO users (username, email, password, phone, status, user_type) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          user.username,
          user.email,
          hashedPassword,
          user.phone,
          user.status,
          user.user_type,
        ]
      );
    }
    res.status(201).json({ message: "Bulk user creation successful" });
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to create users in bulk", details: error });
  }
});

// Retrieve all users
router.get("/", async (req, res) => {
  try {
    const users = await pool.query(
      "SELECT user_id, username, email, phone, status, user_type FROM users"
    );
    res.json(users.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user list" });
  }
});

// Retrieve a single user
router.get("/:id", async (req, res) => {
  try {
    const user = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      req.params.id,
    ]);
    if (user.rows.length === 0)
      return res.status(404).json({ error: "User not found" });
    res.json(user.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user information" });
  }
});

// Update user information
router.put("/:id", async (req, res) => {
  const { username, phone } = req.body;
  try {
    const result = await pool.query(
      "UPDATE users SET username = $1, phone = $2, updated_at = NOW() WHERE user_id = $3 RETURNING *",
      [username, phone, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update user" });
  }
});

// Update user status (activate/deactivate/ban)
router.patch("/:id/status", async (req, res) => {
  const { status } = req.body;
  try {
    await pool.query("UPDATE users SET status = $1 WHERE user_id = $2", [
      status,
      req.params.id,
    ]);
    res.json({ message: "User status updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to update user status" });
  }
});

// Delete a user
router.delete("/:id", async (req, res) => {
  try {
    await pool.query("DELETE FROM users WHERE user_id = $1", [req.params.id]);
    res.json({ message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete user" });
  }
});

// Get the currently logged-in user
router.get("/me", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await pool.query(
      "SELECT user_id, username, email, phone, status FROM users WHERE user_id = $1",
      [decoded.user_id]
    );

    res.json(user.rows[0]);
  } catch (error) {
    res.status(401).json({ error: "Failed to retrieve current user" });
  }
});

// Reset user password
router.patch("/:id/reset-password", async (req, res) => {
  const { new_password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(new_password, 10);
    await pool.query("UPDATE users SET password = $1 WHERE user_id = $2", [
      hashedPassword,
      req.params.id,
    ]);
    res.json({ message: "Password reset successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to reset password" });
  }
});

// Assign a role to a user
router.post("/:id/roles", async (req, res) => {
  const { role_id } = req.body;
  try {
    await pool.query(
      "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
      [req.params.id, role_id]
    );
    res.json({ message: "Role assigned successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign role" });
  }
});

// Bulk assign roles
router.post("/roles/bulk", async (req, res) => {
  const { assignments } = req.body;
  try {
    for (const { user_id, role_id } of assignments) {
      await pool.query(
        "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2) ON CONFLICT DO NOTHING",
        [user_id, role_id]
      );
    }
    res.json({ message: "Bulk role assignment successful" });
  } catch (error) {
    res.status(500).json({ error: "Failed to assign roles in bulk" });
  }
});

// Get roles of a user
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

// Remove a role from a user
router.delete("/:id/roles/:role_id", async (req, res) => {
  try {
    await pool.query(
      "DELETE FROM user_roles WHERE user_id = $1 AND role_id = $2",
      [req.params.id, req.params.role_id]
    );
    res.json({ message: "Role removed successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to remove role" });
  }
});

export default router;
