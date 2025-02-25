import { google } from "googleapis";
import fs from "fs";
import { getGoogleDriveToken } from "../services/tokenService.js";

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
 */
async function uploadFile(username, fileType, filePath, fileName, mimeType) {
  try {
    const drive = await getDriveClient();

    // 🔹 设定 Google Drive 根目录 (环境变量)
    const ROOT_FOLDER_ID = process.env.DRIVE_ROOT_FOLDER_ID;

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
    const media = { mimeType, body: fs.createReadStream(filePath) };

    const response = await drive.files.create({
      requestBody: fileMetadata,
      media,
      fields: "id",
    });

    console.log(
      `✅ File uploaded: ${fileName} -> Drive Folder: ${fileTypeFolderId}`
    );
    return { success: true, fileId: response.data.id };
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

export { uploadFile, isAuthorized };
