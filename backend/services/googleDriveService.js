import { google } from "googleapis";
import fs from "fs";
import {
  getGoogleDriveToken,
  getAllTokensByPlatform,
} from "../services/tokenService.js";
import { pool } from "../config/database.js";

/**
 * 🔑 获取 Google Drive API 客户端
 */
async function getDriveClient() {
  const tokenData = await getGoogleDriveToken();
  if (!tokenData || !tokenData.refresh_token) {
    throw new Error("No Google Drive refresh token found. Please authorize.");
  }

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: tokenData.refresh_token });

  return google.drive({ version: "v3", auth });
}

/**
 * 📂 获取或创建 Google Drive 目录 (用户名称 + 文件类型)
 */
async function getOrCreateFolder(drive, parentFolderId, folderName) {
  const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;
  if (!parentFolderId) {
    parentFolderId = ROOT_FOLDER_ID; // ✅ 这里确保默认使用 ROOT_FOLDER_ID
  }

  if (!parentFolderId) {
    throw new Error("❌ Google Drive ROOT_FOLDER_ID is undefined.");
  }

  console.log(
    `📂 Checking folder, parentFolderId: ${parentFolderId}, folderName: ${folderName}`
  );

  const response = await drive.files.list({
    q: `'${parentFolderId}' in parents and name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
    fields: "files(id, name)",
  });

  if (response.data.files.length > 0) {
    return response.data.files[0].id;
  }

  // ✅ 创建新目录
  const folderMetadata = {
    name: folderName,
    mimeType: "application/vnd.google-apps.folder",
    parents: [parentFolderId],
  };

  const folder = await drive.files.create({
    requestBody: folderMetadata,
    fields: "id",
  });

  return folder.data.id;
}

/**
 * 📤 上传文件到 Google Drive (分类存储)
 * @param {string} username - 公司名称/用户名
 * @param {string} fileType - 文件类型
 * @param {ReadableStream} fileStream - 文件流
 * @param {string} fileName - 文件名
 * @param {string} mimeType - MIME类型
 */
async function uploadFile(username, fileType, fileStream, fileName, mimeType, userId = null) {
  try {
    const drive = await getDriveClient();

    // 🔹 设定 Google Drive 根目录 (环境变量)
    const ROOT_FOLDER_ID = process.env.GOOGLE_DRIVE_ROOT_FOLDER_ID;

    if (!ROOT_FOLDER_ID) {
      console.error("❌ GOOGLE_DRIVE_ROOT_FOLDER_ID not set in environment variables");
      return { success: false, error: "Google Drive root folder not configured" };
    }

    // 🔹 创建 `用户名 + 文件类型` 目录
    const userFolderId = await getOrCreateFolder(
      drive,
      ROOT_FOLDER_ID,
      username
    );
    const fileTypeFolderId = await getOrCreateFolder(
      drive,
      userFolderId,
      fileType
    );

    const fileMetadata = {
      name: fileName,
      parents: [fileTypeFolderId],
    };
    const media = { mimeType, body: fileStream };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    const fileId = response.data.id;

    // 获取文件大小 (这里需要估算，因为我们是直接上传的流)
    // 如果前端有文件大小，可以将其作为参数传递
    // 这里存储的是格式化后的大小字符串，实际应用中可能需要存储原始字节数
    const fileSize = "Unknown size"; // 在实际应用中，应该从请求中获取文件大小

    // 将文件记录保存到数据库
    try {
      await pool.query(
        `INSERT INTO file_records 
        (file_name, file_size, mime_type, company_name, document_type, drive_file_id, user_id) 
        VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [fileName, fileSize, mimeType, username, fileType, fileId, userId]
      );
      console.log(`✅ File record saved to database: ${fileName}`);
    } catch (dbError) {
      console.error(`❌ Failed to save file record to database:`, dbError);
      // 即使数据库保存失败，我们仍然继续，因为文件已经上传到Google Drive
    }

    console.log(
      `✅ File uploaded: ${fileName} -> Drive Folder: ${fileTypeFolderId}`
    );
    return { success: true, fileId: fileId };
  } catch (error) {
    console.error(`🔴 Failed to upload file:`, error);
    return { success: false, error: error.message };
  }
}

/**
 * 🔍 Check if Google Drive is authorized via API
 */
async function isAuthorized() {
  try {
    const tokenData = await getGoogleDriveToken();

    if (!tokenData || !tokenData.refresh_token) {
      return { authorized: false, error: "No valid refresh token found" };
    }

    const auth = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GMAIL_REDIRECT_URI
    );
    auth.setCredentials({ refresh_token: tokenData.refresh_token });

    const drive = google.drive({ version: "v3", auth });

    // ✅ Test API call to check authorization
    const response = await drive.about.get({ fields: "user" });

    console.log(`✅ Google Drive API authorized for:`, response.data.user);
    return { authorized: true, user: response.data.user };
  } catch (error) {
    console.error(`❌ Google Drive authorization failed:`, error);
    return { authorized: false, error: "Invalid or expired token" };
  }
}

/**
 * 🔍 Get all authorized Google Drive users from cache
 */
async function getAllAuthorizedUsers() {
  const allTokens = await getAllTokensByPlatform("google_drive");
  const authorizedUsers = [];

  for (const token of allTokens) {
    try {
      const drive = await getDriveClient(token.user_email);
      await drive.files.list({ pageSize: 1 }); // Small test request
      authorizedUsers.push(token.user_email);
    } catch (error) {
      console.error(
        `❌ Google Drive API authorization failed for ${token.user_email}:`,
        error
      );
    }
  }

  return authorizedUsers;
}

export { uploadFile, isAuthorized, getAllAuthorizedUsers };
