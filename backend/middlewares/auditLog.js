import { logUserAction } from "../logger/index.js";

function auditLog(action, extraDetailGetter = () => ({})) {
  return async (req, res, next) => {
    const user_email = req.user?.email || req.session?.user?.email || "unknown";
    const ip = req.ip;

    res.on("finish", async () => {
      if (res.statusCode < 400) {
        const detail = {
          query: req.query,
          params: req.params,
          body: req.body,
          user_agent: req.headers["user-agent"],
          ...extraDetailGetter(req),
        };

        await logUserAction(user_email, action, req.originalUrl, detail, ip);
      }
    });

    next();
  };
}

export default auditLog;
