import { create } from "zustand";
import { connectSocket, disconnectSocket } from "../utils/socket";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

const isSameMessage = (a, b) => {
  if (a?._id && b?._id) {
    return String(a._id) === String(b._id);
  }

  return (
    getId(a?.senderId) === getId(b?.senderId) &&
    getId(a?.receiverId) === getId(b?.receiverId) &&
    a?.text === b?.text &&
    a?.createdAt === b?.createdAt
  );
};

export const useChatStore = create((set, get) => ({
  messages: [],
  onlineUsers: [],
  socket: null,

  setMessages: (messages) => set({ messages: messages || [] }),

  addMessage: (newMessage) => {
    if (!newMessage) return;

    set((state) => {
      const alreadyExists = state.messages.some((message) =>
        isSameMessage(message, newMessage)
      );

      if (alreadyExists) return state;

      return {
        messages: [...state.messages, newMessage],
      };
    });
  },

  initializeSocket: (userId) => {
    if (!userId) return;

    const existingSocket = get().socket;

    if (existingSocket?.connected) return;

    const socket = connectSocket(userId);

    if (!socket) return;

    socket.removeAllListeners();

    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
    });

    socket.on("getOnlineUsers", (userIds) => {
      set({ onlineUsers: userIds || [] });
    });

    socket.on("newMessage", (newMessage) => {
      get().addMessage(newMessage);
    });

    socket.on("messagesSeen", ({ seenBy }) => {
      set((state) => ({
        messages: state.messages.map((message) =>
          getId(message.receiverId) === getId(seenBy)
            ? { ...message, seen: true }
            : message
        ),
      }));
    });



    socket.on("disconnect", () => {
      console.log("Socket disconnected");
    });

    set({ socket });
  },

  closeSocket: () => {
    disconnectSocket();

    set({
      socket: null,
      messages: [],
      onlineUsers: [],
    });
  },
}));
