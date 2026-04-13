import { io } from "socket.io-client";

export const createSocketConnection = () => {
  return io("/", {
    withCredentials: true,
  });
};