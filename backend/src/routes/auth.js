const express = require("express");
const authRouter = express.Router();
const { validateSignUpData } = require("../utils/validation");
const User = require("../models/user");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =========================
// SIGNUP
// =========================
authRouter.post("/signup", async (req, res) => {
  try {
    // Validate input
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // Create user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
    });

    await user.save();

    return res.json({
      message: "📩 Signup successful! Please Login.",
    });
  } catch (err) {
    return res.status(400).send(err.message);
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
      // throw new Error("Invalid credentials");
      return res.status(400).send("Invalid credentials");
    }
    console.log("isVerified:", user.isVerified);
    // 🔒 Block unverified users
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