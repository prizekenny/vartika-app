import { quickbooksClient } from "../config/quickbooksAuth.js";

/**
 * 📌 **获取 QuickBooks 公司的基本信息**
 */
async function getCompanyInfo(user) {
  try {
    const qbClient = await quickbooksClient(user.quickbooksAccessToken);
    return await qbClient.request("/companyinfo/{realmId}");
  } catch (error) {
    console.error("❌ Failed to fetch company info:", error);
    throw error;
  }
}

/**
 * 📌 **获取 QuickBooks 的所有发票**
 */
async function getInvoices(user) {
  try {
    const qbClient = await quickbooksClient(user.quickbooksAccessToken);
    return await qbClient.request("/query?query=SELECT * FROM Invoice");
  } catch (error) {
    console.error("❌ Failed to fetch invoices:", error);
    throw error;
  }
}

export { getCompanyInfo, getInvoices };
