import express from "express";
import auditLog from "../middlewares/auditLog.js";
import {
  checkUnreadEmails,
  getAllEmails,
  getEmailContent,
  isAuthorized,
  getAllAuthorizedUsers,
} from "../services/gmailService.js";

const router = express.Router();

/**
 * 📬 Get unread Gmail messages for a specific email
 */
router.get(
  "/unread/:email",
  auditLog("get_unread_emails", (req) => ({ email: req.params.email })),
  async (req, res) => {
    try {
      const { email } = req.params;
      const emails = await checkUnreadEmails(email);
      res.json({ unreadCount: emails.length, emails });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 📩 Get all Gmail messages for a specific email
 */
router.get(
  "/all/:email",
  auditLog("get_all_emails", (req) => ({ email: req.params.email })),
  async (req, res) => {
    try {
      const { email } = req.params;
      const emails = await getAllEmails(email);
      res.json({ emailCount: emails.length, emails });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 📧 获取指定邮件内容
 */
router.get(
  "/message/:email/:messageId",
  auditLog("get_email_content", (req) => ({
    email: req.params.email,
    messageId: req.params.messageId,
  })),
  async (req, res) => {
    try {
      const { email, messageId } = req.params;
      const emailContent = await getEmailContent(email, messageId);

      if (!emailContent) {
        return res
          .status(404)
          .json({ error: "Email not found or inaccessible" });
      }

      res.json(emailContent);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * 🔍 Check if Gmail authorization is valid
 */
router.get(
  "/authorized/:email",
  auditLog("check_gmail_authorization", (req) => ({ email: req.params.email })),
  async (req, res) => {
    try {
      const { email } = req.params;
      const result = await isAuthorized(email);
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ Get all authorized Gmail users
 */
router.get(
  "/authorized-users",
  auditLog("get_all_authorized_gmail_users"),
  async (req, res) => {
    try {
      const authorizedUsers = await getAllAuthorizedUsers();
      res.json({ authorizedUsers });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

export default router;
