import express from "express";
import {
  getCompanyInfo,
  getInvoices,
  isAuthorized,
  getAllAuthorizedUsers,
  reportProfitAndLoss,
  reportProfitAndLossDetail,
  reportBalanceSheet,
  reportCashFlow,
  getFinancialOverview,
} from "../services/quickbooksService.js";

const router = express.Router();

/**
 * 📌 **Get QuickBooks company information**
 */
router.get("/company", async (req, res) => {
  try {
    const data = await getCompanyInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 **Get all invoices from QuickBooks**
 */
router.get("/invoices", async (req, res) => {
  try {
    const data = await getInvoices();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔍 Check if QuickBooks is authorized
 */
router.get("/authorized", async (req, res) => {
  try {
    const result = await isAuthorized();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 Get Profit and Loss Report
 */
router.get("/reports/profit-and-loss", async (req, res) => {
  try {
    const options = req.query; // Get user-defined filters
    const report = await reportProfitAndLoss(options);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 Get Profit and Loss Detail Report
 */
router.get("/reports/profit-and-loss-detail", async (req, res) => {
  try {
    const options = req.query; // Get user-defined filters
    const report = await reportProfitAndLossDetail(options);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * ✅ Get all authorized QuickBooks users
 */
router.get("/authorized-users", async (req, res) => {
  try {
    const authorizedUsers = await getAllAuthorizedUsers();
    res.json({ authorizedUsers });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 Get Balance Sheet Report
 */
router.get("/reports/balance-sheet", async (req, res) => {
  try {
    const options = req.query; // Get user-defined filters
    const report = await reportBalanceSheet(options);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 Get Cash Flow Report
 */
router.get("/reports/cash-flow", async (req, res) => {
  try {
    const options = req.query; // Get user-defined filters
    const report = await reportCashFlow(options);
    res.json(report);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📊 Get Financial Overview
 * Combines key metrics from all reports
 */
router.get("/reports/overview", async (req, res) => {
  try {
    const options = req.query; // Get user-defined filters
    const overview = await getFinancialOverview(options);
    res.json(overview);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
