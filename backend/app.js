const transactionsRouter = require("./routes/transactions");

// 注册路由
app.use("/api/transactions", transactionsRouter);
