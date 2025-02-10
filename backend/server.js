import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import passport from "./auth/passport.js";
import session from "express-session";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());

app.use(session({ secret: "your_secret_key", resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

app.get("/auth/google", passport.authenticate("google", { scope: ["email", "profile"] }));
app.get("/auth/google/callback",
    passport.authenticate("google", { failureRedirect: "/" }),
    (req, res) => res.json({ token: req.user.token })
);

app.listen(5000, () => console.log("Backend running on port 5000"));