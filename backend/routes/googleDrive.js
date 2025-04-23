import express from "express";
import multer from "multer";
import auditLog from "../middlewares/auditLog.js";
import {
  uploadFile,
  isAuthorized,
  getAllAuthorizedUsers,
} from "../services/googleDriveService.js";

const router = express.Router();
// 使用内存存储而不是磁盘临时存储
const upload = multer({ storage: multer.memoryStorage() });

/**
 * 📤 处理前端上传文件，并上传到 Google Drive
 */
router.post(
  "/upload",
  upload.single("file"),
  auditLog("upload_to_drive", (req) => ({
    username: req.body.username,
    fileType: req.body.fileType,
  })),
  async (req, res) => {
    if (!req.file) {
      console.error("❌ No file uploaded");
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    const { buffer, originalname, mimetype } = req.file;
    const { username, fileType } = req.body;

    console.log(`📤 Processing file upload: ${originalname}, type: ${mimetype}, username: ${username}, fileType: ${fileType}`);

    if (!username || !fileType) {
      console.error("❌ Missing username or fileType");
      return res.status(400).json({ success: false, error: "Missing username or fileType" });
    }

    try {
      // 检查 Google Drive 授权状态
      const authStatus = await isAuthorized();
      if (!authStatus.authorized) {
        console.error("❌ Google Drive not authorized");
        return res.status(401).json({ 
          success: false, 
          error: "Google Drive not authorized. Please connect your Google Drive account." 
        });
      }

      // 创建内存流
      const { Readable } = await import('stream');
      const fileStream = new Readable();
      fileStream.push(buffer);
      fileStream.push(null); // 标记流结束

      // 📤 直接上传内存中的文件流到 Google Drive
      console.log(`✅ Uploading file to Google Drive: ${originalname}`);
      const result = await uploadFile(
        username,
        fileType,
        fileStream,
        originalname,
        mimetype
      );

      if (!result.success) {
        console.error(`❌ Upload to Google Drive failed: ${result.error}`);
        return res.status(500).json(result);
      }

      // ✅ 发送响应
      console.log(`✅ File uploaded successfully: ${originalname}, fileId: ${result.fileId}`);
      res.json(result);
    } catch (error) {
      console.error(`❌ Error during file upload: ${error.message}`, error);
      res.status(500).json({ success: false, error: error.message });
    }
  }
);

/**
 * 🔍 Check if Google Drive is authorized
 */
router.get(
  "/authorized",
  auditLog("check_google_drive_authorized"),
  async (req, res) => {
    try {
      const result = await isAuthorized();
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
);

/**
 * ✅ Get all authorized Google Drive users
 */
router.get(
  "/authorized-users",
  auditLog("get_all_google_drive_users"),
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
