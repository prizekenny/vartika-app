import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "./database.js";

const BASE_URL = process.env.BASE_URL || "http://localhost:5001";

console.log(`🔹 BASE_URL: ${BASE_URL}`);
console.log(`🔹 Google Auth Callback: ${BASE_URL}/auth/google/callback`);
console.log(`🔹 Gmail Auth Callback: ${BASE_URL}/auth/gmail/callback`);
console.log(`🔹 Drive Auth Callback: ${BASE_URL}/auth/drive/callback`);

passport.serializeUser((user, done) => {
  console.log("🔹 Serializing user:", user);
  done(null, user.user_id); // 只存储用户的 id
});

passport.deserializeUser(async (id, done) => {
  console.log("🔹 Deserializing user with user_id:", id);
  const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
    id,
  ]);
  done(null, result.rows[0]);
});

// Local Strategy
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
          console.log("❌ User not found");
          return done(null, false, { message: "Invalid credentials" });
        }

        const isValid = await bcrypt.compare(password, result.rows[0].password);
        if (!isValid) {
          console.log("❌ Password mismatch");
          return done(null, false, { message: "Invalid credentials" });
        }

        console.log("✅ User authenticated successfully:", result.rows[0]);
        return done(null, result.rows[0]);
      } catch (err) {
        return done(err);
      }
    }
  )
);

// Google OAuth Strategy
passport.use(
  "google-login",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/auth/google/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      console.log("🔹 Google OAuth Profile:", profile);
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

        const newUser = result.rows[0];
        const roleRes = await pool.query(
          "SELECT role_id FROM roles WHERE role_name = 'Client'"
        );
        const clientRoleId = roleRes.rows?.[0]?.role_id;

        if (clientRoleId) {
          const roleCheck = await pool.query(
            "SELECT * FROM user_roles WHERE user_id = $1 AND role_id = $2",
            [newUser.user_id, clientRoleId]
          );

          if (roleCheck.rows.length === 0) {
            await pool.query(
              "INSERT INTO user_roles (user_id, role_id) VALUES ($1, $2)",
              [newUser.user_id, clientRoleId]
            );
          }
        }

        return done(null, newUser);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  "google-gmail",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/gmail/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          email: profile.emails[0].value,
          refresh_token: refreshToken || null,
        };
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  "google-drive",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/googledrive/callback`,
      passReqToCallback: true,
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        const user = {
          email: profile.emails[0].value,
          refresh_token: refreshToken || null,
        };
        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.use(
  new MicrosoftStrategy(
    {
      clientID: process.env.MICROSOFT_CLIENT_ID,
      clientSecret: process.env.MICROSOFT_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/microsoft/callback`,
      scope: ["user.read"],
      passReqToCallback: true,
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

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: `${BASE_URL}/auth/facebook/callback`,
      profileFields: ["id", "displayName", "email"],
      passReqToCallback: true,
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
