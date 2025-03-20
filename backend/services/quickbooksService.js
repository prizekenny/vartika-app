import { quickbooksAuthClient } from "../config/quickbooksAuth.js";
import { getToken, getAllTokensByPlatform } from "../services/tokenService.js";

// ✅ **全局声明 QuickBooks API Base URL** (sandbox/production 自动切换)
const QUICKBOOKS_BASE_URL =
  process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

// Helper functions to extract data from QuickBooks reports
function getReportValue(report, rowName) {
  try {
    const rows = report.Rows?.Row || [];
    // 首先尝试在顶层行中查找
    let row = rows.find(
      (r) =>
        r.Header?.ColData?.[0]?.value === rowName ||
        r.Summary?.ColData?.[0]?.value === rowName
    );

    // 如果没找到，尝试在子行中查找
    if (!row) {
      for (const topRow of rows) {
        if (topRow.Rows?.Row) {
          row = topRow.Rows.Row.find(
            (r) =>
              r.ColData?.[0]?.value === rowName ||
              r.Summary?.ColData?.[0]?.value === rowName
          );
          if (row) break;
        }
      }
    }

    if (!row) {
      console.warn(`Row ${rowName} not found in report`);
      return 0;
    }

    // 尝试从不同位置获取值
    let value = row.Summary?.ColData?.[1]?.value;
    if (!value && value !== 0) {
      value = row.ColData?.[1]?.value;
    }
    if (!value && value !== 0) {
      value = row.Rows?.Row?.[0]?.ColData?.[1]?.value;
    }

    return ensureValidNumber(value);
  } catch (error) {
    console.warn(`Failed to extract ${rowName}:`, error);
    return 0;
  }
}

function extractPeriod(report) {
  return report.Header?.Time || "Current Period";
}

function extractRevenue(report) {
  return getReportValue(report, "Income");
}

function extractExpenses(report) {
  return getReportValue(report, "Expenses");
}

function extractNetIncome(report) {
  return getReportValue(report, "Net Income");
}

function extractGrossProfit(report) {
  return getReportValue(report, "Gross Profit");
}

function extractOperatingIncome(report) {
  return getReportValue(report, "Operating Income");
}

// 辅助函数：安全的除法计算，避免 NaN 和 Infinity
function safeDivision(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  const result = numerator / denominator;
  if (isNaN(result) || !isFinite(result)) return 0;
  return result;
}

// 辅助函数：格式化百分比
function formatPercentage(value) {
  if (isNaN(value) || !isFinite(value)) return 0;
  // 限制小数位数为2位
  return Math.round(value * 10000) / 10000;
}

// 辅助函数：计算同比变化率
function calculateYearOverYearChange(current, previous) {
  // 确保输入值是有效数字
  current = ensureValidNumber(current);
  previous = ensureValidNumber(previous);

  // 如果两个值都是0，返回0
  if (current === 0 && previous === 0) return 0;

  // 如果只有前期为0，但当期不为0，返回1（表示100%增长）
  if (previous === 0 && current !== 0) return 1;

  // 如果当期为0，前期不为0，返回-1（表示-100%）
  if (current === 0 && previous !== 0) return -1;

  // 计算变化率
  const change = (current - previous) / Math.abs(previous);
  return formatPercentage(change);
}

// 辅助函数：确保数值有效
function ensureValidNumber(value) {
  // 处理特殊字符
  if (value === undefined || value === null || value === "-" || value === "")
    return 0;

  // 如果是字符串，移除所有逗号和空格
  if (typeof value === "string") {
    value = value.replace(/,/g, "").trim();
  }

  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
}

function extractPreviousPeriodRevenue(report) {
  try {
    const rows = report.Rows?.Row || [];
    const incomeRow = rows.find((row) => {
      const headerValue = row.Header?.ColData?.[0]?.value;
      return (
        headerValue === "Total Income" ||
        headerValue === "Income" ||
        headerValue === "Revenue"
      );
    });

    if (!incomeRow) {
      console.warn("Income row not found in report");
      return 0;
    }

    // 尝试从不同位置获取上期值
    const value = ensureValidNumber(
      incomeRow.Summary?.ColData?.[2]?.value ||
        incomeRow.ColData?.[2]?.value ||
        incomeRow.Rows?.Row?.[0]?.ColData?.[2]?.value ||
        0
    );

    return value;
  } catch (error) {
    console.warn("Failed to extract Previous Period Revenue:", error);
    return 0;
  }
}

function extractPreviousPeriodNetIncome(report) {
  try {
    const rows = report.Rows?.Row || [];
    const netIncomeRow = rows.find((row) => {
      const headerValue = row.Header?.ColData?.[0]?.value;
      return (
        headerValue === "Net Income" ||
        headerValue === "Net Earnings" ||
        headerValue === "Net Profit"
      );
    });

    if (!netIncomeRow) {
      console.warn("Net Income row not found in report");
      return 0;
    }

    // 尝试从不同位置获取上期值
    const value = ensureValidNumber(
      netIncomeRow.Summary?.ColData?.[2]?.value ||
        netIncomeRow.ColData?.[2]?.value ||
        netIncomeRow.Rows?.Row?.[0]?.ColData?.[2]?.value ||
        0
    );

    return value;
  } catch (error) {
    console.warn("Failed to extract Previous Period Net Income:", error);
    return 0;
  }
}

function extractTotalAssets(report) {
  try {
    const rows = report.Rows?.Row || [];
    const totalAssetsRow = rows.find((row) => {
      const headerValue = row.Summary?.ColData?.[0]?.value;
      return headerValue === "TOTAL ASSETS";
    });

    if (!totalAssetsRow) {
      console.warn("Total Assets row not found in report");
      return 0;
    }

    const value = totalAssetsRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Total Assets:", error);
    return 0;
  }
}

function extractCurrentAssets(report) {
  try {
    const rows = report.Rows?.Row || [];
    const assetsSection = rows.find(
      (row) => row.Header?.ColData?.[0]?.value === "ASSETS"
    );
    if (!assetsSection || !assetsSection.Rows?.Row) return 0;

    const currentAssetsRow = assetsSection.Rows.Row.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Total Current Assets";
    });

    if (!currentAssetsRow) {
      console.warn("Current Assets row not found in report");
      return 0;
    }

    const value = currentAssetsRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Current Assets:", error);
    return 0;
  }
}

function extractFixedAssets(report) {
  try {
    const rows = report.Rows?.Row || [];
    const assetsSection = rows.find(
      (row) => row.Header?.ColData?.[0]?.value === "ASSETS"
    );
    if (!assetsSection || !assetsSection.Rows?.Row) return 0;

    const fixedAssetsRow = assetsSection.Rows.Row.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Total Fixed Assets";
    });

    if (!fixedAssetsRow) {
      console.warn("Fixed Assets row not found in report");
      return 0;
    }

    const value = fixedAssetsRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Fixed Assets:", error);
    return 0;
  }
}

function extractTotalLiabilities(report) {
  return getReportValue(report, "Total Liabilities");
}

function extractCurrentLiabilities(report) {
  try {
    const rows = report.Rows?.Row || [];
    const liabilitiesSection = rows.find(
      (row) => row.Header?.ColData?.[0]?.value === "LIABILITIES AND EQUITY"
    );
    if (!liabilitiesSection || !liabilitiesSection.Rows?.Row) return 0;

    const currentLiabilitiesRow = liabilitiesSection.Rows.Row[0].Rows.Row.find(
      (row) => {
        const summary = row.Summary?.ColData?.[0]?.value;
        return summary === "Total Current Liabilities";
      }
    );

    if (!currentLiabilitiesRow) {
      console.warn("Current Liabilities row not found in report");
      return 0;
    }

    const value = currentLiabilitiesRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Current Liabilities:", error);
    return 0;
  }
}

function extractLongTermLiabilities(report) {
  try {
    const rows = report.Rows?.Row || [];
    const liabilitiesSection = rows.find(
      (row) => row.Header?.ColData?.[0]?.value === "LIABILITIES AND EQUITY"
    );
    if (!liabilitiesSection || !liabilitiesSection.Rows?.Row) return 0;

    const longTermLiabilitiesRow = liabilitiesSection.Rows.Row[0].Rows.Row.find(
      (row) => {
        const summary = row.Summary?.ColData?.[0]?.value;
        return summary === "Total Long-Term Liabilities";
      }
    );

    if (!longTermLiabilitiesRow) {
      console.warn("Long Term Liabilities row not found in report");
      return 0;
    }

    const value = longTermLiabilitiesRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Long Term Liabilities:", error);
    return 0;
  }
}

function extractTotalEquity(report) {
  return getReportValue(report, "Total Equity");
}

function extractRetainedEarnings(report) {
  try {
    const rows = report.Rows?.Row || [];
    const retainedEarningsRow = rows.find((row) => {
      const headerValue = row.Header?.ColData?.[0]?.value;
      return (
        headerValue === "Retained Earnings" ||
        headerValue === "Accumulated Retained Earnings" ||
        headerValue === "Retained Profits"
      );
    });

    if (!retainedEarningsRow) {
      console.warn("Retained Earnings row not found in report");
      return 0;
    }

    const value =
      retainedEarningsRow.Summary?.ColData?.[1]?.value ||
      retainedEarningsRow.ColData?.[1]?.value ||
      retainedEarningsRow.Rows?.Row?.[0]?.ColData?.[1]?.value ||
      0;

    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Retained Earnings:", error);
    return 0;
  }
}

function extractOperatingCash(report) {
  try {
    const rows = report.Rows?.Row || [];
    const operatingRow = rows.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Net cash provided by operating activities";
    });

    if (!operatingRow) {
      console.warn("Operating Cash Flow row not found in report");
      return 0;
    }

    const value = operatingRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Operating Cash:", error);
    return 0;
  }
}

function extractInvestingCash(report) {
  try {
    const rows = report.Rows?.Row || [];
    const investingRow = rows.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Net cash provided by investing activities";
    });

    if (!investingRow) {
      console.warn("Investing Cash Flow row not found in report");
      return 0;
    }

    const value = investingRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Investing Cash:", error);
    return 0;
  }
}

function extractFinancingCash(report) {
  try {
    const rows = report.Rows?.Row || [];
    const financingRow = rows.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Net cash provided by financing activities";
    });

    if (!financingRow) {
      console.warn("Financing Cash Flow row not found in report");
      return 0;
    }

    const value = financingRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Financing Cash:", error);
    return 0;
  }
}

function extractBeginningCash(report) {
  try {
    const rows = report.Rows?.Row || [];
    const beginningCashRow = rows.find((row) => {
      const value = row.ColData?.[0]?.value;
      return value === "Cash at beginning of period";
    });

    if (!beginningCashRow) {
      console.warn("Beginning Cash row not found in report");
      return 0;
    }

    const value = beginningCashRow.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Beginning Cash:", error);
    return 0;
  }
}

function extractEndingCash(report) {
  try {
    const rows = report.Rows?.Row || [];
    const endingCashRow = rows.find((row) => {
      const summary = row.Summary?.ColData?.[0]?.value;
      return summary === "Cash at end of period";
    });

    if (!endingCashRow) {
      console.warn("Ending Cash row not found in report");
      return 0;
    }

    const value = endingCashRow.Summary?.ColData?.[1]?.value || 0;
    return parseFloat(value) || 0;
  } catch (error) {
    console.warn("Failed to extract Ending Cash:", error);
    return 0;
  }
}

function calculateCashRatio(cashFlow, balanceSheet) {
  const cash = extractEndingCash(cashFlow);
  const currentLiabilities = extractCurrentLiabilities(balanceSheet);
  return formatPercentage(safeDivision(cash, currentLiabilities));
}

function calculateFreeCashFlow(cashFlow) {
  const operatingCash = extractOperatingCash(cashFlow);
  const investingCash = extractInvestingCash(cashFlow);
  return operatingCash + investingCash;
}

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
      params: {
        ...options,
        accounting_method: "Accrual",
        columns: "tx_date,total_amt,prev_total",
        date_macro: options.date_macro || "This Quarter-to-date",
        minorversion: "65",
        comparison_periods: "1",
        comparison_column: true,
      },
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

/**
 * 📊 Retrieve Balance Sheet Report
 */
async function reportBalanceSheet(options = {}) {
  try {
    console.log("🔍 Fetching Balance Sheet Report...");

    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No Access Token Found.");
    }

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/reports/BalanceSheet`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: {
        ...options,
        accounting_method: "Accrual",
        columns: "tx_date,total_amt",
        date_macro: options.date_macro || "This Quarter-to-date",
        minorversion: "65",
      },
    });

    console.log("✅ Balance Sheet Report retrieved:", response.response?.data);
    return response.response?.data;
  } catch (error) {
    console.error("❌ Failed to fetch Balance Sheet Report:", error);
    throw error;
  }
}

/**
 * 📊 Retrieve Cash Flow Report
 */
async function reportCashFlow(options = {}) {
  try {
    console.log("🔍 Fetching Cash Flow Report...");

    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No Access Token Found.");
    }

    const response = await client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/reports/CashFlow`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
      params: {
        ...options,
        columns: "tx_date,total_amt",
        date_macro: options.date_macro || "This Quarter-to-date",
        minorversion: "65",
      },
    });

    console.log("✅ Cash Flow Report retrieved:", response.response?.data);
    return response.response?.data;
  } catch (error) {
    console.error("❌ Failed to fetch Cash Flow Report:", error);
    throw error;
  }
}

/**
 * 📊 Get Financial Overview
 * Combines key metrics from all reports into a single response
 */
async function getFinancialOverview(options = {}) {
  try {
    console.log("🔍 Fetching Financial Overview...");

    // Fetch all reports in parallel
    const [profitLoss, balanceSheet, cashFlow] = await Promise.all([
      reportProfitAndLoss(options),
      reportBalanceSheet(options),
      reportCashFlow(options),
    ]);

    // 当前期间的数据
    const currentRevenue = ensureValidNumber(extractRevenue(profitLoss));
    const currentNetIncome = ensureValidNumber(extractNetIncome(profitLoss));
    const currentExpenses = ensureValidNumber(extractExpenses(profitLoss));
    const currentGrossProfit = ensureValidNumber(
      extractGrossProfit(profitLoss)
    );
    const currentOperatingIncome = ensureValidNumber(
      extractOperatingIncome(profitLoss)
    );

    // 上期数据
    const previousRevenue = ensureValidNumber(
      extractPreviousPeriodRevenue(profitLoss)
    );
    const previousNetIncome = ensureValidNumber(
      extractPreviousPeriodNetIncome(profitLoss)
    );

    // Extract and format key metrics
    const overview = {
      profitLoss: {
        revenue: currentRevenue,
        expenses: currentExpenses,
        netIncome: currentNetIncome,
        grossProfit: currentGrossProfit,
        operatingIncome: currentOperatingIncome,
        previousPeriodRevenue: previousRevenue,
        previousPeriodNetIncome: previousNetIncome,
        revenueChange: calculateYearOverYearChange(
          currentRevenue,
          previousRevenue
        ),
        netIncomeChange: calculateYearOverYearChange(
          currentNetIncome,
          previousNetIncome
        ),
        period: extractPeriod(profitLoss),
      },
      balanceSheet: {
        totalAssets: ensureValidNumber(extractTotalAssets(balanceSheet)),
        currentAssets: ensureValidNumber(extractCurrentAssets(balanceSheet)),
        fixedAssets: ensureValidNumber(extractFixedAssets(balanceSheet)),
        totalLiabilities: ensureValidNumber(
          extractTotalLiabilities(balanceSheet)
        ),
        currentLiabilities: ensureValidNumber(
          extractCurrentLiabilities(balanceSheet)
        ),
        longTermLiabilities: ensureValidNumber(
          extractLongTermLiabilities(balanceSheet)
        ),
        totalEquity: ensureValidNumber(extractTotalEquity(balanceSheet)),
        retainedEarnings: ensureValidNumber(
          extractRetainedEarnings(balanceSheet)
        ),
        period: extractPeriod(balanceSheet),
      },
      cashFlow: {
        operatingCash: ensureValidNumber(extractOperatingCash(cashFlow)),
        investingCash: ensureValidNumber(extractInvestingCash(cashFlow)),
        financingCash: ensureValidNumber(extractFinancingCash(cashFlow)),
        beginningCash: ensureValidNumber(extractBeginningCash(cashFlow)),
        endingCash: ensureValidNumber(extractEndingCash(cashFlow)),
        freeCashFlow: ensureValidNumber(calculateFreeCashFlow(cashFlow)),
        cashRatio: formatPercentage(calculateCashRatio(cashFlow, balanceSheet)),
        period: extractPeriod(cashFlow),
      },
    };

    console.log("✅ Financial Overview compiled");
    return overview;
  } catch (error) {
    console.error("❌ Failed to compile Financial Overview:", error);
    throw error;
  }
}

export {
  getCompanyInfo,
  getInvoices,
  isAuthorized,
  getAllAuthorizedUsers,
  reportProfitAndLoss,
  reportProfitAndLossDetail,
  reportBalanceSheet,
  reportCashFlow,
  getFinancialOverview,
  getReportValue,
  extractPeriod,
  extractRevenue,
  extractExpenses,
  extractNetIncome,
  extractGrossProfit,
  extractOperatingIncome,
  extractPreviousPeriodRevenue,
  extractPreviousPeriodNetIncome,
  extractTotalAssets,
  extractCurrentAssets,
  extractFixedAssets,
  extractTotalLiabilities,
  extractCurrentLiabilities,
  extractLongTermLiabilities,
  extractTotalEquity,
  extractRetainedEarnings,
  extractOperatingCash,
  extractInvestingCash,
  extractFinancingCash,
  extractBeginningCash,
  extractEndingCash,
  calculateFreeCashFlow,
  calculateCashRatio,
};
