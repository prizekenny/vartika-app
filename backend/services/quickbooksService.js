import { quickbooksAuthClient } from "../config/quickbooksAuth.js";
import { getToken, getAllTokensByPlatform } from "../services/tokenService.js";

// ✅ **全局声明 QuickBooks API Base URL** (sandbox/production 自动切换)
const QUICKBOOKS_BASE_URL =
  process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

/**
 * 📌 **Get QuickBooks API client with stored access token (跳过 `expires_at` 检测)**
 */
async function getQuickBooksClient() {
  try {
    const tokenData = await getToken("hantheme@outlook.com", "quickbooks");

    console.log("🔍 Debug: Retrieved Token Data:", tokenData);

    if (!tokenData || !tokenData.access_token) {
      throw new Error("❌ No QuickBooks access token found. Please authorize.");
    }

    const accessToken = tokenData.access_token;
    const realmId = tokenData.realm_id;

    if (!realmId) {
      throw new Error(
        "❌ QuickBooks realmId is missing. Reauthorization required."
      );
    }

    console.log(
      `🔍 Debug: Using Access Token: ${accessToken}, realmID: ${realmId}`
    );

    // ✅ 直接使用 accessToken
    quickbooksAuthClient.setToken(accessToken);

    return { client: quickbooksAuthClient, realmId, accessToken };
  } catch (error) {
    console.error("❌ Failed to get QuickBooks client:", error);
    throw error;
  }
}

/**
 * 📌 **获取 QuickBooks 公司信息**
 */
async function getCompanyInfo() {
  try {
    const { client, realmId, accessToken } = await getQuickBooksClient();

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/companyinfo/${realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = response.json ? response.json : response.response?.data;
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch company info:", error);
    throw error;
  }
}

/**
 * 📌 **获取 QuickBooks 的所有发票**
 */
async function getInvoices() {
  try {
    console.log("🔍 Debug: Fetching QuickBooks invoices...");
    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No Access Token Found.");
    }

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/query?query=SELECT * FROM Invoice`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = response.json ? response.json : response.response?.data;
    return data;
  } catch (error) {
    console.error("❌ Failed to fetch invoices:", error);
    throw error;
  }
}

/**
 * 🔍 Check if QuickBooks is authorized via API
 */
async function isAuthorized() {
  try {
    console.log("🔍 Debug: Checking QuickBooks Authorization...");

    // ✅ Use `getQuickBooksClient()` to ensure correct token retrieval
    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      console.log("❌ No Access Token Found.");
      return { authorized: false, error: "No valid access token found" };
    }

    // ✅ Test API call to check authorization
    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/companyinfo/${realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    const data = response.json ? response.json : response.response?.data;

    console.log(`✅ QuickBooks API authorized for company:`, data);
    return { authorized: true, company: data };
  } catch (error) {
    console.error(`❌ QuickBooks authorization failed:`, error);
    return { authorized: false, error: "Invalid or expired token" };
  }
}

/**
 * 📊 Retrieve Profit and Loss Report
 */
async function reportProfitAndLoss(options = {}) {
  try {
    console.log("🔍 Fetching Profit and Loss Report...");

    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No Access Token Found.");
    }

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/reports/ProfitAndLoss`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: options, // Pass user-provided options
    });

    console.log(
      "✅ Profit and Loss Report retrieved:",
      response.response?.data
    );
    return response.response?.data;
  } catch (error) {
    console.error("❌ Failed to fetch Profit and Loss Report:", error);
    throw error;
  }
}

/**
 * 📊 Retrieve Profit and Loss Detail Report
 */
async function reportProfitAndLossDetail(options = {}) {
  try {
    console.log("🔍 Fetching Profit and Loss Detail Report...");

    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No Access Token Found.");
    }

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/reports/ProfitAndLossDetail`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: options, // Pass user-provided options
    });

    console.log(
      "✅ Profit and Loss Detail Report retrieved:",
      response.response?.data
    );
    return response.response?.data;
  } catch (error) {
    console.error("❌ Failed to fetch Profit and Loss Detail Report:", error);
    throw error;
  }
}

/**
 * 🔍 Get all authorized QuickBooks users from cache
 */
async function getAllAuthorizedUsers() {
  const allTokens = await getAllTokensByPlatform("quickbooks");
  const authorizedUsers = [];

  for (const token of allTokens) {
    try {
      const { client, realmId, accessToken } = await getQuickBooksClient(
        token.user_email
      );
      await client.makeApiCall({
        url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/companyinfo/${realmId}`,
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      });

      authorizedUsers.push(token.user_email);
    } catch (error) {
      console.error(
        `❌ QuickBooks API authorization failed for ${token.user_email}:`,
        error
      );
    }
  }

  return authorizedUsers;
}

export {
  getCompanyInfo,
  getInvoices,
  isAuthorized,
  getAllAuthorizedUsers,
  reportProfitAndLoss,
  reportProfitAndLossDetail,
};
