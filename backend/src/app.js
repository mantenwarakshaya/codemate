const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
require("dotenv").config();

// ✅ Middlewares
app.use(express.json());
app.use(cookieParser());

// ✅ CORS (simple since same domain)
app.use(
  cors({
    origin: "https://codemate-xd74.onrender.com",
    credentials: true,
  })
);

// ✅ Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");

// 🔥 IMPORTANT: prefix with /api
app.set("trust proxy", 1);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);

// 🔥 Serve frontend (React build)
app.use(express.static(path.join(__dirname, "../../frontend/dist")));

// ✅ Use a Regex Literal (no quotes) instead of a string
app.get(/.*/, (req, res) => {
  res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
});
// ✅ Server
const PORT = process.env.PORT || 7777;

connectDB()
  .then(() => {
    console.log("Database connection established");
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Database cannot be connected", err);
  });