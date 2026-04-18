const mongoose = require("mongoose");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 4,
      maxLength: 50,
    },
    lastName: {
      type: String,
    },
    emailId: {
      type: String,
      lowercase: true,
      required: true,
      unique: true,
      trim: true,
      validate: {
        validator: (v) => validator.isEmail(v),
        message: "Please enter a valid email address",
      },
    },
    password: {
      type: String,
      required: true,
      validate: {
        validator: (v) => validator.isStrongPassword(v),
        message: "Password must be strong (min 8 chars, uppercase, lowercase, number, symbol)",
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      enum: ["male", "female", "other"],
    },
    experience: {
      type: Number,
      min: 0,
    },
    github: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Please enter a valid GitHub URL",
      },
    },
    linkedin: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Please enter a valid LinkedIn URL",
      },
    },
    twitter: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Please enter a valid Twitter URL",
      },
    },
    discord: {
      type: String,
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Please enter a valid Discord URL",
      },
    },
    profilePic: {
      type: String,
      default: "",
      validate: {
        validator: (v) => !v || validator.isURL(v),
        message: "Please enter a valid profile picture URL",
      }
    },
    about: {
      type: String,
      default: "Hey there! I am using CodeMate.",
      maxLength: 500,
    },
    skills: {
      type: [String],
      validate: {
        validator: (v) => v.length <= 10,
        message: "You can only add up to 10 skills",
      },
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// JWT
userSchema.methods.getJWT = async function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET , {
    expiresIn: "7d",
  });
};

// Password check
userSchema.methods.validatePassword = async function (passwordInput) {
  return bcrypt.compare(passwordInput, this.password);
};

userSchema.methods.getEmailVerificationToken = function () {
  return jwt.sign(
    { _id: this._id },
    process.env.JWT_SECRET,
    { expiresIn: "15m" } // expires in 15 mins
  );
};

userSchema.methods.getResetPasswordToken = function () {
  return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
    expiresIn: "15m", // expires in 15 mins
  });
};

module.exports = mongoose.model("User", userSchema);