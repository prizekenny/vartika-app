import express from "express";
import { getQuickBooksToken } from "../services/tokenService.js";
import { QuickBooksClient } from "../services/quickbooksService.js";
import auditLog from "../middlewares/auditLog.js";

const router = express.Router();

/**
 * 📌 获取公司信息
 */
router.get("/company", auditLog("get_company_info"), async (req, res) => {
  try {
    const token = await getQuickBooksToken();
    const qb = new QuickBooksClient(token);

    const data = await qb.getCompanyInfo();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 获取发票
 */
router.get("/invoices", auditLog("get_invoices"), async (req, res) => {
  try {
    const token = await getQuickBooksToken();
    const qb = new QuickBooksClient(token);

    const data = await qb.getInvoices();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 获取 Profit and Loss Report
 */
router.get(
  "/reports/profit-and-loss",
  auditLog("get_profit_and_loss", (req) => req.query),
  async (req, res) => {
    try {
      const token = await getQuickBooksToken();
      const qb = new QuickBooksClient(token);

      const data = await qb.reportProfitAndLoss(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 📌 获取 Profit and Loss Detail Report
 */
router.get(
  "/reports/profit-and-loss-detail",
  auditLog("get_profit_and_loss_detail", (req) => req.query),
  async (req, res) => {
    try {
      const token = await getQuickBooksToken();
      const qb = new QuickBooksClient(token);

      const data = await qb.reportProfitAndLossDetail(req.query);
      res.json(data);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 📌 检查是否授权
 */
router.get("/authorized", auditLog("check_authorization"), async (req, res) => {
  try {
    const token = await getQuickBooksToken();
    const qb = new QuickBooksClient(token);

    const result = await qb.isAuthorized();
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📌 获取所有 QuickBooks 授权用户（仅供管理或调试）
 */
router.get(
  "/authorized-users",
  auditLog("get_authorized_users"),
  async (req, res) => {
    try {
      const users = await getAllTokensByPlatform("quickbooks");
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
