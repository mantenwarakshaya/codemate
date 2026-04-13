import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../../utils/socket";
import './index.css'

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);

  const user = useSelector(store => store.user);
  const userId = user?._id;

  // ✅ 1. FETCH OLD MESSAGES FROM DB
  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const res = await fetch(`/api/chat/${targetUserId}`, {
          credentials: "include",
        });
        const data = await res.json();

        setMessages(
          (data.messages || []).map(msg => ({
            ...msg,
            firstName: msg.firstName || (msg.senderId === userId ? user.firstName : "User"),
            lastName: msg.lastName || ""
          }))
        );
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (targetUserId) {
      fetchMessages();
    }
  }, [targetUserId]);



useEffect(() => {
  if (!userId) return;

  const newSocket = createSocketConnection();
  setSocket(newSocket);

  newSocket.emit("joinChat", {
    firstName: user.firstName,
    userId,
    targetUserId,
  });

  newSocket.on("messageReceived", ({ firstName, lastName, text }) => {
    setMessages((messages) => [...messages, { firstName, lastName, text }]);
  });

  return () => newSocket.disconnect();
}, [userId, targetUserId]);
useEffect(() => {
  if (!userId) return;

  const newSocket = createSocketConnection();
  setSocket(newSocket);

  newSocket.emit("joinChat", {
    firstName: user.firstName,
    userId,
    targetUserId,
  });

  newSocket.on("messageReceived", ({ firstName, lastName, text }) => {
    setMessages((messages) => [...messages, { firstName, lastName, text }]);
  });

  return () => newSocket.disconnect();
}, [userId, targetUserId]);

const sendMessage = () => {
  if (!socket) return;

  socket.emit("sendMessage", {
    firstName: user.firstName,
    lastName: user.lastName,
    userId,
    targetUserId,
    text: newMessage,
  });

  setNewMessage("");
};

  return (
    <div className="chat-container">
      <h1 className="chat-heading">Chat</h1>

      <div className="messages-container">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={
              user.firstName === msg.firstName
                ? "message-right"
                : "message-left"
            }
          >
            <p className="message-name">
              {msg.firstName} {msg.lastName}
            </p>
            <p className="message-text">{msg.text}</p>
          </div>
        ))}
      </div>

      {/* Wrapping in a form allows "Enter" key to send automatically */}
      <form 
        className="input-container" 
        onSubmit={(e) => {
          e.preventDefault();
          sendMessage();
        }}
      >
        <label htmlFor="chat-message" className="sr-only">Message</label>
        <input
          id="chat-message"
          name="message"
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="message-input"
          placeholder="Type a message..."
          autoComplete="off"
        />
        <button type="submit" className="send-button">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;