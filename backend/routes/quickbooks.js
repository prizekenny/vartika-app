import express from "express";
import {
  getCompanyInfo,
  getInvoices,
  isAuthorized,
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

export default router;
