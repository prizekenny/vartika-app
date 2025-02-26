import express from "express";
import passport from "passport";
import { updateToken } from "../services/tokenService.js";

const router = express.Router();

/**
 * 🔗 Redirect users to Google OAuth (Only for Google Drive authorization)
 */
router.get(
  "/",
  passport.authenticate("google-drive", {
    scope: ["profile", "email", "https://www.googleapis.com/auth/drive"],
    accessType: "offline",
    prompt: "consent",
  })
);

/**
 * 🔑 Google OAuth callback (Stores refresh_token for Google Drive)
 */
router.get(
  "/callback",
  passport.authenticate("google-drive", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      if (!req.user || !req.user.email) {
        return res
          .status(400)
          .json({ error: "User not found or missing email" });
      }

      const userEmail = req.user.email;
      const refreshToken = req.user.refresh_token;

      if (!refreshToken) {
        console.log(
          `⚠️ No refresh_token received for Google Drive: ${userEmail}`
        );
        return res.status(400).json({ error: "No refresh_token received" });
      }

      // ✅ Store or update refresh_token using updateToken function
      await updateToken(
        userEmail,
        "google_drive",
        null,
        refreshToken,
        null,
        null
      );

      console.log(`✅ Stored refresh_token for Google Drive: ${userEmail}`);
      res.json({ success: true, user: req.user });
    } catch (err) {
      console.error("❌ Failed to store Google Drive refresh token:", err);
      res
        .status(500)
        .json({ error: "Failed to store Google Drive refresh token" });
    }
  }
);

export default router;
