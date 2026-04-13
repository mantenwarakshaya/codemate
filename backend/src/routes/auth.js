const express = require("express");
const authRouter = express.Router();

const { validateSignUpData } = require("../utils/validation");
// const { sendVerificationEmail } = require("../utils/sendEmail");
const User = require("../models/user");

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// =========================
// VERIFY EMAIL
// =========================
// authRouter.get("/verify-email", async (req, res) => {
//   try {
//     const { token } = req.query;

//     if (!token) {
//       return res.status(400).send("Token missing");
//     }

//     const decoded = jwt.verify(token, process.env.JWT_SECRET);

//     const user = await User.findById(decoded._id);

//     if (!user) {
//       return res.status(400).send("Invalid token");
//     }

//     if (user.isVerified) {
//       return res.send("Email already verified!");
//     }

//     user.isVerified = true;
//     await user.save();

//     return res.send("✅ Email verified successfully!");
//   } catch (err) {
//     return res.status(400).send("Invalid or expired token");
//   }
// });
authRouter.get("/verify-email", async (req, res) => {
  try {
    const { token } = req.query;

    if (!token) {
      return res.status(400).send("Token missing");
    }

    const user = await User.findOne({ verificationToken: token });

    if (!user) {
      return res.status(400).send("Invalid token");
    }

    if (user.isVerified) {
      return res.send("Email already verified!");
    }

    user.isVerified = true;
    user.verificationToken = null; // 🔥 important

    await user.save();

    return res.send("✅ Email verified successfully!");
  } catch (err) {
    return res.status(400).send("Something went wrong");
  }
});
// =========================
// SIGNUP
// =========================
// authRouter.post("/signup", async (req, res) => {
//   try {
//     // Validate input
//     validateSignUpData(req);

//     const { firstName, lastName, emailId, password } = req.body;

//     // Hash password
//     const passwordHash = await bcrypt.hash(password, 10);

//     // Create user
//     const user = new User({
//       firstName,
//       lastName,
//       emailId,
//       password: passwordHash,
//       isVerified: false, // ✅ important
//     });

//     const savedUser = await user.save();

//     // Generate verification token (short expiry recommended)
//     const token = jwt.sign(
//       { _id: savedUser._id },
//       process.env.JWT_SECRET,
//       { expiresIn: "10m" }
//     );

//     // Send verification email
//     // await sendVerificationEmail(emailId, token);
//     sendVerificationEmail(emailId, token)
//       .then(() => console.log("📩 Email process done"))
//       .catch(err => console.error("Email error:", err));

//     return res.json({
//       message: "📩 Signup successful! Please verify your email.",
//     });
//   } catch (err) {
//     return res.status(400).send(err.message);
//   }
// });
const crypto = require("crypto");
const sendEmail = require("../utils/sendEmail"); // make sure path is correct

authRouter.post("/signup", async (req, res) => {
  try {
    // Validate input
    validateSignUpData(req);

    const { firstName, lastName, emailId, password } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10);

    // 🔑 Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");

    // Create user
    const user = new User({
      firstName,
      lastName,
      emailId,
      password: passwordHash,
      isVerified: false,
      verificationToken, // ✅ add this
    });

    const savedUser = await user.save();

    // 🔗 Create verification link
    const verifyLink = `https://codemate-xd74.onrender.com/verify-email?token=${verificationToken}`;
    // 📧 Send email
    await sendEmail(emailId, verifyLink);

    res.send("Signup successful. Please verify your email.");
    
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

    // Set cookie
    // res.cookie("jwt_token", token, {
    //   httpOnly: false,
    //   secure: false,
    //   sameSite: "lax",
    //   expires: new Date(Date.now() + 8 * 3600000),
    // });

    const isProduction = process.env.NODE_ENV === "production";

    // res.cookie("jwt_token", token, {
    //   httpOnly: true,
    //   secure: isProduction,
    //   sameSite: isProduction ? "none" : "lax",
    //   expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    // });

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
  // res.cookie("jwt_token", null, {
  //   expires: new Date(Date.now()),
  // });
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