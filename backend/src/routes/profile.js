const express = require("express");
const profileRouter = express.Router();
const User = require("../models/user");
const validator = require("validator");
const bcrypt = require("bcrypt");
const { userAuth } = require("../middlewares/auth");
const { validateEditProfileData } = require("../utils/validation");

profileRouter.get("/profile/view", userAuth, async (req, res) => {
  try {
    const user = req.user;

    res.send(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

profileRouter.patch("/profile/edit", userAuth, async (req, res) => {
  try {
    if (!validateEditProfileData(req)) {
      throw new Error("Invalid Edit Request");
    }

    const loggedInUser = req.user;

    Object.keys(req.body).forEach((key) => (loggedInUser[key] = req.body[key]));

    await loggedInUser.save();

    res.json({
      message: `${loggedInUser.firstName}, your profile updated successfuly`,
      data: loggedInUser,
    });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

profileRouter.post("/profile/password", userAuth, async (req, res) => {
  try {
    const { emailId, newPassword } = req.body;

    // 1. Check user exists
    const user = await User.findOne({ emailId });
    if (!user) {
      throw new Error("User not found");
    }

    // 2. Validate password strength
    if (!validator.isStrongPassword(newPassword)) {
      throw new Error("Enter a strong password");
    }

    // 3. Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // 4. Update password
    user.password = hashedPassword;

    await user.save();

    res.send("Password updated successfully");

  }catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = profileRouter;