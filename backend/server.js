import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import session from "express-session";
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

const app = express();
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://b.lyu.lol",
      "https://vartika-app.vercel.app",
    ], // 确保是你的前端 URL
    credentials: true, // 允许跨域携带 cookies
  })
);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  res.setHeader("Cross-Origin-Embedder-Policy", "require-corp");
  next();
});

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
app.use("/auth/drive", driveAuthRoutes);
// Google Drive routes (upload, download files)
app.use("/api/drive", googleDriveRoutes);

// ✅ QuickBooks OAuth authentication
app.use("/auth/quickbooks", quickbooksAuthRoutes);
// ✅ QuickBooks API (get financial data)
app.use("/api/quickbooks", quickbooksRoutes);

// ✅ Contract related routes
app.use("/api/contracts", contractRoutes);

// 🔹 Load tokens into cache at server startup
loadTokensIntoCache();

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`Server running at ${BASE_URL}:${PORT}`));
