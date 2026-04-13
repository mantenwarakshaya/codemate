import { io } from "socket.io-client";

export const createSocketConnection = () => {
  const isLocal = location.hostname === "localhost";

  return io(isLocal ? "http://localhost:7777" : "/", {
    path: "/api/socket.io",
    withCredentials: true,
    transports: ["websocket"], // 🔥 IMPORTANT FIX
  });
};