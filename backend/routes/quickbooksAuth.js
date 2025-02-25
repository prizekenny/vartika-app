import express from "express";
import {
  getQuickBooksAuthURL,
  handleQuickBooksCallback,
} from "../config/quickbooksAuth.js";

const router = express.Router();

/**
 * ✅ **重定向用户到 QuickBooks 进行 OAuth 认证**
 */
router.get("/", (req, res) => {
  const authURL = getQuickBooksAuthURL();
  res.redirect(authURL);
});

/**
 * ✅ **处理 QuickBooks OAuth 回调**
 */
router.get("/callback", async (req, res) => {
  try {
    const tokens = await handleQuickBooksCallback({ url: req.url });

    // 你可以选择存储 `tokens.accessToken` 和 `tokens.refreshToken` 到数据库
    console.log("✅ QuickBooks Tokens:", tokens);

    res.json({
      success: true,
      message: "QuickBooks OAuth success",
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      realmId: tokens.realmId,
    });
  } catch (error) {
    console.error("❌ QuickBooks OAuth callback failed:", error);
    res.status(500).json({ error: "Failed to authenticate with QuickBooks" });
  }
});

export default router;
