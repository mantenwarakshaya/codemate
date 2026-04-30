const express = require("express");
const User = require("../models/user");
const { userAuth } = require("../middlewares/auth");
const Message = require("../models/message");
const { getIO, getReceiverSocketId } = require("../utils/socket");

const chatRouter = express.Router();

// ✅ 1. Get messages between two users
chatRouter.get("/messages/:id", userAuth, async (req, res) => {
  try {
    const { id: userToChatId } = req.params;
    const myId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: myId, receiverId: userToChatId },
        { senderId: userToChatId, receiverId: myId },
      ],
    }).sort({ createdAt: 1 }); // Sort by time so chat flows correctly

    res.status(200).json(messages);
  } catch (err) {
    res.status(500).json({ message: "Error fetching messages" });
  }
});

// ✅ 2. Send a new message
chatRouter.post("/messages/send/:id", userAuth, async (req, res) => {
  try {
    const { text, image } = req.body;
    const { id: receiverId } = req.params;
    const senderId = req.user._id;

    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ message: "Cannot send message: User account deactivated" });
    }
    
    const newMessage = new Message({
      senderId,
      receiverId,
      text,
      image, // Handle image logic if needed
    });

    await newMessage.save();

    // REAL-TIME EMIT
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      const io = getIO();
      // Only send to the specific receiver
      io.to(receiverSocketId).emit("newMessage", newMessage);
    }

    res.status(201).json(newMessage);
  } catch (err) {
    res.status(500).json({ message: "Error sending message" });
  }
});

// GET unread messages count + grouped users
chatRouter.get("/messages/unread", userAuth, async (req, res) => {
  try {
    const myId = req.user._id;

    const unreadMessages = await Message.find({
      receiverId: myId,
      seen: false, // Ensure this field exists and is false in your DB
    }).populate("senderId", "firstName lastName profilePic");

    const grouped = {};

    unreadMessages.forEach((msg) => {
      if (!msg.senderId || !msg.senderId._id) return; 

      const senderId = msg.senderId._id.toString();

      if (!grouped[senderId]) {
        grouped[senderId] = {
          user: msg.senderId,
          count: 0,
          lastMessage: msg.text || "Sent a message",
          updatedAt: msg.createdAt,
        };
      }

      grouped[senderId].count += 1;

      if (new Date(msg.createdAt) > new Date(grouped[senderId].updatedAt)) {
        grouped[senderId].lastMessage = msg.text;
        grouped[senderId].updatedAt = msg.createdAt;
      }
    });

    res.json({ data: Object.values(grouped) }); // Correctly wrapped in 'data'
  } catch (err) {
    res.status(500).json({ message: "Error fetching unread messages" });
  }
});

module.exports = chatRouter;