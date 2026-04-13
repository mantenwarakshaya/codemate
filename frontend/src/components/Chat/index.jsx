import {useEffect, useState} from "react";
import {useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {createSocketConnection} from "../../utils/socket";
import "./index.css";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";

const Chat = () => {
  const {targetUserId} = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector(store => store.user);
  const userId = user?._id;

  const fetchChatMessages = async () => {
    try {
      const response = await fetch(`${BASE_URL}/chat/${targetUserId}`, {
        credentials: "include",
      });

      const data = await response.json();

      const chatMessages = data?.messages?.map(msg => ({
        firstName: msg.senderId?.firstName,
        lastName: msg.senderId?.lastName,
        text: msg.text,
      }));

      setMessages(chatMessages);
    } catch (err) {
      console.log("Error fetching messages", err);
    }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [targetUserId]);

  useEffect(() => {
    if (!userId) return;

    const socket = createSocketConnection();

    socket.emit("joinChat", {
      firstName: user.firstName,
      userId,
      targetUserId,
    });

    socket.on("messageReceived", ({firstName, lastName, text}) => {
      setMessages(prev => [...prev, {firstName, lastName, text}]);
    });

    return () => socket.disconnect();
  }, [userId, targetUserId]);

  const sendMessage = () => {
    if (!newMessage.trim()) return;

    const socket = createSocketConnection();

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