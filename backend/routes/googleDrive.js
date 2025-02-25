import express from "express";
import multer from "multer";
import { uploadFile, isAuthorized } from "../services/googleDriveService.js";
import fs from "fs";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); // 临时存储目录

/**
 * 📤 处理前端上传文件，并上传到 Google Drive
 */
router.post("/upload", upload.single("file"), async (req, res) => {
  const { path, originalname, mimetype } = req.file;
  const { username, fileType } = req.body;

  if (!username || !fileType) {
    fs.unlinkSync(path); // 立即删除临时文件
    return res.status(400).json({ error: "Missing username or fileType" });
  }

  try {
    // 📤 上传到 Google Drive
    const result = await uploadFile(
      username,
      fileType,
      path,
      originalname,
      mimetype
    );

    // ✅ **发送响应后**，后台删除文件
    res.json(result);

    // 🗑️ **后台异步删除临时文件**
    fs.unlink(path, (err) => {
      if (err) console.error(`❌ Failed to delete temp file: ${path}`, err);
      else console.log(`🗑️ Deleted temp file: ${path}`);
    });
  } catch (error) {
    // ❌ 确保在发送 `500` 响应前删除临时文件
    try {
      fs.unlinkSync(path);
    } catch (unlinkErr) {
      console.error(`❌ Failed to clean up file: ${path}`, unlinkErr);
    }

    res.status(500).json({ error: error.message });
  }
});

/**
 * 🔍 Check if Google Drive is authorized
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
