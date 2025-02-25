import { google } from "googleapis";
import { getGmailToken } from "../services/tokenService.js";

/**
 * 🔑 Get OAuth2 client using stored refresh token
 */
async function getOAuthClient(email) {
  const tokenData = await getGmailToken(email);
  console.log(`🔍 Debug: Retrieved Gmail Token Data:`, tokenData);
  if (!tokenData || !tokenData.refresh_token) {
    throw new Error("No Gmail refresh token found. Please authorize.");
  }

  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );

  oAuth2Client.setCredentials({ refresh_token: tokenData.refresh_token });
  return oAuth2Client;
}

/**
 * 📩 Fetch unread emails
 */
async function checkUnreadEmails(email) {
  try {
    const auth = await getOAuthClient(email);
    const gmail = google.gmail({ version: "v1", auth });

    let allUnreadMessages = [];
    let nextPageToken = null;

    do {
      const response = await gmail.users.messages.list({
        userId: "me",
        q: "is:unread", // 仅获取未读邮件
        maxResults: 100, // Gmail API 限制，每次最多 100 封
        pageToken: nextPageToken, // 分页
      });

      if (response.data.messages) {
        allUnreadMessages.push(...response.data.messages);
      }

      nextPageToken = response.data.nextPageToken;
    } while (nextPageToken); // 继续获取下一页

    return allUnreadMessages;
  } catch (error) {
    console.error(`🔴 Failed to fetch unread emails for ${email}:`, error);
    return [];
  }
}

/**
 * 📬 Fetch all emails
 */
async function getAllEmails(email) {
  try {
    const auth = await getOAuthClient(email);
    const gmail = google.gmail({ version: "v1", auth });

    let allMessages = [];
    let nextPageToken = null;

    do {
      const response = await gmail.users.messages.list({
        userId: "me",
        maxResults: 100, // Gmail API 限制每次最多 100
        pageToken: nextPageToken,
      });

      if (response.data.messages) {
        allMessages.push(...response.data.messages);
      }

      nextPageToken = response.data.nextPageToken; // 继续获取下一页
    } while (nextPageToken); // 直到没有 nextPageToken

    return allMessages;
  } catch (error) {
    console.error(`🔴 Failed to fetch all emails for ${email}:`, error);
    return [];
  }
}

/**
 * 📧 获取指定邮件内容
 */
async function getEmailContent(email, messageId) {
  try {
    const auth = await getOAuthClient(email);
    const gmail = google.gmail({ version: "v1", auth });

    const fullMessage = await gmail.users.messages.get({
      userId: "me",
      id: messageId,
      format: "full", // 获取完整邮件
    });

    return {
      id: fullMessage.data.id,
      threadId: fullMessage.data.threadId,
      subject: getHeader(fullMessage.data.payload.headers, "Subject"),
      from: getHeader(fullMessage.data.payload.headers, "From"),
      to: getHeader(fullMessage.data.payload.headers, "To"),
      date: getHeader(fullMessage.data.payload.headers, "Date"),
      snippet: fullMessage.data.snippet, // 预览内容
      body: getEmailBody(fullMessage.data.payload), // 解析正文
    };
  } catch (error) {
    console.error(`🔴 Failed to fetch email content for ${email}:`, error);
    return null;
  }
}

/**
 * 📌 获取邮件头部信息（如 Subject、From、To）
 */
function getHeader(headers, name) {
  const header = headers.find(
    (h) => h.name.toLowerCase() === name.toLowerCase()
  );
  return header ? header.value : "";
}

/**
 * 📌 解析邮件正文（适用于多种邮件格式）
 */
function getEmailBody(payload) {
  if (!payload.parts) {
    return payload.body.data
      ? Buffer.from(payload.body.data, "base64").toString("utf-8")
      : "(No body content)";
  }

  for (let part of payload.parts) {
    if (part.mimeType === "text/plain") {
      return Buffer.from(part.body.data, "base64").toString("utf-8");
    }
  }

  return "(No plain text content)";
}

/**
 * 🔍 Check if Gmail is authorized via Google's API
 */
async function isAuthorized(email) {
  try {
    const auth = await getOAuthClient(email); // Get OAuth2 client
    const gmail = google.gmail({ version: "v1", auth });

    // ✅ Make a test API call to check authorization
    const profile = await gmail.users.getProfile({ userId: "me" });

    console.log(`✅ Gmail API authorized for ${email}:`, profile.data);
    return { authorized: true, profile: profile.data };
  } catch (error) {
    console.error(`❌ Gmail API authorization failed for ${email}:`, error);
    return { authorized: false, error: "Invalid or expired token" };
  }
}

export { checkUnreadEmails, getAllEmails, getEmailContent, isAuthorized };
