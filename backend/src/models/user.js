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
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Invalid email address: " + value);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!validator.isStrongPassword(value)) {
          throw new Error("Enter a Strong Password");
        }
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

    // ✅ NEW FIELDS
    experience: {
      type: Number,
      min: 0,
    },
    github: {
      type: String,
      validate: (v) => !v || validator.isURL(v),
    },
    linkedin: {
      type: String,
      validate: (v) => !v || validator.isURL(v),
    },
    twitter: {
      type: String, 
      validate: (v) => !v || validator.isURL(v),
    },
    discord: {
      type: String, 
      validate: (v) => !v || validator.isURL(v),
    },

    profilePic: {
      type: String,
      default: "",
      validate(value) {
        if (value && !validator.isURL(value)) {
          throw new Error("Invalid Profile Picture URL");
        }
      },
    },

    about: {
      type: String,
      default: "Hey there! I am using CodeMate.",
      maxLength: 500,
    },
    skills: {
      type: [String],
      validate(value) {
        if (value.length > 10) {
          throw new Error("You can only add up to 10 skills");
        }
      },
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

module.exports = mongoose.model("User", userSchema);