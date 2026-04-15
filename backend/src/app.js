const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");
require("dotenv").config();
process.env.FRONTEND_URL = "http://localhost:5173";
// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS (simple since same domain)
app.use(
  cors({
    // origin: "https://codemate-xd74.onrender.com",
    origin: "http://localhost:5173",
    credentials: true,
  })
);
// ✅ Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const initializeSocket = require("./utils/socket");
const chatRouter = require("./routes/chat");

// 🔥 IMPORTANT: prefix with /api
app.set("trust proxy", 1);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

if (process.env.NODE_ENV === "production"){
  // 🔥 Serve frontend (React build)
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // ✅ Use a Regex Literal (no quotes) instead of a string
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}
// ✅ Server
const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connection established");
    server.listen(PORT, () => {
      console.log(`Server running on port http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected", err);
  });