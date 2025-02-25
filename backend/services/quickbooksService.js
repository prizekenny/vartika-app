import { quickbooksAuthClient } from "../config/quickbooksAuth.js";
import { getToken, updateToken } from "../services/tokenService.js";

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
    const tokenData = await getToken("vartika.portal@gmail.com", "quickbooks");

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
export { getCompanyInfo, getInvoices, isAuthorized };
