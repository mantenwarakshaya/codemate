const express = require("express");
const connectDB = require("./config/database");
const app = express();
const cookieParser = require("cookie-parser");
const path = require("path");
const cors = require("cors");
const http = require("http");
const cloudinary = require("cloudinary").v2;
require("dotenv").config();
process.env.BASE_URL = "http://localhost:5173";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
// ✅ Middlewares
// app.use(express.json());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());


// app.use(cors());

// ✅ CORS (simple since same domain)
app.use(
  cors({
    origin: process.env.BASE_URL || "http://localhost:5173",
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

app.set("trust proxy", 1);
app.use("/api", authRouter);
app.use("/api", profileRouter);
app.use("/api", requestRouter);
app.use("/api", userRouter);
app.use("/api", chatRouter);

const server = http.createServer(app);
initializeSocket(server);

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