import passport from "passport";
import { pool } from "../config/database.js";
import { logUserAction } from "../logger/index.js";

function auditLog(action, extraDetailGetter = () => ({})) {
  return async (req, res, next) => {
    const ip = req.ip;

    res.on("finish", async () => {
      if (res.statusCode < 400) {
        let user_email = "unknown";

        try {
          // 1️⃣ 优先使用 req.user
          if (req.user?.email) {
            user_email = req.user.email;
          }

          // 2️⃣ 手动反序列化 user_id
          else if (req.session?.passport?.user) {
            const user_id = req.session.passport.user;
            const userResult = await pool.query(
              "SELECT email FROM users WHERE user_id = $1",
              [user_id]
            );
            if (userResult.rows.length > 0) {
              user_email = userResult.rows[0].email;
            }
          }
        } catch (err) {
          console.warn("⚠️ Failed to resolve user email:", err.message);
        }

        const detail = {
          query: req.query,
          params: req.params,
          body: req.body,
          user_agent: req.headers["user-agent"],
          ...extraDetailGetter(req),
        };

        console.log(
          `🔍 Audit Log: ${action} - ${user_email} - ${req.originalUrl}`
        );
        await logUserAction(user_email, action, req.originalUrl, detail, ip);
      }
    });

    next();
  };
}

export default auditLog;
