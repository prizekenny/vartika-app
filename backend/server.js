import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "./config/passport.js";
import userRoutes from "./routes/users.js";
import rolesRoutes from "./routes/roles.js";
import publicRoutes from "./routes/public.js";
import authRoutes from "./routes/auth.js";
import gmailAuthRoutes from "./routes/gmailAuth.js";
import gmailRoutes from "./routes/gmail.js";
import driveAuthRoutes from "./routes/googleDriveAuth.js";
import googleDriveRoutes from "./routes/googleDrive.js";
import quickbooksAuthRoutes from "./routes/quickbooksAuth.js"; // ✅ Authentication logic
import quickbooksRoutes from "./routes/quickbooks.js"; // ✅ API access logic
import contractRoutes from "./routes/contracts.js"; // ✅ Contract related routes
import { loadTokensIntoCache } from "./services/tokenService.js";
import logRoutes from "./routes/logs.js";
import clientsRoutes from "./routes/clients.js";

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://b.lyu.lol",
      "https://vartika-app.vercel.app",
    ], // 确保是你的前端 URL
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

app.use(express.json());

console.log("🌍 NODE_ENV:", process.env.NODE_ENV);

app.use(
  session({
    secret: process.env.SESSION_SECRET, // 用于加密会话的密钥
    resave: false, // 是否在每次请求时重新保存会话
    saveUninitialized: true, // 是否保存未初始化的会话
    cookie: { secure: false }, // 如果是 https, 请设置为 true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// General authentication (Google, Microsoft, Facebook login)
app.use("/auth", authRoutes);

// User-related API routes (User Management)
app.use("/api/users", userRoutes);
app.use("/api/roles", rolesRoutes);
app.use("/public", publicRoutes);

// Gmail-specific authentication (redirects for OAuth)
app.use("/auth/gmail", gmailAuthRoutes);
// Gmail API routes (fetch emails)
app.use("/api/gmail", gmailRoutes);

// Google Drive API routes (redirects for OAuth)
app.use("/auth/googledrive", driveAuthRoutes);
// Google Drive routes (upload, download files)
app.use("/api/googledrive", googleDriveRoutes);

// ✅ QuickBooks OAuth authentication
app.use("/auth/quickbooks", quickbooksAuthRoutes);
// ✅ QuickBooks API (get financial data)
app.use("/api/quickbooks", quickbooksRoutes);

// ✅ Logs API routes
app.use("/api/logs", logRoutes);

// ✅ Contract related routes
app.use("/api/contracts", contractRoutes);

// ✅ Clients related routes
app.use("/api/clients", clientsRoutes);

// 🔹 Load tokens into cache at server startup
loadTokensIntoCache();

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running at ${BASE_URL}:${PORT}`));
