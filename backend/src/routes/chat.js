const express = require("express");
const mongoose = require("mongoose");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const { getIo } = require("../utils/socket");
const Message = require("../models/message");

const chatRouter = express.Router();

/* ===========================
   ✅ 1. UNREAD SUMMARY (KEEP THIS FIRST)
=========================== */
chatRouter.get("/messages/unread", userAuth, async (req, res) => {
  try {
    const userId = req.user._id;

    const messages = await Message.aggregate([
      {
        $match: {
          receiverId: new mongoose.Types.ObjectId(userId),
        },
      },
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$senderId",
          lastMessage: { $first: "$text" },
          createdAt: { $first: "$createdAt" },
          unseenCount: {
            $sum: {
              $cond: [{ $eq: ["$seen", false] }, 1, 0],
            },
          },
        },
      },
    ]);

    const populated = await User.populate(messages, {
      path: "_id",
      select: "firstName profilePic isPremium",
    });

    const formatted = populated.map((item) => ({
      user: item._id,
      text: item.lastMessage,
      createdAt: item.createdAt,
      count: item.unseenCount,
      isRead: item.unseenCount === 0,
    }));

    res.status(200).json({
      success: true,
      messages: formatted,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
});

/* ===========================
   ✅ 2. GET MESSAGES (KEEP AFTER unread)
=========================== */
chatRouter.get("/messages/:id", userAuth, async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
      deletedFor: { $ne: myId },
    }).sort({ createdAt: 1 });

    res.status(200).json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching messages" });
  }
});

/* ===========================
   ✅ 3. SEND MESSAGE
=========================== */
chatRouter.post("/messages/send/:id", userAuth, async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image,
    });

    await newMessage.save();

    // SOCKET.IO: Notify the receiver instantly
    const io = getIo();

    io.to(String(receiverId)).emit("newMessage", newMessage);
    io.to(String(senderId)).emit("newMessage", newMessage);

    res.status(201).json(newMessage);
  } catch (error) {
    console.error("Error in sendMessage:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===========================
   ✅ 4. MARK AS SEEN
=========================== */
chatRouter.post("/messages/mark-seen/:senderId", userAuth, async (req, res) => {
  try {
    const { senderId } = req.params; // The person who sent the messages
    const userId = req.user._id;     // You (the receiver)

    // Update all messages where you are the receiver and they are the sender
    await Message.updateMany(
      { senderId, receiverId: userId, seen: false },
      { $set: { seen: true } }
    );

    // SOCKET.IO: Notify the original sender that their messages were seen
    const io = getIo();

    io.to(String(senderId)).emit("messagesSeen", {
      seenBy: userId,
      senderId,
    });

    res.status(200).json({ success: true, message: "Messages marked as seen" });
  } catch (error) {
    console.error("Error in markSeen:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/* ===========================
   ✅ 5. CLEAR CHAT
=========================== */
chatRouter.delete("/messages/clear/:id", userAuth, async (req, res) => {
  try {
    const { id: otherUserId } = req.params;
    const myId = req.user._id;

    // Mark every message in this conversation as "deleted for me"
    await Message.updateMany(
      {
        $or: [
          { senderId: myId, receiverId: otherUserId },
          { senderId: otherUserId, receiverId: myId },
        ],
      },
      { $addToSet: { deletedFor: myId } }
    );

    // Optional cleanup: once BOTH participants have cleared a message,
    // there's no reason to keep it around at all.
    await Message.deleteMany({
      $or: [
        { senderId: myId, receiverId: otherUserId },
        { senderId: otherUserId, receiverId: myId },
      ],
      deletedFor: { $all: [myId, otherUserId] },
    });

    // Notify only my own connected devices/tabs to clear the UI locally
    const io = getIo();
    io.to(String(myId)).emit("chatCleared", { withUser: otherUserId });

    res.status(200).json({ success: true, message: "Chat cleared" });
  } catch (error) {
    console.error("Error in clearChat:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = chatRouter;