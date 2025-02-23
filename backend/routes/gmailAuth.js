import express from "express";
import passport from "passport";
import fs from "fs";

const router = express.Router();
const TOKEN_FILE = "./gmail_tokens.json"; // File to store refresh tokens

/**
 * 🔗 Redirect users to Google OAuth (Only for Gmail authorization)
 */
router.get(
  "/",
  passport.authenticate("google-gmail", {
    scope: ["profile", "email", "https://mail.google.com/"],
    accessType: "offline",
    prompt: "consent",
  })
);

/**
 * 🔑 Google OAuth callback (Only stores refresh_token for Gmail monitoring)
 */
router.get(
  "/callback",
  passport.authenticate("google-gmail", { failureRedirect: "/login" }),
  (req, res) => {
    try {
      if (req.user) {
        console.log("✅ User object:", req.user); // 🔥 调试用，确保 req.user 正确
        if (!req.user || !req.user.email) {
          return res
            .status(400)
            .json({ error: "User not found or missing email" });
        }

        const userEmail = req.user.email;

        let tokens = {};
        if (fs.existsSync(TOKEN_FILE)) {
          tokens = JSON.parse(fs.readFileSync(TOKEN_FILE));
        }

        // ✅ Store refresh_token only when user explicitly authorizes Gmail access
        if (req.user.refresh_token) {
          tokens[userEmail] = req.user.refresh_token;
          fs.writeFileSync(TOKEN_FILE, JSON.stringify(tokens, null, 2));
          console.log(`✅ Stored refresh_token for Gmail access: ${userEmail}`);
        } else {
          console.log(
            `⚠️ No refresh_token received. User may need to reauthorize.`
          );
        }
      }
      res.json({ success: true, user: req.user });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
);

/**
 * 🔑 Get stored refresh token for a specific email
 */
export function getStoredToken(email) {
  if (!fs.existsSync(TOKEN_FILE)) return null;
  const tokens = JSON.parse(fs.readFileSync(TOKEN_FILE));
  return tokens[email] || null;
}

export default router;
