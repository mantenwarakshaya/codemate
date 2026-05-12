const express = require("express");
const requestRouter = express.Router();

const { userAuth } = require("../middlewares/auth");
const ConnectionRequest = require("../models/connectionRequest");
const User = require("../models/user");
const { deleteModel } = require("mongoose");


requestRouter.post(
  "/request/send/:status/:toUserId",
  userAuth,
  async (req, res) => {
    try {
      const fromUserId = req.user._id;
      const toUserId = req.params.toUserId;
      const status = req.params.status;

      // 1. Validate Status
      const allowedStatus = ["ignored", "interested"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ message: "Invalid status type: " + status });
      }

      // 2. Check Rate Limits
      const LIMIT_NORMAL = 20;
      const LIMIT_PREMIUM = 200;
      const userLimit = req.user.isPremium ? LIMIT_PREMIUM : LIMIT_NORMAL;

      // Calculate the start of "today" (last 24 hours)
      const twentyFourHoursAgo = new Date();
      twentyFourHoursAgo.setHours(twentyFourHoursAgo.getHours() - 24);

      const requestCountToday = await ConnectionRequest.countDocuments({
        fromUserId,
        createdAt: { $gte: twentyFourHoursAgo },
      });

      if (requestCountToday >= userLimit) {
        return res.status(429).json({
          message: `Daily limit reached! ${
            req.user.isPremium ? "Premium" : "Normal"
          } users are allowed ${userLimit} requests per 24h.`,
        });
      }

      // 3. Prevent Duplicate Requests
      const existingConnectionRequest = await ConnectionRequest.findOne({
        $or: [
          { fromUserId, toUserId },
          { fromUserId: toUserId, toUserId: fromUserId },
        ],
      });
      if (existingConnectionRequest) {
        return res.status(400).send({ message: "Connection Request Already Exists!!" });
      }

      // 4. Validate Target User
      const toUser = await User.findById(toUserId);
      if (!toUser) {
        return res.status(404).json({ message: "User not found!" });
      }

      // 5. Save Request
      const connectionRequest = new ConnectionRequest({
        fromUserId,
        toUserId,
        status,
      });

      const data = await connectionRequest.save();

      res.json({
        message: `${req.user.firstName} is ${status} in ${toUser.firstName}`,
        remainingRequests: userLimit - (requestCountToday + 1),
        data,
      });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.post(
  "/request/review/:status/:requestId",
  userAuth,
  async (req, res) => {
    try {
      const loggedInUser = req.user;
      const { status, requestId } = req.params;

      const allowedStatus = ["accepted", "rejected"];
      if (!allowedStatus.includes(status)) {
        return res.status(400).json({ messaage: "Status not allowed!" });
      }

      const connectionRequest = await ConnectionRequest.findOne({
        _id: requestId,
        toUserId: loggedInUser._id,
        status: "interested",
      }).populate("fromUserId", "firstName");

      if (!connectionRequest || !connectionRequest.fromUserId) {
        return res.status(404).json({ 
          message: "Request no longer valid (User account deactivated)" 
        });
      }

      connectionRequest.status = status;

      const data = await connectionRequest.save();

      res.json({ message: "Connection request " + status, data });
    } catch (err) {
      res.status(400).send("ERROR: " + err.message);
    }
  }
);

requestRouter.delete("/connection/remove/:userId", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const { userId } = req.params;

    // Find and delete the connection where status is 'accepted'
    // It could be from -> to OR to -> from
    const connection = await ConnectionRequest.findOneAndDelete({
      $or: [
        { fromUserId: loggedInUser._id, toUserId: userId, status: "accepted" },
        { fromUserId: userId, toUserId: loggedInUser._id, status: "accepted" },
      ],
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection not found" });
    }

    res.json({ message: "Connection removed successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server Error: " + err.message });
  }
});

module.exports = requestRouter;