import { safeApiGet } from "@/lib/safeApiGet";

export const checkGoogleDriveAuthorization = () => {
  return safeApiGet("/auth/googledrive/status");
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
