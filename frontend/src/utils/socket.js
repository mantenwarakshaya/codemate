import { io } from "socket.io-client";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";
    
export const createSocketConnection = () => {
  return io(BASE_URL, {
    withCredentials: true,
  });
};