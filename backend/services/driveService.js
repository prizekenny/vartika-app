import { google } from "googleapis";
import fs from "fs";
import { getDriveToken } from "../routes/driveAuth.js";

/**
 * 🔑 获取 Google Drive API 客户端
 */
async function getDriveClient() {
  const refreshToken = getDriveToken();
  if (!refreshToken)
    throw new Error("No Google Drive refresh token found. Please authorize.");

  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
  auth.setCredentials({ refresh_token: refreshToken });

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

export { uploadFile };
