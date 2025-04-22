import express from "express";
import passport from "passport";
import { updateToken } from "../services/tokenService.js";
import axios from "axios";

const router = express.Router();

/**
 * 使用授权 `code` 获取 `access_token` 和 `refresh_token`
 */
async function getTokensAndUserInfo(code) {
  // 获取 tokens
  const tokenResponse = await axios.post(
    "https://oauth2.googleapis.com/token",
    null,
    {
      params: {
        code: code,
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: `${process.env.BASE_URL}/auth/googledrive/callback`,
        grant_type: "authorization_code",
      },
    }
  );
  const { access_token, refresh_token } = tokenResponse.data;

  // 使用 access_token 请求 Google API 获取用户信息
  const userInfoResponse = await axios.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    }
  );

  const email = userInfoResponse.data.email;

  return { access_token, refresh_token, email };
}

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
router.get("/callback", async (req, res) => {
  try {
    const code = req.query.code;
    if (!code) {
      return res.status(400).json({ error: "Authorization code is missing" });
    }
    // 获取 tokens 和 email
    const { refresh_token, email } = await getTokensAndUserInfo(code);

    // ✅ Store or update refresh_token using updateToken function
    await updateToken(email, "google_drive", null, refresh_token, null, null);

    googleDriveOAuthSuccess = true;

    // Return HTML that closes the popup and notifies the parent window
    res.setHeader("Content-Type", "text/html");
    res.send(`
         <script>
          window.close();
        </script>
    `);
  } catch (err) {
    console.error("❌ Failed to store Google Drive refresh token:", err);
    res
      .status(500)
      .json({ error: "Failed to store Google Drive refresh token" });
  }
});

// Temporary in-memory flag to track recent Google Drive OAuth success
let googleDriveOAuthSuccess = false;

/**
 * 🔄 Reset Google Drive OAuth session state
 */
router.get("/status/reset", (req, res) => {
  googleDriveOAuthSuccess = false;
  res.json({ success: true, message: "Google Drive OAuth session reset." });
});

/**
 * ✅ Check Google Drive OAuth status
 */
router.get("/status", (req, res) => {
  const recentOAuthSuccess = googleDriveOAuthSuccess;

  if (recentOAuthSuccess) {
    googleDriveOAuthSuccess = false;
    return res.json({
      success: true,
      authorized: true,
      active: true,
      recentAuth: true,
    });
  }

  return res.json({
    success: true,
    authorized: false,
    recentAuth: false,
  });
});

export default router;
