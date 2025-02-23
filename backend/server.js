import express from "express";
import cors from "cors";
import passport from "./config/passport.js";
import session from "express-session";
import userRoutes from "./routes/users.js";
import authRoutes from "./routes/auth.js";
import gmailAuthRoutes from "./routes/gmailAuth.js";
import gmailRoutes from "./routes/gmail.js";

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

const PORT = process.env.PORT || 5001;
app.listen(PORT, () =>
  console.log(`🚀 Server running at http://localhost:${PORT}`)
);
