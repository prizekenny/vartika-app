import express from "express";
import {
  getQuickBooksAuthURL,
  handleQuickBooksCallback,
} from "../config/quickbooksAuth.js";
import { pool } from "../config/database.js";
import { updateToken } from "../services/tokenService.js";
import auditLog from "../middlewares/auditLog.js";

const router = express.Router();

let quickbooksOAuthSuccess = false;

/**
 * ✅ **Redirect users to QuickBooks OAuth**
 */
router.get("/", (req, res) => {
  const authURL = getQuickBooksAuthURL();
  res.redirect(authURL);
});

/**
 * ✅ **Handle QuickBooks OAuth callback**
 */
router.get("/callback", async (req, res) => {
  try {
    const { userEmail, accessToken, refreshToken, realmId, expiresIn } =
      await handleQuickBooksCallback({ url: req.url });

    console.log(
      "✅ QuickBooks callback route triggered:",
      req.url,
      "; expiresIn:",
      expiresIn
    );

    // ⚠️ Extract email properly
    if (!userEmail) {
      console.warn("⚠️ No email found in QuickBooks OAuth response.");
      return res.status(400).json({ error: "User email is required" });
    }

    const expiresAt = new Date(Date.now() + expiresIn * 1000);

    // ✅ Store or update QuickBooks tokens in the database
    await updateToken(
      userEmail,
      "quickbooks",
      accessToken,
      refreshToken,
      realmId,
      expiresAt
    );

    console.log(`✅ Stored QuickBooks refresh_token for: ${userEmail}`);

    // Set global flag to indicate successful OAuth
    quickbooksOAuthSuccess = true;

    // Return HTML that closes the popup and notifies the parent window
    res.setHeader("Content-Type", "text/html");
    res.send(`
         <script>
          window.close();
        </script>
    `);
  } catch (error) {
    console.error("❌ QuickBooks OAuth callback failed:", error);
    res.status(500).json({ error: "Failed to authenticate with QuickBooks" });
  }
});

/**
 * 🔄 **Reset QuickBooks OAuth session state**
 * This clears previous success flags before starting a new auth flow
 */
router.get("/status/reset", (req, res) => {
  quickbooksOAuthSuccess = false;
  res.json({ success: true, message: "QuickBooks OAuth session reset." });
});

/**
 * ✅ **Check QuickBooks OAuth status**
 * Returns authorization status and company information
 */
router.get("/status", (req, res) => {
  const recentOAuthSuccess = quickbooksOAuthSuccess;

  if (recentOAuthSuccess) {
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
