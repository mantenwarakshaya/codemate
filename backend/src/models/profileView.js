// models/profileView.js
const mongoose = require("mongoose");

const profileViewSchema = new mongoose.Schema(
  {
    viewerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    viewedUserId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate spam views (same user)
profileViewSchema.index({ viewerId: 1, viewedUserId: 1 });

module.exports = mongoose.model("ProfileView", profileViewSchema);