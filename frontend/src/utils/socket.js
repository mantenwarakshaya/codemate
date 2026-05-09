import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.PROD
  ? window.location.origin
  : "http://localhost:7777";

let socket = null;

export const connectSocket = (userId) => {
  if (!userId) return null;

  if (socket?.connected) {
    return socket;
  }

  socket = io(SOCKET_URL, {
    query: { userId },
    withCredentials: true,
    transports: ["websocket"],
  });

  return socket;
};

export const getSocket = () => socket;

export const disconnectSocket = () => {
  if (!socket) return;

  socket.removeAllListeners();
  socket.disconnect();
  socket = null;
};
