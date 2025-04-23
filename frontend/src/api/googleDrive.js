import { safeApiGet } from "@/lib/safeApiGet";

export const checkGoogleDriveAuthorization = async () => {
  // 先检查/auth/googledrive/status（OAuth流程状态）
  const authStatus = await safeApiGet("/auth/googledrive/status");
  
  if (authStatus.authorized) {
    return authStatus;
  }
  
  // 如果未授权，再检查/api/googledrive/authorized（真实API授权状态）
  return safeApiGet("/api/googledrive/authorized");
};

export const getGoogleDriveAuthorizedUsers = () => {
  console.log("Fetching authorized users for Google Drive...");
  return safeApiGet("/api/googledrive/authorized-users");
};

export const resetGoogleDriveAuthStatus = () => {
  return safeApiGet("/auth/googledrive/status/reset");
};

export const getGoogleDriveAuthStatus = () => {
  return safeApiGet("/auth/googledrive/status");
};

export const uploadFileToDrive = (formData) => {
  return fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/googledrive/upload`, {
    method: "POST",
    body: formData,
  });
};
