import passport from "passport";
import { pool } from "../config/database.js";
import { logUserAction } from "../logger/index.js";

function auditLog(action, extraDetailGetter = () => ({})) {
  return async (req, res, next) => {
    const ip = req.ip;

    res.on("finish", async () => {
      if (res.statusCode < 400) {
        const user_email = req.user?.email || "unknown";

        const detail = {
          query: req.query,
          params: req.params,
          body: req.body,
          user_agent: req.headers["user-agent"],
          jwt_user: req.user || null,
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
