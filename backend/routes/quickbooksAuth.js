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

    // Set session flag to indicate successful OAuth
    if (req.session) {
      req.session.quickbooks_oauth_success = true;
      req.session.quickbooks_email = userEmail;
      req.session.quickbooks_timestamp = Date.now();
    }

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
 * ✅ **Check QuickBooks OAuth status**
 * Returns authorization status and company information
 */
router.get("/status", async (req, res) => {
  try {
    // Check for recent OAuth success from session
    const recentOAuthSuccess = req.session && req.session.quickbooks_oauth_success;
    const userEmail = req.session?.quickbooks_email || req.user?.email || null;

    if (!userEmail) {
      return res.status(401).json({
        success: false,
        message: "User not authenticated",
      });
    }

    // Query the database to check if QuickBooks tokens exist for this user
    try {
      const tokenQuery = await pool.query(
        `SELECT * FROM api_tokens 
         WHERE user_email = $1 AND platform = 'quickbooks'`,
        [userEmail]
      );

      // If token exists, the user is authorized with QuickBooks
      if (tokenQuery.rows.length > 0) {
        // Get company name if available
        const companyName = tokenQuery.rows[0].realm_id
          ? `Company (ID: ${tokenQuery.rows[0].realm_id})`
          : "Unknown Company";

        // If we had a recent OAuth success, clear the session flag
        if (recentOAuthSuccess && req.session) {
          req.session.quickbooks_oauth_success = false;
        }

        return res.json({
          success: true,
          authorized: true,
          active: true,
          companyName: companyName,
          // Include recentAuth flag so frontend knows this is a fresh authorization
          recentAuth: !!recentOAuthSuccess,
        });
      }
    } catch (error) {
      console.error("Error querying database for QuickBooks tokens:", error);
    }

    // No token found
    return res.json({
      success: true,
      authorized: false,
      recentAuth: false,
    });
  } catch (error) {
    console.error("Error checking QuickBooks authorization status:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to check QuickBooks authorization status",
    });
  }
});

export default router;
