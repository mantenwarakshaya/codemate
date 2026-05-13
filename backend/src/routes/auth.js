const express = require("express");
const authRouter = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const { validateSignUpData } = require("../utils/validation");

// =========================
// SIGNUP
// =========================
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    // 🔐 Create JWT token with user data
    const token = jwt.sign(
      {
        firstName,
        lastName,
        emailId,
        password: passwordHash,
      },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

    const verifyLink = `${process.env.BASE_URL}/verify-email/${token}`;

    await sendEmail(
      emailId,
      "Verify your CodeMate account",
      `
        <h2>Welcome to CodeMate 🚀</h2>
        <p>Click below to verify your email:</p>
        <a href="${verifyLink}">Verify Email</a>
      `
    );

    return res.json({
      message: "📩 Verification email sent! Please check your inbox.",
    });

  } catch (err) {
    console.log("SIGNUP ERROR:", err.message);
    return res.status(400).send(err.message);
  }
});

authRouter.get("/verify-email/:token", async (req, res) => {
  try {
    const { token } = req.params;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const { firstName, lastName, emailId, password } = decoded;

    const existingUser = await User.findOne({ emailId });
    if (existingUser) {
      return res.send("User already verified. Please login.");
    }

    const newUser = new User({
      firstName,
      lastName,
      emailId,
      password,
      isVerified: true,
    });

    await newUser.save();

    return res.send("✅ Email verified successfully! You can now login.");

  } catch (err) {
    return res.status(400).send("Invalid or expired link");
  }
});

authRouter.post("/resend-verification", async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).send("User not found");
    }

    if (user.isVerified) {
      return res.status(400).send("User already verified");
    }

    // ⏳ Cooldown check (60 sec)
    if (
      user.lastEmailSent &&
      Date.now() - new Date(user.lastEmailSent).getTime() < 60000
    ) {
      return res.status(429).send("Wait before resending");
    }

    const token = user.getEmailVerificationToken();
    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    try {
      await sendEmail(
        emailId,
        "Resend: Verify your CodeMate account",
        `
          <h2>Verify your email again 🔁</h2>
          <p>Click below to verify your account:</p>
          <a href="${verifyLink}">Verify Email</a>
        `
      );

      // ✅ update last sent time
      user.lastEmailSent = new Date();
      await user.save();

    } catch (err) {
      console.log("❌ Resend email failed:", err.message);
    }

    return res.send("📩 Verification email resent!");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post("/forgot-password", async (req, res) => {
  try {
    const { emailId } = req.body;

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).send("User not found");
    }

    const token = user.getResetPasswordToken();

    const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

    try {
      await sendEmail(
        emailId,
        "Reset your CodeMate password",
        `
          <h2>Reset Password 🔐</h2>
          <p>Click below to reset your password:</p>
          <a href="${resetLink}">Reset Password</a>
        `
      );
    } catch (err) {
      console.log("❌ Email failed:", err.message);
    }

    return res.send("📩 Password reset link sent!");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    await user.save();

    return res.send("✅ Password reset successful!");
  } catch (err) {
    return res.status(400).send("Invalid or expired token");
  }
});

// =========================
// LOGIN
// =========================
authRouter.post("/login", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });

    if (!user) {
      console.log("!user");
      return res.status(400).json({
        message: "Invalid credentials"
      });
    }

    // 🚫 If deleted
    if (user.isDeleted) {
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // ❌ Too late
      if (user.deletedAt < sevenDaysAgo) {
        return res.status(403).json("Account permanently deleted");
      }

      // ⏳ Still recoverable
      return res.status(403).json({
        code: "ACCOUNT_DEACTIVATED",
        message: "Your account is deactivated. You can restore it within 7 days."
      });    
    }

    if (!user.isVerified) {
      return res.status(403).json({
        message: "Please verify your email first"
      });
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
      console.log("!password");
      throw new Error("Invalid credentials");
    }

    // Generate login token
    const token = await user.getJWT();

    res.cookie("jwt_token", token, {
      httpOnly: false,
      secure: true, 
      sameSite: "lax",
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    });

    return res.send(user);
  } catch (err) {
    return res.status(400).json({
      message: err.message
    });
  }
});

// =========================
// LOGOUT
// =========================
authRouter.post("/logout", async (req, res) => {
  const isProduction = process.env.NODE_ENV === "production";
  res.cookie("jwt_token", null, {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? "None" : "Lax",
    expires: new Date(0),
  });

  res.send("Logout Successful!!");
});

authRouter.delete("/delete-account", userAuth, async (req, res) => {
  try {
    const user = req.user;
    const { password } = req.body;

    // 🔐 Step 1: Verify password
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).send("Incorrect password");
    }

    // 🪦 Step 2: Soft delete + timestamp
    user.isDeleted = true;
    user.deletedAt = new Date(); // ✅ IMPORTANT
    await user.save();

    // 🍪 Step 2: Clear cookie
    res.cookie("jwt_token", null, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
      expires: new Date(0),
    });

    return res.send("✅ Account deleted successfully");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

authRouter.post("/restore-account", async (req, res) => {
  try {
    const { emailId, password } = req.body;

    const user = await User.findOne({ emailId }).setOptions({ includeDeleted: true });

    if (!user) {
      return res.status(400).send("User not found");
    }

    if (!user.isDeleted) {
      return res.status(400).send("Account is already active");
    }

    // 🔐 verify password
    const isMatch = await user.validatePassword(password);
    if (!isMatch) {
      return res.status(400).json({ message: "Incorrect password" });
    }

    // ⏳ check 7 days
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    if (user.deletedAt < sevenDaysAgo) {
      return res.status(403).send("Recovery period expired");
    }

    // 🔄 restore
    user.isDeleted = false;
    user.deletedAt = null;
    await user.save();

    return res.send("✅ Account restored successfully");
  } catch (err) {
    return res.status(400).send(err.message);
  }
});

module.exports = authRouter;