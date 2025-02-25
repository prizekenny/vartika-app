import OAuthClient from "intuit-oauth";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const QUICKBOOKS_REDIRECT_URI = `${BASE_URL}/auth/quickbooks/callback`;

// 🔹 **Create QuickBooks OAuth Client**
const quickbooksAuthClient = new OAuthClient({
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  environment: process.env.QUICKBOOKS_ENV, // "sandbox" 或 "production"
  redirectUri: QUICKBOOKS_REDIRECT_URI,
});

/**
 * 🔗 **获取 QuickBooks OAuth 认证 URL**
 */
function getQuickBooksAuthURL() {
  return quickbooksAuthClient.authorizeUri({
    scope: [
      OAuthClient.scopes.Accounting, // Access QuickBooks Accounting API
      OAuthClient.scopes.Profile,
      OAuthClient.scopes.OpenId,
      OAuthClient.scopes.Email,
    ],
    state: "intuit-test",
  });
}

/**
 * 🔑 **Handle QuickBooks OAuth Callback**
 */
async function handleQuickBooksCallback({ url }) {
  try {
    const authResponse = await quickbooksAuthClient.createToken(url);
    const accessToken = authResponse.getJson().access_token;
    const refreshToken = authResponse.getJson().refresh_token;
    const userInfo = await quickbooksAuthClient.getUserInfo();

    console.log("✅ QuickBooks Auth Response:", authResponse.getJson());
    console.log("✅ QuickBooks User Info:", userInfo.json);

    // ✅ Decode the ID token to extract the email
    const realmId = userInfo.token.realmId || null;
    const userEmail = userInfo.json?.email || null;

    console.log("✅ QuickBooks User Email:", userEmail);

    // ❌ Prevent storing if email is missing
    if (!userEmail) {
      throw new Error(
        "QuickBooks did not return an email. Ensure OpenID scope is requested."
      );
    }

    return { userEmail, accessToken, refreshToken, realmId };
  } catch (error) {
    console.error("❌ QuickBooks OAuth error:", error);
    throw error;
  }
}

export { quickbooksAuthClient, getQuickBooksAuthURL, handleQuickBooksCallback };
