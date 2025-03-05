const express = require("express");
const router = express.Router();
const db = require("../db");

// Create a new role
router.post("/", async (req, res) => {
  const { role_name } = req.body;
  try {
    const result = await db.query(
      "INSERT INTO roles (role_name) VALUES ($1) RETURNING *",
      [role_name]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to create role", details: error });
  }
});

// Retrieve all roles
router.get("/", async (req, res) => {
  try {
    const roles = await db.query("SELECT * FROM roles");
    res.json(roles.rows);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch role list" });
  }
});

// Retrieve a single role
router.get("/:id", async (req, res) => {
  try {
    const role = await db.query("SELECT * FROM roles WHERE role_id = $1", [
      req.params.id,
    ]);
    if (role.rows.length === 0)
      return res.status(404).json({ error: "Role not found" });
    res.json(role.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch role information" });
  }
});

// Update role name
router.put("/:id", async (req, res) => {
  const { role_name } = req.body;
  try {
    const result = await db.query(
      "UPDATE roles SET role_name = $1 WHERE role_id = $2 RETURNING *",
      [role_name, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "Failed to update role" });
  }
});

// Delete role (Must check if the role is assigned to users before deletion)
router.delete("/:id", async (req, res) => {
  try {
    const userCount = await db.query(
      "SELECT COUNT(*) FROM user_roles WHERE role_id = $1",
      [req.params.id]
    );
    if (parseInt(userCount.rows[0].count) > 0) {
      return res
        .status(400)
        .json({ error: "Cannot delete role, it is still assigned to users" });
    }

    await db.query("DELETE FROM roles WHERE role_id = $1", [req.params.id]);
    res.json({ message: "Role deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Failed to delete role" });
  }
});

// Retrieve all users assigned to a specific role
router.get("/:id/users", async (req, res) => {
  try {
    const users = await db.query(
      "SELECT u.user_id, u.username, u.email FROM user_roles ur JOIN users u ON ur.user_id = u.user_id WHERE ur.role_id = $1",
      [req.params.id]
    );
    res.json(users.rows);
  } catch (error) {
    res
      .status(500)
      .json({ error: "Failed to fetch users assigned to this role" });
  }
});

module.exports = router;
