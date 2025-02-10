import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as MicrosoftStrategy } from "passport-microsoft";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "./database.js";

passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
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

// Google Strategy
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "/auth/google/callback",
    },
    async (accessToken, refreshToken, profile, done) => {
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

        done(null, result.rows[0]);
      } catch (err) {
        done(err);
      }
    }
  )
);

// 类似地添加 Microsoft 和 Facebook 策略
// ...

export default passport;
