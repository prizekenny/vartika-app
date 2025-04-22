import express from "express";
import passport from "passport";
import bcrypt from "bcrypt";
import { pool } from "../config/database.js";
import auditLog from "../middlewares/auditLog.js";

const router = express.Router();

let oauthLoginSuccess = false; // ✅ 使用全局变量

// Test route - just for API testing
router.get("/test", (req, res) => {
  res.json({ message: "Auth route working" });
});

// Local registration route
router.post(
  "/register",
  auditLog("register_user", (req) => ({
    username: req.body.username,
    email: req.body.email,
  })),
  async (req, res) => {
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
  }
);

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
      req.logIn(user, async (err) => {
        if (err) return next(err);
        // Get user roles
        const rolesResult = await pool.query(
          "SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = $1",
          [user.user_id]
        );
        user.roles = rolesResult.rows.map((r) => r.role_name);
        if (user.roles.length === 0) user.roles = ["guest"];
        //req.session.user = user;
        res.json({ user });
        console.log("User logged in:", req.session);
      });
    } catch (err) {
      return res.status(500).json({ error: err.message });
    }
  })(req, res, next);
});

// Google OAuth routes
router.get(
  "/google",
  passport.authenticate("google-login", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
    includeGrantedScopes: false,
  })
);

// Also update last_login_time for Google login
router.get(
  "/google/callback",
  passport.authenticate("google-login", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    console.log("Google login callback");
    try {
      if (!req.user || !req.user.email) {
        console.error("❌ No token received from Google OAuth: ", req.user);
        return res.status(400).send("OAuth token missing.");
      }

      console.log("Google OAuth token received, user:", req.user);

      if (req.user) {
        // Update last_login_time
        await pool.query(
          "UPDATE users SET last_login_time = NOW() WHERE user_id = $1",
          [req.user.user_id]
        );

        oauthLoginSuccess = true; // ✅ 设置全局状态
      }

      // Get user roles
      const rolesResult = await pool.query(
        "SELECT r.role_name FROM user_roles ur JOIN roles r ON ur.role_id = r.role_id WHERE ur.user_id = $1",
        [req.user.user_id]
      );
      req.user.roles = rolesResult.rows.map((r) => r.role_name);
      if (req.user.roles.length === 0) req.user.roles = ["guest"];
      //req.session.user = req.user;

      res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
      res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
      res.setHeader("Content-Type", "text/html");
      res.send(`
         <script>
          window.close();
         </script>
      `);
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
router.get("/logout", (req, res, next) => {
  if (typeof req.logOut !== "function") {
    return res.status(500).json({ error: "req.logOut is not a function" });
  }

  req.logOut((err) => {
    if (err) {
      return next(err);
    }
    req.session.destroy((err) => {
      if (err) {
        return next(err);
      }
      oauthLoginSuccess = false; // ✅ 重置全局状态
      res.clearCookie("connect.sid"); // 清除 session cookie
      res.json({ message: "Logged out successfully" });
    });
  });
});

// ✅ 替代 session 状态检测方式
router.get("/oauth-status", (req, res) => {
  if (oauthLoginSuccess) {
    oauthLoginSuccess = false;
    return res.json({ success: true, message: "OAuth login successful" });
  }
  return res.json({ success: false, message: "Waiting for OAuth login..." });
});

export default router;
