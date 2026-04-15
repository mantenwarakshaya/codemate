const express = require("express");
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

module.exports = chatRouter;