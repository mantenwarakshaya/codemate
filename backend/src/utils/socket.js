const { Server } = require("socket.io");

let io;
const userSocketMap = {}; // {userId: socketId}

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;
    if (userId && userId !== "undefined") {
      userSocketMap[userId] = socket.id;
    }

    // Optional: let everyone know who is online
    io.emit("getOnlineUsers", Object.keys(userSocketMap));

    socket.on("disconnect", () => {
      delete userSocketMap[userId];
      io.emit("getOnlineUsers", Object.keys(userSocketMap));
    });
  });
};

const getIO = () => io;
const getReceiverSocketId = (userId) => userSocketMap[userId];

module.exports = initializeSocket;
module.exports.getIO = getIO;
module.exports.getReceiverSocketId = getReceiverSocketId;