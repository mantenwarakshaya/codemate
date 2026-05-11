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

requestRouter.get("/user/requests/ignored", userAuth, async (req, res) => {
  try {
    const loggedInUser = req.user;
    const ignoredRequests = await ConnectionRequest.find({
      fromUserId: loggedInUser._id,
      status: "ignored",
    }).populate("toUserId", "firstName lastName profilePic skills isPremium");

    res.json({ data: ignoredRequests });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

requestRouter.delete("/request/restore/:requestId", userAuth, async(req,res) => {
  try{
    const { requestId } = req.params;

    const deleteRequest = await ConnectionRequest.findByIdAndDelete({
      _id: requestId,
      fromUserId: req.user._id
    });

    if(!deleteRequest){
      return res.status(404).json({ messaage: "Request not found" });
    }

    res.json({ messaage: "Moved back to feed ( deleted from ignored )" });
  } catch(err){
    res.status(500).json({ messaage: "Server Error" });
  }
});

module.exports = requestRouter;