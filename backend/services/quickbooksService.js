import { quickbooksAuthClient } from "../config/quickbooksAuth.js";
import { getToken, getAllTokensByPlatform } from "../services/tokenService.js";

// ✅ **Global declaration of QuickBooks API Base URL** (sandbox/production auto switch)
const QUICKBOOKS_BASE_URL =
  process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

// Helper functions to extract data from QuickBooks reports
function getReportValue(report, rowName) {
  try {
    const rows = report.Rows?.Row || [];
    // First try to find in top-level rows
    let row = rows.find(
      (r) =>
        r.Header?.ColData?.[0]?.value === rowName ||
        r.Summary?.ColData?.[0]?.value === rowName
    );

    // If not found, try to find in sub-rows
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

    // Try to get value from different positions
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

// Helper function: safe division calculation, avoiding NaN and Infinity
function safeDivision(numerator, denominator) {
  if (!denominator || denominator === 0) return 0;
  const result = numerator / denominator;
  if (isNaN(result) || !isFinite(result)) return 0;
  return result;
}

// Helper function: formatting percentage
function formatPercentage(value) {
  if (isNaN(value) || !isFinite(value)) return 0;
  // Limit decimal places to 2
  return Math.round(value * 10000) / 10000;
}

// Helper function: calculating year-over-year change rate
function calculateYearOverYearChange(current, previous) {
  // Ensure input values are valid numbers
  current = ensureValidNumber(current);
  previous = ensureValidNumber(previous);

  // If both values are 0, return 0
  if (current === 0 && previous === 0) return 0;

  // If only previous is 0 but current is not, return 1 (indicating 100% growth)
  if (previous === 0 && current !== 0) return 1;

  // If current is 0 but previous is not, return -1 (indicating -100%)
  if (current === 0 && previous !== 0) return -1;

  // Calculate change rate
  const change = (current - previous) / Math.abs(previous);
  return formatPercentage(change);
}

// Helper function: ensure value is valid
function ensureValidNumber(value) {
  // Handle special characters
  if (value === undefined || value === null || value === "-" || value === "")
    return 0;

  // If it's a string, remove all commas and spaces
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

    // Try to get previous period value from different positions
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

    // Try to get previous period value from different positions
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
 * 📌 **Get QuickBooks API client with stored access token (skip `expires_at` check)**
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

    // ✅ Directly use accessToken
    quickbooksAuthClient.setToken(accessToken);

    return { client: quickbooksAuthClient, realmId, accessToken };
  } catch (error) {
    console.error("❌ Failed to get QuickBooks client:", error);
    throw error;
  }
}

/**
 * 📌 **Get QuickBooks company information**
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
 * 📌 **Get all QuickBooks invoices**
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

    // Current period data
    const currentRevenue = ensureValidNumber(extractRevenue(profitLoss));
    const currentNetIncome = ensureValidNumber(extractNetIncome(profitLoss));
    const currentExpenses = ensureValidNumber(extractExpenses(profitLoss));
    const currentGrossProfit = ensureValidNumber(
      extractGrossProfit(profitLoss)
    );
    const currentOperatingIncome = ensureValidNumber(
      extractOperatingIncome(profitLoss)
    );

    // Previous period data
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

/**
 * 📊 Get Transaction List
 */
async function getTransactionList(options = {}) {
  try {
    console.log("🔍 Fetching transaction list with options:", options);
    const { client, realmId, accessToken } = await getQuickBooksClient();

    if (!accessToken) {
      throw new Error("❌ No access token found");
    }

    // Calculate date range (last 12 months)
    const end_date = new Date().toISOString().split("T")[0];
    const start_date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Build URL with query parameters
    const url = `${QUICKBOOKS_BASE_URL}/v3/company/${realmId}/reports/TransactionList?start_date=${
      options.start_date || start_date
    }&end_date=${
      options.end_date || end_date
    }&group_by=Customer&minorversion=75`;

    console.log("🔍 Using URL:", url);

    const response = await client.makeApiCall({
      url: url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/json",
      },
    });

    // Log raw response data for debugging
    console.log(
      "📥 Raw QuickBooks response data:",
      JSON.stringify(response.response?.data, null, 2)
    );

    // Process the data before returning
    const processedData = processTransactionData(response.response?.data || {});

    // Log processed data for debugging
    console.log("📊 Processed transaction data:", {
      incomeCount: processedData.income.length,
      expenseCount: processedData.expense.length,
      adjustmentCount: processedData.adjustment.length,
    });

    return processedData;
  } catch (error) {
    console.error("❌ Failed to fetch transaction list:", error);
    throw error;
  }
}

/**
 * Process transaction data from QuickBooks API
 * @param {Object} data - Raw data from QuickBooks API
 * @returns {Object} Processed transaction data
 */
function processTransactionData(data) {
  console.log("📊 Processing transaction data");

  if (!data || !data.Rows || !data.Rows.Row) {
    console.log("⚠️ No transaction data found in the response");
    return {
      income: [],
      expense: [],
      adjustment: [],
    };
  }

  const transactions = {
    income: [],
    expense: [],
    adjustment: [],
  };

  // Process each customer group
  data.Rows.Row.forEach((customerGroup) => {
    if (!customerGroup.Rows || !customerGroup.Rows.Row) {
      console.log(
        "⚠️ No transactions found in customer group:",
        customerGroup.Header?.ColData?.[0]?.value
      );
      return;
    }

    const customerName =
      customerGroup.Header?.ColData?.[0]?.value || "Not Specified";

    // Process each transaction for the customer
    customerGroup.Rows.Row.forEach((row) => {
      if (row.type !== "Data" || !row.ColData) {
        console.log("⚠️ Skipping invalid row:", row);
        return;
      }

      try {
        // Find the amount column (usually the last numeric column)
        let amount = 0;
        for (let i = row.ColData.length - 1; i >= 0; i--) {
          const value = row.ColData[i]?.value;
          if (value && !isNaN(parseFloat(value.replace(/,/g, "")))) {
            amount = parseFloat(value.replace(/,/g, ""));
            break;
          }
        }

        // Extract transaction data
        const transaction = {
          date: row.ColData[0]?.value || "",
          type: row.ColData[1]?.value || "",
          docNum: row.ColData[2]?.value || "",
          name: customerName,
          memo: row.ColData[4]?.value || "",
          account: row.ColData[5]?.value || "",
          amount: amount,
        };

        // Skip transactions with missing required fields
        if (!transaction.date || !transaction.type) {
          console.log(
            "⚠️ Skipping transaction with missing required fields:",
            transaction
          );
          return;
        }

        // Log the transaction for debugging
        console.log("Processing transaction:", {
          type: transaction.type,
          amount: transaction.amount,
          name: transaction.name,
        });

        // Categorize transaction based on type and amount
        if (isIncomeTransaction(transaction.type) || transaction.amount > 0) {
          transactions.income.push(transaction);
        } else if (
          isExpenseTransaction(transaction.type) ||
          transaction.amount < 0
        ) {
          transaction.amount = Math.abs(transaction.amount);
          transactions.expense.push(transaction);
        } else {
          transactions.adjustment.push(transaction);
        }
      } catch (error) {
        console.error("❌ Error processing transaction row:", error);
      }
    });
  });

  // Sort transactions by date (newest first)
  const sortByDate = (a, b) => new Date(b.date) - new Date(a.date);
  transactions.income.sort(sortByDate);
  transactions.expense.sort(sortByDate);
  transactions.adjustment.sort(sortByDate);

  // Log summary for debugging
  console.log("Transaction summary:", {
    income: `${
      transactions.income.length
    } transactions, total: $${transactions.income.reduce(
      (sum, t) => sum + t.amount,
      0
    )}`,
    expense: `${
      transactions.expense.length
    } transactions, total: $${transactions.expense.reduce(
      (sum, t) => sum + t.amount,
      0
    )}`,
    adjustment: `${transactions.adjustment.length} transactions`,
  });

  return transactions;
}

// Income transaction types
function isIncomeTransaction(type) {
  const incomeTypes = [
    "Invoice",
    "Sales Receipt",
    "Payment",
    "Deposit",
    "Credit Memo",
    "Time Charge",
    "Billable Expense Charge",
  ];
  return incomeTypes.includes(type);
}

// Expense transaction types
function isExpenseTransaction(type) {
  const expenseTypes = [
    "Bill",
    "Expense",
    "Check",
    "Bill Payment",
    "Purchase Order",
    "Credit Card Expense",
    "Cash Expense",
  ];
  return expenseTypes.includes(type);
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
  getTransactionList,
  processTransactionData,
};
