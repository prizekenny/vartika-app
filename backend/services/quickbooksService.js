import axios from "axios";
import { quickbooksAuthClient } from "../config/quickbooksAuth.js";
import { updateToken } from "./tokenService.js";

const QUICKBOOKS_BASE_URL =
  process.env.QUICKBOOKS_ENV === "sandbox"
    ? "https://sandbox-quickbooks.api.intuit.com"
    : "https://quickbooks.api.intuit.com";

class QuickBooksClient {
  constructor(token) {
    if (!token || !token.access_token || !token.realm_id) {
      throw new Error("Invalid QuickBooks token");
    }
    this.accessToken = token.access_token;
    this.refreshToken = token.refresh_token;
    this.realmId = token.realm_id;
    this.expiresAt = token.expires_at;
    this.userEmail = token.user_email;
    this.client = quickbooksAuthClient;
    this.client.setToken(this.accessToken);
  }

  async #refreshAccessToken() {
    const res = await axios.post(
      "https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer",
      new URLSearchParams({
        grant_type: "refresh_token",
        refresh_token: this.refreshToken,
      }),
      {
        headers: {
          Authorization: `Basic ${Buffer.from(
            `${process.env.QUICKBOOKS_CLIENT_ID}:${process.env.QUICKBOOKS_CLIENT_SECRET}`
          ).toString("base64")}`,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    );

    const newToken = res.data;
    const newExpiresAt = new Date(Date.now() + newToken.expires_in * 1000);
    await updateToken(
      this.userEmail,
      "quickbooks",
      newToken.access_token,
      newToken.refresh_token || this.refreshToken,
      this.realmId,
      newExpiresAt
    );

    this.accessToken = newToken.access_token;
    this.refreshToken = newToken.refresh_token || this.refreshToken;
    this.expiresAt = newExpiresAt;
    this.client.setToken(this.accessToken);

    console.log(
      `✅ Token refreshed for ${this.userEmail} (${this.realmId}) (${newExpiresAt})`
    );
  }

  async #ensureValidToken() {
    if (
      !this.expiresAt ||
      new Date() >= new Date(this.expiresAt) - 5 * 60 * 1000
    ) {
      await this.#refreshAccessToken();
    }
  }

  async getCompanyInfo() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/companyinfo/${this.realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });
    return response.json || response.response?.data;
  }

  async getInvoices(params = {}) {
    await this.#ensureValidToken();

    console.log("📊 Fetching invoices from QuickBooks: params: ", params);
    const {
      search = "",
      startDate,
      endDate,
      minTotal,
      maxTotal,
      page = 1,
      pageSize = 10,
    } = params;

    let query = "SELECT * FROM Invoice";

    const toNumber = (val) => {
      const num = Number(val);
      return isNaN(num) || val === "" ? null : num;
    };

    const filters = [];

    const min = toNumber(minTotal);
    const max = toNumber(maxTotal);

    if (search) {
      filters.push(`CustomerRef.FullName LIKE '%${search}%'`);
    }
    if (startDate) {
      filters.push(`TxnDate >= '${startDate}'`);
    }
    if (endDate) {
      filters.push(`TxnDate <= '${endDate}'`);
    }
    if (min !== null) {
      filters.push(`TotalAmt >= ${min}`);
    }
    if (max !== null) {
      filters.push(`TotalAmt <= ${max}`);
    }

    if (filters.length > 0) {
      query += " WHERE " + filters.join(" AND ");
    }

    query += ` ORDER BY TxnDate DESC`;
    query += ` STARTPOSITION ${(page - 1) * pageSize + 1}`;
    query += ` MAXRESULTS ${pageSize}`;
    query = `SELECT * FROM Invoice ORDER BY TxnDate DESC STARTPOSITION 1 MAXRESULTS 1000`;
    const url = `${QUICKBOOKS_BASE_URL}/v3/company/${
      this.realmId
    }/query?query=${encodeURIComponent(query)}&minorversion=75`;

    console.log("📊 Query: ", query);
    console.log("📊 Query URL: ", url);

    const response = await this.client.makeApiCall({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    return response.response?.data?.QueryResponse || { Invoice: [] };
  }

  async isAuthorized() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/companyinfo/${this.realmId}`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });
    const data = response.json || response.response?.data;
    return { authorized: true, company: data };
  }

  async reportProfitAndLoss(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/ProfitAndLoss`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }

  async reportProfitAndLossDetail(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/ProfitAndLossDetail`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }

  async reportBalanceSheet(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/BalanceSheet`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }

  async reportCashFlow(options = {}) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/reports/CashFlow`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
      params: options,
    });
    return response.response?.data;
  }

  async getFinancialOverview(options = {}) {
    const [pl, bs, cf] = await Promise.all([
      this.reportProfitAndLoss(options),
      this.reportBalanceSheet(options),
      this.reportCashFlow(options),
    ]);

    return {
      profitLoss: {
        revenue: this.extractRevenue(pl),
        expenses: this.extractExpenses(pl),
        netIncome: this.extractNetIncome(pl),
        grossProfit: this.extractGrossProfit(pl),
        operatingIncome: this.extractOperatingIncome(pl),
        previousPeriodRevenue: this.extractPreviousPeriodRevenue(pl),
        previousPeriodNetIncome: this.extractPreviousPeriodNetIncome(pl),
        revenueChange: this.calculateYearOverYearChange(
          this.extractRevenue(pl),
          this.extractPreviousPeriodRevenue(pl)
        ),
        netIncomeChange: this.calculateYearOverYearChange(
          this.extractNetIncome(pl),
          this.extractPreviousPeriodNetIncome(pl)
        ),
        period: this.extractPeriod(pl),
      },
      balanceSheet: {
        totalAssets: this.extractTotalAssets(bs),
        currentAssets: this.extractCurrentAssets(bs),
        fixedAssets: this.extractFixedAssets(bs),
        totalLiabilities: this.extractTotalLiabilities(bs),
        currentLiabilities: this.extractCurrentLiabilities(bs),
        longTermLiabilities: this.extractLongTermLiabilities(bs),
        totalEquity: this.extractTotalEquity(bs),
        retainedEarnings: this.extractRetainedEarnings(bs),
        period: this.extractPeriod(bs),
      },
      cashFlow: {
        operatingCash: this.extractOperatingCash(cf),
        investingCash: this.extractInvestingCash(cf),
        financingCash: this.extractFinancingCash(cf),
        beginningCash: this.extractBeginningCash(cf),
        endingCash: this.extractEndingCash(cf),
        freeCashFlow: this.calculateFreeCashFlow(cf),
        cashRatio: this.calculateCashRatio(cf, bs),
        period: this.extractPeriod(cf),
      },
    };
  }

  async getTransactionList(options = {}) {
    await this.#ensureValidToken();

    const end_date = new Date().toISOString().split("T")[0];
    const start_date = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    const url = `${QUICKBOOKS_BASE_URL}/v3/company/${
      this.realmId
    }/reports/TransactionList?start_date=${
      options.start_date || start_date
    }&end_date=${
      options.end_date || end_date
    }&group_by=Customer&minorversion=75`;

    const response = await this.client.makeApiCall({
      url,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    return this.processTransactionData(response.response?.data || {});
  }

  /**
   * Process transaction data from QuickBooks API
   * @param {Object} data - Raw data from QuickBooks API
   * @returns {Object} Processed transaction data
   */
  processTransactionData(data) {
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
          if (
            this.isIncomeTransaction(transaction.type) ||
            transaction.amount > 0
          ) {
            transactions.income.push(transaction);
          } else if (
            this.isExpenseTransaction(transaction.type) ||
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
  isIncomeTransaction(type) {
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
  isExpenseTransaction(type) {
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

  // All extract* and calculate* methods should be placed here as class methods
  extractRevenue(report) {
    return this.getReportValue(report, "Income");
  }
  extractExpenses(report) {
    return this.getReportValue(report, "Expenses");
  }
  extractNetIncome(report) {
    return this.getReportValue(report, "Net Income");
  }
  extractGrossProfit(report) {
    return this.getReportValue(report, "Gross Profit");
  }
  extractOperatingIncome(report) {
    return this.getReportValue(report, "Operating Income");
  }
  extractPreviousPeriodRevenue(report) {
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
  extractPreviousPeriodNetIncome(report) {
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
  extractTotalAssets(report) {
    return this.getReportValue(report, "TOTAL ASSETS");
  }
  extractCurrentAssets(report) {
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
  extractFixedAssets(report) {
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
  extractTotalLiabilities(report) {
    return this.getReportValue(report, "Total Liabilities");
  }
  extractCurrentLiabilities(report) {
    try {
      const rows = report.Rows?.Row || [];
      const liabilitiesSection = rows.find(
        (row) => row.Header?.ColData?.[0]?.value === "LIABILITIES AND EQUITY"
      );
      if (!liabilitiesSection || !liabilitiesSection.Rows?.Row) return 0;

      const currentLiabilitiesRow =
        liabilitiesSection.Rows.Row[0].Rows.Row.find((row) => {
          const summary = row.Summary?.ColData?.[0]?.value;
          return summary === "Total Current Liabilities";
        });

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
  extractLongTermLiabilities(report) {
    try {
      const rows = report.Rows?.Row || [];
      const liabilitiesSection = rows.find(
        (row) => row.Header?.ColData?.[0]?.value === "LIABILITIES AND EQUITY"
      );
      if (!liabilitiesSection || !liabilitiesSection.Rows?.Row) return 0;

      const longTermLiabilitiesRow =
        liabilitiesSection.Rows.Row[0].Rows.Row.find((row) => {
          const summary = row.Summary?.ColData?.[0]?.value;
          return summary === "Total Long-Term Liabilities";
        });

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
  extractTotalEquity(report) {
    return this.getReportValue(report, "Total Equity");
  }
  extractRetainedEarnings(report) {
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
  extractOperatingCash(report) {
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
  extractInvestingCash(report) {
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
  extractFinancingCash(report) {
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
  extractBeginningCash(report) {
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
  extractEndingCash(report) {
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

  extractPeriod(report) {
    return report.Header?.Time || "Current Period";
  }

  calculateYearOverYearChange(current, previous) {
    current = this.ensureValidNumber(current);
    previous = this.ensureValidNumber(previous);
    if (current === 0 && previous === 0) return 0;
    if (previous === 0) return 1;
    if (current === 0) return -1;
    const change = (current - previous) / Math.abs(previous);
    return this.formatPercentage(change);
  }

  calculateCashRatio(cashFlow, balanceSheet) {
    const cash = this.extractEndingCash(cashFlow);
    const currentLiabilities = this.extractCurrentLiabilities(balanceSheet);
    return this.formatPercentage(this.safeDivision(cash, currentLiabilities));
  }

  calculateFreeCashFlow(cashFlow) {
    return (
      this.extractOperatingCash(cashFlow) + this.extractInvestingCash(cashFlow)
    );
  }

  getReportValue(report, rowName) {
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

  ensureValidNumber(value) {
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

  formatPercentage(value) {
    if (isNaN(value) || !isFinite(value)) return 0;
    // Limit decimal places to 2
    return Math.round(value * 10000) / 10000;
  }

  safeDivision(n, d) {
    if (!d || d === 0) return 0;
    const result = n / d;
    return isNaN(result) || !isFinite(result) ? 0 : result;
  }

  async downloadInvoicePdf(invoiceId) {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/invoice/${invoiceId}/pdf`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/pdf",
      },
      responseType: "arraybuffer",
    });

    return response.response?.data;
  }

  async getCustomerList() {
    await this.#ensureValidToken();
    const response = await this.client.makeApiCall({
      url: `${QUICKBOOKS_BASE_URL}/v3/company/${this.realmId}/query?query=SELECT * FROM Customer&minorversion=75`,
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/json",
      },
    });

    return response.response?.data?.QueryResponse?.Customer || [];
  }
}

export { QuickBooksClient };
