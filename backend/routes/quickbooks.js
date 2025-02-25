import express from "express";
import { getCompanyInfo, getInvoices } from "../services/quickbooksService.js";

const router = express.Router();

/**
 * 📌 **获取 QuickBooks 公司的基本信息**
 */
router.get("/company", async (req, res) => {
  try {
    const data = await getCompanyInfo(req.user);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 **获取 QuickBooks 的所有发票**
 */
router.get("/invoices", async (req, res) => {
  try {
    const data = await getInvoices(req.user);
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
