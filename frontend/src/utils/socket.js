import { io } from "socket.io-client";

export const createSocketConnection = () => {
  const isLocal = location.hostname === "localhost";

  return io(
    isLocal
      ? "http://localhost:7777"
      : "https://codemate-xd74.onrender.com", // 🔥 FIXED
    {
      path: "/api/socket.io",
      withCredentials: true,
      transports: ["websocket"], // 🔥 MUST
    }
  );
};