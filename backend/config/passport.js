import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import fs from "fs";
import { pool } from "./database.js";

const TOKEN_FILE = "./gmail_tokens.json"; // File to store refresh tokens

// 🔹 Serialize user ID into session
passport.serializeUser((user, done) => {
  console.log("🔹 Serializing user:", user); // ✅ 观察 user 结构
  done(null, user.email);
});

// 🔹 Deserialize user by ID from database
passport.deserializeUser(async (email, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// 🔹 Local Strategy for username/password login
passport.use(
  new LocalStrategy(
    {
      usernameField: "email",
      passwordField: "password",
    },
    async (email, password, done) => {
      try {
        const result = await pool.query(
          "SELECT * FROM users WHERE email = $1",
          [email]
        );
        if (!result.rows[0]) {
          return done(null, false, { message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, result.rows[0].password);
        if (!isValid) {
          return done(null, false, { message: "Invalid credentials" });
        }

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 🔹 Google Strategy (Restored `passReqToCallback: true`)
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback", // 🔥 普通用户登录
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let result = await pool.query(
          "SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2",
          ["google", profile.id]
        );

        if (!result.rows[0]) {
          result = await pool.query(
            "INSERT INTO users (email, auth_provider, auth_provider_id, username) VALUES ($1, $2, $3, $4) RETURNING *",
            [profile.emails[0].value, "google", profile.id, profile.displayName]
          );
        }

        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);
// Google Strategy for Gmail access (with `passReqToCallback: true`)
passport.use(
  "google-gmail",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/gmail/callback", // 🔥 Gmail 授权专用
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("🔹 Google callback triggered"); // ✅ 确保 Google 回调触发
      console.log("🔹 Access Token:", accessToken);
      console.log("🔹 Refresh Token:", refreshToken); // 🔥 确保 refreshToken 有值
      console.log("🔹 Profile:", profile);

      try {
        let user = {
          email: profile.emails[0].value,
          refresh_token: refreshToken, // ✅ Gmail 授权时存储 refresh_token
        };

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);
// 📂 **Google Drive OAuth Strategy (仅允许一个用户)**
passport.use(
  "google-drive",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/drive/callback",
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        if (!refreshToken) {
          console.log(
            "⚠️ No refresh_token received for Google Drive, skipping storage."
          );
        }
        const user = {
          email: profile.emails[0].value,
          refresh_token: refreshToken || null,
        };
        console.log(`✅ Google Drive OAuth Success: ${user.email}`);
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// 🔹 Microsoft Strategy (Restored `passReqToCallback: true`)
passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: "/auth/microsoft/callback",
      scope: ["user.read"],
      passReqToCallback: true, // ✅ Ensures req is accessible
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let result = await pool.query(
          "SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2",
          ["microsoft", profile.id]
        );

        if (!result.rows[0]) {
          result = await pool.query(
            "INSERT INTO users (email, auth_provider, auth_provider_id, username) VALUES ($1, $2, $3, $4) RETURNING *",
            [
              profile.emails[0].value,
              "microsoft",
              profile.id,
              profile.displayName,
            ]
          );
        }

        done(null, result.rows[0]);
      } catch (err) {
        done(err);
      }
    }
  )
);

// 🔹 Facebook Strategy (Restored `passReqToCallback: true`)
passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "/auth/facebook/callback",
      profileFields: ["id", "displayName", "email"],
      passReqToCallback: true, // ✅ Required to access `req`
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let result = await pool.query(
          "SELECT * FROM users WHERE auth_provider = $1 AND auth_provider_id = $2",
          ["facebook", profile.id]
        );

        if (!result.rows[0]) {
          result = await pool.query(
            "INSERT INTO users (email, auth_provider, auth_provider_id, username) VALUES ($1, $2, $3, $4) RETURNING *",
            [
              profile.emails ? profile.emails[0].value : null,
              "facebook",
              profile.id,
              profile.displayName,
            ]
          );
        }

        done(null, result.rows[0]);
      } catch (err) {
        done(err);
      }
    }
  )
);

export default passport;
