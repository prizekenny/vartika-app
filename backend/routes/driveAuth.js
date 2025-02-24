import express from "express";
import passport from "passport";
import fs from "fs";

const router = express.Router();
const DRIVE_TOKEN_FILE = "./drive_token.json"; // 只存一个 Drive 用户的 refresh_token

/**
 * 📂 Google Drive OAuth 认证
 */
router.get(
  "/",
  passport.authenticate("google-drive", {
    scope: [
      "profile",
      "email",
      "https://www.googleapis.com/auth/drive.file",
      "https://www.googleapis.com/auth/drive",
    ],
    accessType: "offline",
    prompt: "consent",
  })
);

/**
 * ✅ Google Drive OAuth 回调，存储 refresh_token
 */
router.get(
  "/callback",
  passport.authenticate("google-drive", { failureRedirect: "/login" }),
  (req, res) => {
    if (req.user && req.user.refresh_token) {
      fs.writeFileSync(
        DRIVE_TOKEN_FILE,
        JSON.stringify({ refresh_token: req.user.refresh_token }, null, 2)
      );
      console.log(`✅ Stored Google Drive refresh_token`);
    }
    res.json({ success: true, user: req.user });
  }
);

export function getDriveToken() {
  if (!fs.existsSync(DRIVE_TOKEN_FILE)) return null;
  const tokens = JSON.parse(fs.readFileSync(DRIVE_TOKEN_FILE));
  return tokens.refresh_token || null;
}

export default router;
