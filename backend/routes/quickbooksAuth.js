import express from "express";
import {
  getQuickBooksAuthURL,
  handleQuickBooksCallback,
} from "../config/quickbooksAuth.js";
import { pool } from "../config/database.js";
import { updateToken } from "../services/tokenService.js";

const router = express.Router();

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
    const { userEmail, accessToken, refreshToken, realmId } =
      await handleQuickBooksCallback({ url: req.url });

    // ⚠️ Extract email properly
    if (!userEmail) {
      console.warn("⚠️ No email found in QuickBooks OAuth response.");
      return res.status(400).json({ error: "User email is required" });
    }

    // ✅ Store or update QuickBooks tokens in the database
    await updateToken(
      userEmail,
      "quickbooks",
      accessToken,
      refreshToken,
      realmId,
      null
    );

    console.log(`✅ Stored QuickBooks refresh_token for: ${userEmail}`);

    res.json({
      success: true,
      message: "QuickBooks OAuth success",
      email: userEmail,
    });
  } catch (error) {
    console.error("❌ QuickBooks OAuth callback failed:", error);
    res.status(500).json({ error: "Failed to authenticate with QuickBooks" });
  }
});

export default router;
