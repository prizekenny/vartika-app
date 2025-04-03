import { pool } from "../config/database.js";
import NodeCache from "node-cache";
import axios from "axios";

const tokenCache = new NodeCache({ stdTTL: 3600 }); // Cache tokens for 1 hour

/**
 * 🔄 Load all tokens from the database into memory cache on startup
 */
async function loadTokensIntoCache() {
  try {
    const result = await pool.query("SELECT * FROM api_tokens");
    result.rows.forEach((row) => {
      tokenCache.set(`${row.user_email}-${row.platform}`, {
        user_email: row.user_email,
        platform: row.platform,
        access_token: row.access_token,
        refresh_token: row.refresh_token,
        realm_id: row.realm_id,
        expires_at: row.expires_at,
      });
      // ✅ Print token info excluding refresh_token
      console.log(
        `🔑 Cached token for ${row.user_email} (${row.platform}) | Realm ID: ${row.realm_id} | Expires At: ${row.expires_at}`
      );
    });
    console.log("✅ Tokens loaded into cache.");
  } catch (error) {
    console.error("❌ Failed to load tokens into cache:", error);
  }
}

/**
 * 🔍 Get token from cache (fallback to database if missing)
 */
async function getToken(user_email, platform) {
  const cacheKey = `${user_email}-${platform}`;
  let tokenData = tokenCache.get(cacheKey);

  console.log(`🔍 Debug: getToken() - Fetching from cache:`, tokenData); // ✅ 先检查缓存

  if (!tokenData) {
    console.log(`❌ No token for ${user_email}, reloading cache.`);
    await loadTokensIntoCache(); // Reload cache from database
  }

  if (!tokenData) {
    console.log(`❌ Still no token for ${user_email} after reloading cache.`);
    return null;
  }

  return tokenData;
}
/**
 * 📌 **Retrieve all tokens for a specific platform (Google Drive, QuickBooks, Gmail, etc.)**
 */
async function getAllTokensByPlatform(platform) {
  console.log(`🔍 Debug: Fetching all tokens for platform: ${platform}`);

  // ✅ Retrieve all cached tokens for the given platform
  let allCachedTokens = tokenCache
    .keys()
    .filter((key) => key.endsWith(`-${platform}`))
    .map((key) => ({
      user_email: key.split("-")[0],
      ...tokenCache.get(key),
    }));

  if (allCachedTokens.length > 0) {
    console.log(
      `✅ Debug: Retrieved ${allCachedTokens.length} tokens from cache.`
    );
    return allCachedTokens;
  }

  console.log(
    `⚠️ Cache miss for platform: ${platform}, reloading from database...`
  );

  // 🚀 **If cache is empty, reload all tokens from the database**
  await loadTokensIntoCache();

  // ✅ Try fetching from cache again after reloading
  allCachedTokens = tokenCache
    .keys()
    .filter((key) => key.endsWith(`-${platform}`))
    .map((key) => ({
      user_email: key.split("-")[0],
      ...tokenCache.get(key),
    }));

  if (allCachedTokens.length > 0) {
    console.log(
      `✅ Debug: Retrieved ${allCachedTokens.length} tokens from cache after reload.`
    );
    return allCachedTokens;
  }

  console.log(
    `❌ No tokens found for platform: ${platform}, even after reloading.`
  );
  return [];
}

/**
 * 🔄 **Update access token and refresh token in both cache and database**
 */
async function updateToken(
  user_email,
  platform,
  access_token,
  refresh_token,
  realm_id,
  expires_at
) {
  const cacheKey = `${user_email}-${platform}`;

  console.log(
    `🔍 Debug: Attempting to update token for ${user_email} (${platform})`
  );
  console.log(`🔍 Debug: Access Token: ${access_token}`);
  console.log(`🔍 Debug: Refresh Token: ${refresh_token}`);
  console.log(`🔍 Debug: Realm ID: ${realm_id}`);
  console.log(`🔍 Debug: Expires At: ${expires_at}`);

  try {
    const result = await pool.query(
      `
      INSERT INTO api_tokens (user_email, platform, access_token, refresh_token, realm_id, expires_at, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
      ON CONFLICT (user_email, platform)
      DO UPDATE SET 
          access_token = EXCLUDED.access_token, 
          refresh_token = EXCLUDED.refresh_token,
          realm_id = EXCLUDED.realm_id,
          expires_at = EXCLUDED.expires_at,
          updated_at = NOW()
      RETURNING *;
      `,
      [user_email, platform, access_token, refresh_token, realm_id, expires_at]
    );

    console.log(`✅ SQL Query Executed Successfully! Result:`, result.rows);

    // Update the cache
    tokenCache.set(cacheKey, {
      user_email,
      platform,
      access_token,
      refresh_token,
      realm_id,
      expires_at,
    });

    console.log(`✅ Token updated for ${user_email} (${platform})`);
  } catch (error) {
    console.error(
      `❌ Failed to update token for ${user_email} (${platform}):`,
      error
    );
  }
}

/**
 * 📌 **Get all Gmail tokens (multiple users)**
 */
async function getAllGmailTokens() {
  return getAllTokensByPlatform("gmail");
}

/**
 * 📌 **Get Gmail token for a specific user**
 */
async function getGmailToken(email) {
  return getToken(email, "gmail");
}

/**
 * 📌 **Get the latest Google Drive token (single user)**
 */
async function getGoogleDriveToken() {
  const tokens = await getAllTokensByPlatform("google_drive");
  return tokens.length > 0 ? tokens[0] : null;
}

/**
 * 📌 **Get the latest QuickBooks token (single user)**
 */
// ✅ getQuickBooksToken 自动取用第一条 quickbooks token
async function getQuickBooksToken() {
  const quickbooksKeys = tokenCache
    .keys()
    .filter((key) => key.endsWith("-quickbooks"));
  if (quickbooksKeys.length === 0)
    throw new Error("No QuickBooks token found in cache.");

  const cacheKey = quickbooksKeys[0];
  let token = tokenCache.get(cacheKey);

  if (!token) {
    await loadTokensIntoCache();
    token = tokenCache.get(cacheKey);
    if (!token)
      throw new Error("No token found, please authorize QuickBooks first.");
  }

  return token;
}

export {
  loadTokensIntoCache,
  getToken,
  getAllTokensByPlatform,
  updateToken,
  getAllGmailTokens,
  getGmailToken,
  getGoogleDriveToken,
  getQuickBooksToken,
};
