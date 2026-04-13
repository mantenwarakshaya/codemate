const socket = require("socket.io");
const crypto = require("crypto");
const { Chat } = require("../models/chat");
const mongoose = require("mongoose"); 
const ConnectionRequest = require("../models/connectionRequest");

const getSecretRoomId = (userId, targetUserId) => {
  return crypto
    .createHash("sha256")
    .update([userId, targetUserId].sort().join("$"))
    .digest("hex");
};

const initializeSocket = (server) => {
    const io = socket(server, {
      path: "/api/socket.io",
      cors: {
        origin: ["https://codemate-xd74.onrender.com"],
        credentials: true,
        methods: ["GET", "POST"],
      },
    });

  io.on("connection", (socket) => {
    socket.on("joinChat", ({ firstName, userId, targetUserId }) => {
      const roomId = getSecretRoomId(userId, targetUserId);
      console.log(firstName + " joined Room : " + roomId);
      socket.join(roomId);
    });

    socket.on(
      "sendMessage",
      async ({ firstName, lastName, userId, targetUserId, text }) => {

        // 🔥 ADD THIS LINE HERE
        console.log("🔥 MESSAGE RECEIVED:", {
          firstName,
          lastName,
          userId,
          targetUserId,
          text,
        });

        try {
          const roomId = getSecretRoomId(userId, targetUserId);
          console.log(firstName + " " + text);

          let chat = await Chat.findOne({
            participants: {
              $all: [
                new mongoose.Types.ObjectId(userId),
                new mongoose.Types.ObjectId(targetUserId),
              ],
            },
          });

          if (!chat) {
            chat = new Chat({
              participants: [
                new mongoose.Types.ObjectId(userId),
                new mongoose.Types.ObjectId(targetUserId),
              ],
              messages: [],
            });
          }

          chat.messages.push({
            senderId: userId,
            firstName,
            lastName,
            text,
          });

          await chat.save();

          io.to(roomId).emit("messageReceived", {
            firstName,
            lastName,
            text,
          });

        } catch (err) {
          console.log(err);
        }
  }
);

    socket.on("disconnect", () => {});
  });
};

module.exports = initializeSocket;