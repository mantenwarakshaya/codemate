const express = require("express");
const userRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const ProfileView = require("../models/profileView");

const USER_SAFE_DATA = 
  "firstName lastName emailId profilePic about skills experience github linkedin twitter discord";
  // Get all the pending connection request for the loggedIn user
userRouter.get("/user/requests/received", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      toUserId: loggedInUser._id,
      status: "interested",
    }).populate("fromUserId", USER_SAFE_DATA);
    // }).populate("fromUserId", ["firstName", "lastName"]);

    //Remove requests from deleted users
    const filteredData = connectionRequests.filter((req) => req.fromUserId !== null); 

    res.json({
      message: "Data fetched successfully",
      data: filteredData,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/connections", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const connectionRequests = await ConnectionRequest.find({
      $or: [
        { toUserId: loggedInUser._id, status: "accepted" },
        { fromUserId: loggedInUser._id, status: "accepted" },
      ],
    })
      .populate("fromUserId", USER_SAFE_DATA)
      .populate("toUserId", USER_SAFE_DATA);

    // console.log(connectionRequests);

    const activeConnections = connectionRequests.filter(
      (row) => row.fromUserId !== null && row.toUserId !== null
    );

    const data = activeConnections.map((row) => {
      if (row.fromUserId._id.toString() === loggedInUser._id.toString()) {
        return row.toUserId;
      }
      return row.fromUserId;
    });

    res.json({ data });
  } catch (err) {
    res.status(400).send({ message: err.message });
  }
});

userRouter.get("/feed", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const page = parseInt(req.query.page) || 1;
    let limit = parseInt(req.query.limit) || 10;
    limit = limit > 50 ? 50 : limit;
    const skip = (page - 1) * limit;

    const connectionRequests = await ConnectionRequest.find({
      $or: [{ fromUserId: loggedInUser._id }, { toUserId: loggedInUser._id }],
    }).select("fromUserId  toUserId");

    const hideUsersFromFeed = new Set();
    connectionRequests.forEach((req) => {
      hideUsersFromFeed.add(req.fromUserId.toString());
      hideUsersFromFeed.add(req.toUserId.toString());
    });

    const users = await User.find({
      $and: [
        { _id: { $nin: Array.from(hideUsersFromFeed) } },
        { _id: { $ne: loggedInUser._id } },
        { isVerified: true },
      ],
    })
      .select(USER_SAFE_DATA)
      .skip(skip)
      .limit(limit);

    res.json({ data: users });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Route: Fetch all users except logged-in user
userRouter.get("/users/all", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;

    const users = await User.find({
      _id: { $ne: loggedInUser._id },
    }).select(USER_SAFE_DATA);

    res.json({
      message: "All users fetched successfully",
      data: users,
    });
  } catch (err) {
    res.status(400).send("ERROR: " + err.message);
  }
});

userRouter.get("/user/:id", userAuth, async (req, res) => {
  try {
    const { id } = req.params;
    const myId = req.user._id;

    const user = await User.findById(id).select(USER_SAFE_DATA);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ TRACK PROFILE VIEW
    if (myId.toString() !== id) {
      await ProfileView.findOneAndUpdate(
        { viewerId: myId, viewedUserId: id },
        {
          viewerId: myId,
          viewedUserId: id,
        },
        {
          upsert: true,
          new: true,
        }
      );
    }

    res.json({
      message: "User fetched successfully",
      data: user,
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET profile views
userRouter.get("/user/profile-views", userAuth, async (req, res) => {
  try {
    if (!req.user?._id) {
      return res.status(401).json({ message: "Not authenticated" });
    }

    const views = await ProfileView.find({
      viewedUserId: req.user._id,
    })
      .populate("viewerId", "firstName profilePic") // Field must exist in ProfileView Schema
      .sort({ createdAt: -1 });

    const activeViews = views.filter((v) => v.viewerId !== null);

    res.json({ data: activeViews || [] }); // Always return an array
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

module.exports = userRouter;