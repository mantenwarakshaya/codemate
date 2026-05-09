const { Server } = require("socket.io");

let io;

const userSocketMap = new Map();

const addUserSocket = (userId, socketId) => {
  const sockets = userSocketMap.get(userId) || new Set();
  sockets.add(socketId);
  userSocketMap.set(userId, sockets);
};

const removeUserSocket = (userId, socketId) => {
  const sockets = userSocketMap.get(userId);

  if (!sockets) return;

  sockets.delete(socketId);

  if (sockets.size === 0) {
    userSocketMap.delete(userId);
  } else {
    userSocketMap.set(userId, sockets);
  }
};

const getReceiverSocketIds = (userId) => {
  return Array.from(userSocketMap.get(String(userId)) || []);
};

const getOnlineUsers = () => {
  return Array.from(userSocketMap.keys());
};

const initializeSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.BASE_URL || "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    const userId = socket.handshake.query.userId;

    if (!userId || userId === "undefined") {
      socket.disconnect(true);
      return;
    }

    const normalizedUserId = String(userId);

    addUserSocket(normalizedUserId, socket.id);

    socket.join(normalizedUserId);

    io.emit("getOnlineUsers", getOnlineUsers());

    socket.on("typing", ({ receiverId }) => {
      if (!receiverId) return;

      socket.to(String(receiverId)).emit("typing", {
        senderId: normalizedUserId,
      });
    });

    socket.on("stopTyping", ({ receiverId }) => {
      if (!receiverId) return;

      socket.to(String(receiverId)).emit("stopTyping", {
        senderId: normalizedUserId,
      });
    });

    socket.on("disconnect", () => {
      removeUserSocket(normalizedUserId, socket.id);
      io.emit("getOnlineUsers", getOnlineUsers());
    });
  });

  return io;
};

const getIo = () => {
  if (!io) {
    throw new Error("Socket.io has not been initialized");
  }

  return io;
};

module.exports = {
  initializeSocket,
  getIo,
  getReceiverSocketIds,
};
