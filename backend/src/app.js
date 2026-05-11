const express = require("express");
const http = require("http");
const { initializeSocket } = require("./utils/socket");
const connectDB = require("./config/database");
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");

const app = express();
const server = http.createServer(app);

initializeSocket(server);

const cloudinary = require("cloudinary").v2;
const startCleanupTask = require("./utils/cleanup");
require("dotenv").config();
process.env.BASE_URL = "http://localhost:5173";


startCleanupTask();
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ✅ Middlewares
app.use(express.json());

app.use(cors());

// ✅ CORS (simple since same domain)
// app.use(
//   cors({
//     origin: "http://localhost:5173",
//     credentials: true,
//   })
// );

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// ✅ Routes
const authRouter = require("./routes/auth");
const profileRouter = require("./routes/profile");
const requestRouter = require("./routes/request");
const userRouter = require("./routes/user");
const chatRouter = require("./routes/chat");
const paymentRouter = require("./routes/payment");

app.set("trust proxy", 1);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);
app.use("/api", paymentRouter);

if (process.env.NODE_ENV === "production"){
  // Serve frontend (React build)
  app.use(express.static(path.join(__dirname, "../../frontend/dist")));

  // Use a Regex Literal (no quotes) instead of a string
  app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, "../../frontend/dist/index.html"));
  });
}
// Server
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