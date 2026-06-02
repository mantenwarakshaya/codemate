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
        validator: (v) => !v || v.startsWith("http") || v.startsWith("data:image"),
        message: "Invalid image format",
      }
    },
    about: {
      type: String,
      default: "Hey there! I am using CodeMate.",
      maxLength: 500,
    },
    roles: {
      type: [String],
      default: [],
      validate: {
        // ✅ FIX: Allow an empty array (length === 0), but if values exist, limit them to 5
        validator: (v) => v.length === 0 || (v.length > 0 && v.length <= 5),
        message: "Please specify between 1 and 5 professional roles",
      },
      // Added a safety check to prevent map errors on empty/null values
      set: (v) => (v ? v.map(role => role.toLowerCase().trim()) : [])
    },
    connectionStatus: {
      type: String,
      default: "seeking opportunities",
      enum: {
        values: [
          "seeking opportunities",    // Replaces 'open to opportunities' (Executive tone)
          "open to collaboration",    // Standard professional partnership terminology
          "available for mentorship", // Positions the user as an industry expert
          "networking exclusively",   // Formal way to say 'just here to meet people'
          "currently engaged"         // Replaces 'not available' (Implies high-value/employed)
        ],
        message: "{VALUE} is not a valid professional status",
      }
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
    isPremium: {
      type: Boolean,
      default: false,
    },
    membershipType: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    membershipStartedAt: {
      type: Date,
    },
    membershipExpiresAt: {
      type: Date,
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

userSchema.pre(/^find/, function (next) {
  // 'this' refers to the query object
  // We check if we explicitly want to see deleted users (for login/restore)
  // Use 'this.getOptions()' to check for our custom flag
  const options = this.getOptions();
  
  if (options && options.includeDeleted === true) {
    return ;
  }
  
  // 4. Default: Filter out deleted users
  this.where({ isDeleted: { $ne: true } });
  

});

userSchema.index({ deletedAt: 1 }, { expireAfterSeconds: 7 * 24 * 60 * 60 });

module.exports = mongoose.model("User", userSchema);