const express = require("express");
const router = express.Router();
const db = require("../db");

// Allow Guest to access the public page
router.get("/home", (req, res) => {
  res.json({
    message: "Welcome to the public homepage, accessible by Guest users.",
  });
});

// Allow Guest to access the signup API
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await db.query(
      "INSERT INTO users (username, email, password, status, user_type) VALUES ($1, $2, $3, 'active', 'Client') RETURNING *",
      [username, email, hashedPassword]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: "User registration failed", details: error });
  }
});

module.exports = router;
