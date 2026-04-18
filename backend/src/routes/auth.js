const express = require("express");
const authRouter = express.Router();

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const sendEmail = require("../utils/sendEmail");
const { validateSignUpData } = require("../utils/validation");

// =========================
// SIGNUP
// =========================
authRouter.post("/signup", async (req, res) => {
  try {
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    const passwordHash = await bcrypt.hash(password, 10);

    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();

    // 🔐 Generate verification token
    const token = user.getEmailVerificationToken();

    const verifyLink = `${process.env.FRONTEND_URL}/verify-email/${token}`;

    try {
      await sendEmail(
        emailId,
        "Verify your CodeMate account",
        `
          <h2>Welcome to CodeMate 🚀</h2>
          <p>Click below to verify your email:</p>
          <a href="${verifyLink}">Verify Email</a>
        `
      );
    } catch (err) {
      console.log("Email failed:", err.message);
    }

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

    const user = await User.findById(decoded._id);

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    user.isVerified = true;
    await user.save();

    return res.send("Email verified successfully!");
  } catch (err) {
    return res.status(400).send("Invalid or expired token");
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

    const user = await User.findOne({ emailId });

    if (!user) {
      return res.status(400).send("Invalid credentials");
    }

    if (!user.isVerified) {
      return res.status(403).send("Please verify your email first");
    }

    const isPasswordValid = await user.validatePassword(password);

    if (!isPasswordValid) {
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
    return res.status(400).send(err.message);
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

module.exports = authRouter;