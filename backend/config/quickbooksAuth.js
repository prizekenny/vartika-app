import OAuthClient from "intuit-oauth";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const QUICKBOOKS_REDIRECT_URI = `${BASE_URL}/auth/quickbooks/callback`;

// 🔹 **创建 QuickBooks OAuth 客户端**
const quickbooksAuthClient = new OAuthClient({
  clientId: process.env.QUICKBOOKS_CLIENT_ID,
  clientSecret: process.env.QUICKBOOKS_CLIENT_SECRET,
  environment: process.env.QUICKBOOKS_ENV, // "sandbox" 或 "production"
  redirectUri: QUICKBOOKS_REDIRECT_URI,
  logging: true,
});

/**
 * 🔗 **获取 QuickBooks OAuth 认证 URL**
 */
function getQuickBooksAuthURL() {
  return quickbooksAuthClient.authorizeUri({
    scope: [OAuthClient.scopes.Accounting], // 访问 QuickBooks Accounting API
    state: "security_token", // 可选的 CSRF 保护 token
  });
}

/**
 * 🔑 **处理 QuickBooks OAuth 回调**
 */
async function handleQuickBooksCallback({ url }) {
  try {
    const authResponse = await quickbooksAuthClient.createToken(url);
    return {
      accessToken: authResponse.getJson().access_token,
      refreshToken: authResponse.getJson().refresh_token,
      realmId: authResponse.getJson().realmId,
    };
  } catch (error) {
    console.error("❌ QuickBooks OAuth error:", error);
    throw error;
  }
}

/**
 * 🔗 **创建 QuickBooks API 客户端**
 */
async function quickbooksClient(accessToken) {
  return {
    request: async (endpoint) => {
      try {
        const response = await quickbooksAuthClient.makeApiCall({
          url: `https://sandbox-quickbooks.api.intuit.com/v3/company/${process.env.QUICKBOOKS_REALM_ID}${endpoint}`,
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            Accept: "application/json",
          },
        });
        return response.getJson();
      } catch (error) {
        console.error(`❌ QuickBooks API Request Failed: ${endpoint}`, error);
        throw error;
      }
    },
  };
}

export {
  quickbooksAuthClient,
  getQuickBooksAuthURL,
  handleQuickBooksCallback,
  quickbooksClient,
};
