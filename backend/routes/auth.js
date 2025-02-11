import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";

const router = express.Router();
// Test route - just for API testing
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

// Local registration route
router.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const result = await pool.query(
      "INSERT INTO users (username, email, password, auth_provider) VALUES ($1, $2, $3, $4) RETURNING *",
      [username, email, hashedPassword, "local"]
    );

    res.status(201).json({ message: "User created successfully" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Local login with last_login_time update
router.post("/login", (req, res, next) => {
  passport.authenticate("local", async (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).json(info);

    try {
      // Update last_login_time
      await pool.query(
        "UPDATE users SET last_login_time = NOW() WHERE user_id = $1",
        [user.user_id]
      );

      // Complete login
      req.logIn(user, (err) => {
        if (err) return next(err);
        res.json({ user });
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  })(req, res, next);
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

// Also update last_login_time for Google login
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    try {
      if (req.user) {
        // Update last_login_time
        await pool.query(
          "UPDATE users SET last_login_time = NOW() WHERE user_id = $1",
          [req.user.user_id]
        );
      }
      res.json({
        success: true,
        user: req.user,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

// Get current authenticated user
router.get("/current-user", (req, res) => {
  if (req.user) {
    res.json({ user: req.user });
  } else {
    res.status(401).json({ message: "Not authenticated" });
  }
});

// Logout route
router.get("/logout", (req, res) => {
  req.logout();
  res.json({ message: "Logged out successfully" });
});

export default router;
