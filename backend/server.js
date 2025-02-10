import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./config/passport.js";
import session from "express-session";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/users.js";
import { pool } from "./config/database.js";

dotenv.config();
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

app.use("/auth", authRoutes);
app.use("/api/users", userRoutes);

app.listen(5001, () => console.log("Backend running on port 5001"));
