import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import session from "express-session";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import gmailAuthRoutes from "./routes/gmailAuth.js";
import gmailRoutes from "./routes/gmail.js";
import driveAuthRoutes from "./routes/googleDriveAuth.js";
import googleDriveRoutes from "./routes/googleDrive.js";
import quickbooksAuthRoutes from "./routes/quickbooksAuth.js"; // ✅ 认证逻辑
import quickbooksRoutes from "./routes/quickbooks.js"; // ✅ API 访问逻辑
import { loadTokensIntoCache } from "./services/tokenService.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

// ✅ General authentication (Google, Microsoft, Facebook login)
app.use("/auth", authRoutes);

// ✅ User-related API routes
app.use("/api/users", userRoutes);

// ✅ Gmail-specific authentication (redirects for OAuth)
app.use("/auth/gmail", gmailAuthRoutes);
// ✅ Gmail API routes (fetch emails)
app.use("/api/gmail", gmailRoutes);

// ✅ Google Drive API routes (redirects for OAuth)
app.use("/auth/drive", driveAuthRoutes);
// ✅ Google Drive routes (upload, download files)
app.use("/api/drive", googleDriveRoutes);

// ✅ QuickBooks OAuth 认证
app.use("/auth/quickbooks", quickbooksAuthRoutes);
// ✅ QuickBooks API (获取财务数据)
app.use("/api/quickbooks", quickbooksRoutes);

// 🔹 Load tokens into cache at server startup
loadTokensIntoCache();

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running at ${BASE_URL}:${PORT}`));
