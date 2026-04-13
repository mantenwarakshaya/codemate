// import { useEffect, useState } from "react";
// import { useParams } from "react-router-dom";
// import { createSocketConnection } from "../../utils/socket";
// import { useSelector } from "react-redux";
// import axios from "axios";
// import "./index.css";

// const BASE_URL = "/api";
    
// const Chat = () => {
//   const { targetUserId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
//   const user = useSelector((store) => store.user);
//   const userId = user?._id;

//   console.log("Chat Component Render - User:", user);

//   const fetchChatMessages = async () => {
//     try{
//     const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
//       withCredentials: true,
//     });

//     console.log(chat.data.messages);

//     const chatMessages = chat?.data?.messages?.map((msg) => {
//       const { senderId, text } = msg;
//       return {
//         firstName: senderId?.firstName || "User",
//         lastName: senderId?.lastName || "",
//         text,
//       };
//     }) || [];
//     setMessages(chatMessages);}catch(err){console.log("Error fetching essages: ",err)}
//   };
// useEffect(() => {
//     if (userId) {
//       fetchChatMessages();
//     }
//   }, [targetUserId, userId]);

//   useEffect(() => {
//     if (!userId || !user) {
//       return;
//     }
//     const socket = createSocketConnection();
//     // As soon as the page loaded, the socket connection is made and joinChat event is emitted
//     socket.emit("joinChat", {
//       firstName: user.firstName,
//       userId,
//       targetUserId,
//     });

//     socket.on("messageReceived", ({ firstName, lastName, text }) => {
//       console.log(firstName + " :  " + text);
//       setMessages((prev) => [...prev, { firstName, lastName, text }]);
//     });

//     return () => {
//       socket.disconnect();
//     };
//   }, [userId, targetUserId]);

//   const sendMessage = () => {
//     if (!user || !newMessage.trim()) return;
//     const socket = createSocketConnection();
//     socket.emit("sendMessage", {
//       firstName: user.firstName,
//       lastName: user.lastName,
//       userId,
//       targetUserId,
//       text: newMessage,
//     });
//     setNewMessage("");
//   };
// if (!user) {
//     return (
//       <div className="chat-container">
//         <div className="loading-state">
//           <h2>Loading Chat...</h2>
//           <p>Verifying session... If this stays, please log in again.</p>
//           <button onClick={() => navigate("/login")}>Go to Login</button>
//         </div>
//       </div>
//     );
//   }
//   return (
//     <div className="chat-container">
//       <h1 className="chat-heading">Chat</h1>

//       <div className="messages-container">
//         {messages.map((msg, index) => {
//           const isOwnMessage = user.firstName === msg.firstName;

//           return (
//             <div
//               key={index}
//               className={isOwnMessage ? "message-right" : "message-left"}
//             >
//               <div className="message-name">
//                 {msg.firstName} {msg.lastName}
//               </div>
//               <div className="message-text">{msg.text}</div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="input-container">
//         <input
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           className="message-input"
//           placeholder="Type a message..."
//         />
//         <button onClick={sendMessage} className="send-button">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };
// export default Chat;

import { useEffect, useState, useRef } from "react"; 
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../../utils/socket";
import { useSelector } from "react-redux";
import axios from "axios";
import "./index.css";

const BASE_URL = "/api";

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const user = useSelector((store) => store.user);
  const socketRef = useRef(null); // Keep track of the socket

  const fetchChatMessages = async () => {
    try {
      const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, { withCredentials: true });
      const chatMessages = chat?.data?.messages.map((msg) => ({
        firstName: msg.senderId?.firstName || msg.firstName || "User",
        lastName: msg.senderId?.lastName || msg.lastName || "",
        text: msg.text,
      })) || [];
      setMessages(chatMessages);
    } catch (err) { console.error(err); }
  };

  useEffect(() => {
    fetchChatMessages();
  }, [targetUserId]);

  useEffect(() => {
    if (!user?._id) return;

    // Connect once
    socketRef.current = createSocketConnection();
    
    socketRef.current.emit("joinChat", {
      firstName: user.firstName,
      userId: user._id,
      targetUserId,
    });

    socketRef.current.on("messageReceived", ({ firstName, lastName, text }) => {
      setMessages((prev) => [...prev, { firstName, lastName, text }]);
    });

    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [user?._id, targetUserId]);

  const sendMessage = () => {
    if (!newMessage.trim() || !socketRef.current) return;

    socketRef.current.emit("sendMessage", {
      firstName: user.firstName,
      lastName: user.lastName,
      userId: user._id,
      targetUserId,
      text: newMessage,
    });
    setNewMessage("");
  };

  if (!user) return <div>Loading...</div>;

  return (
    <div className="chat-container">
       <h1 className="chat-heading">Chat</h1>

       <div className="messages-container">
        {messages.map((msg, index) => {
          const isOwnMessage = user.firstName === msg.firstName;

          return (
            <div
              key={index}
              className={isOwnMessage ? "message-right" : "message-left"}
            >
              <div className="message-name">
                {msg.firstName} {msg.lastName}
              </div>
              <div className="message-text">{msg.text}</div>
            </div>
          );
        })}
      </div>

      <div className="input-container">
        <input
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          className="message-input"
          placeholder="Type a message..."
        />
        <button onClick={sendMessage} className="send-button">
          Send
        </button>
      </div>
    </div>
  );
};
export default Chat;
