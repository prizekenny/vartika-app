import express from "express";
import multer from "multer";
import auditLog from "../middlewares/auditLog.js";
import {
  uploadFile,
  isAuthorized,
  getAllAuthorizedUsers,
} from "../services/googleDriveService.js";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // 临时存储目录

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

    const { path, originalname, mimetype } = req.file;
    const { username, fileType } = req.body;

    console.log(`📤 Processing file upload: ${originalname}, type: ${mimetype}, username: ${username}, fileType: ${fileType}`);

    if (!username || !fileType) {
      fs.unlinkSync(path); // 立即删除临时文件
      console.error("❌ Missing username or fileType");
      return res.status(400).json({ success: false, error: "Missing username or fileType" });
    }

    try {
      // 检查 Google Drive 授权状态
      const authStatus = await isAuthorized();
      if (!authStatus.authorized) {
        console.error("❌ Google Drive not authorized");
        fs.unlinkSync(path); // 删除临时文件
        return res.status(401).json({ 
          success: false, 
          error: "Google Drive not authorized. Please connect your Google Drive account." 
        });
      }

      // 📤 上传到 Google Drive
      console.log(`✅ Uploading file to Google Drive: ${originalname}`);
      const result = await uploadFile(
        username,
        fileType,
        path,
        originalname,
        mimetype
      );

      if (!result.success) {
        console.error(`❌ Upload to Google Drive failed: ${result.error}`);
        // 确保在失败时删除临时文件
        fs.unlinkSync(path);
        return res.status(500).json(result);
      }

      // ✅ **发送响应后**，后台删除文件
      console.log(`✅ File uploaded successfully: ${originalname}, fileId: ${result.fileId}`);
      res.json(result);

      // 🗑️ **后台异步删除临时文件**
      fs.unlink(path, (err) => {
        if (err) console.error(`❌ Failed to delete temp file: ${path}`, err);
        else console.log(`🗑️ Deleted temp file: ${path}`);
      });
    } catch (error) {
      console.error(`❌ Error during file upload: ${error.message}`, error);
      // ❌ 确保在发送 `500` 响应前删除临时文件
      try {
        fs.unlinkSync(path);
      } catch (unlinkErr) {
        console.error(`❌ Failed to clean up file: ${path}`, unlinkErr);
      }

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
