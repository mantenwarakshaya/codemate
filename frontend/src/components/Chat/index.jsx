import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import { createSocketConnection } from "../../utils/socket";

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

        setMessages(data.messages || []); // ✅ important
      } catch (err) {
        console.error("Error fetching messages:", err);
      }
    };

    if (targetUserId) {
      fetchMessages();
    }
  }, [targetUserId]);

  // ✅ 2. SOCKET CONNECTION
  useEffect(() => {
    if (!userId) return;

    const newSocket = createSocketConnection();
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("Socket connected:", newSocket.id);
    });

    newSocket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    newSocket.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages(prev => [...prev, { firstName, lastName, text }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [userId, targetUserId]);

  // ✅ 3. SEND MESSAGE
  const sendMessage = () => {
    if (!newMessage.trim() || !socket) return;

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

      <div className="input-container">
        <input
          type="text"
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
          className="message-input"
          placeholder="Type a message..."
        />
        <button className="send-button" onClick={sendMessage}>
          Send
        </button>
      </div>
    </div>
  );
};

export default Chat;