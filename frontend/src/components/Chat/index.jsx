// import { useEffect, useState, useRef } from "react";
// import { useParams } from "react-router-dom";
// import axios from "axios";
// import io from "socket.io-client";
// import { useSelector } from "react-redux"; // Using Redux to get logged-in user
// import "./index.css";

// const Chat = () => {
//   const { targetUserId } = useParams();
//   const [messages, setMessages] = useState([]);
//   const [newMessage, setNewMessage] = useState("");
  
//   // ✅ Get the logged-in user from Redux (matches your App.js syncUser)
//   const user = useSelector((store) => store.user);
//   const socketRef = useRef(null);

//   // ✅ 1. Fetch Message History
//   const fetchMessages = async () => {
//     try {
//       // Updated URL to match the new backend route
//       const res = await axios.get(`/api/messages/${targetUserId}`, {
//         withCredentials: true,
//       });
//       setMessages(res.data || []);
//     } catch (err) {
//       console.error("Error fetching messages:", err);
//     }
//   };

//   useEffect(() => {
//     if (targetUserId) {
//       fetchMessages();
//     }
//   }, [targetUserId]);

//   // ✅ 2. Socket Setup (The Handshake)
//   useEffect(() => {
//     if (!user?._id) return;

//     // Connect with the userId in the query
//     socketRef.current = io("http://localhost:7777", {
//       query: { userId: user._id },
//       transports: ["websocket"],
//       withCredentials: true,
//     });

//     socketRef.current.on("connect", () => {
//       console.log("Connected to Socket! ID:", socketRef.current.id);
//     });

//     // Listen for incoming messages
//     socketRef.current.on("newMessage", (message) => {
//       // Only add message if it belongs to this conversation
//       if (message.senderId === targetUserId || message.senderId === user._id) {
//         setMessages((prev) => [...prev, message]);
//       }
//     });

//     return () => {
//       if (socketRef.current) socketRef.current.disconnect();
//     };
//   }, [user?._id, targetUserId]);

//   // ✅ 3. Send Message
//   const sendMessage = async () => {
//     if (!newMessage.trim()) return;

//     try {
//       const res = await axios.post(
//         `/api/messages/send/${targetUserId}`,
//         { text: newMessage },
//         { withCredentials: true }
//       );

//       // Add my own message to the UI immediately
//       setMessages((prev) => [...prev, res.data]);
//       setNewMessage("");
//     } catch (err) {
//       console.error("Error sending message:", err);
//     }
//   };

//   if (!user) return <div className="p-10 text-center">Loading user...</div>;

//   return (
//     <div className="chat-container h-[90vh] flex flex-col p-4">
//       <h1 className="text-2xl font-bold mb-4">Chat</h1>

//       <div className="messages-container flex-grow overflow-y-auto bg-base-200 p-4 rounded-lg">
//         {messages.length === 0 && (
//           <p className="text-center text-gray-500">No messages yet. Say hi!</p>
//         )}
//         {messages.map((msg, index) => {
//           // Check if I sent the message
//           const isOwn = (msg.senderId?._id || msg.senderId) === user._id;

//           return (
//             <div key={index} className={`chat ${isOwn ? "chat-end" : "chat-start"}`}>
//               <div className="chat-bubble">
//                 {msg.text}
//               </div>
//               <div className="chat-footer opacity-50 text-xs">
//                 {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="input-container flex mt-4 gap-2">
//         <input
//           value={newMessage}
//           onChange={(e) => setNewMessage(e.target.value)}
//           onKeyDown={(e) => e.key === "Enter" && sendMessage()}
//           className="input input-bordered flex-grow"
//           placeholder="Type a message..."
//         />
//         <button onClick={sendMessage} className="btn btn-primary">
//           Send
//         </button>
//       </div>
//     </div>
//   );
// };

// export default Chat;
import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { X, Send, Image as ImageIcon } from "lucide-react";
import "./index.css";

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [targetUser, setTargetUser] = useState(null);
  
  const user = useSelector((store) => store.user);
  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Fetch Target User Info (for header)
  const fetchTargetUser = async () => {
    try {
      const res = await axios.get(`/api/user/${targetUserId}`, { withCredentials: true });
      setTargetUser(res.data.data);
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchMessages = async () => {
    try {
      const res = await axios.get(`/api/messages/${targetUserId}`, { withCredentials: true });
      setMessages(res.data || []);
    } catch (err) {
      console.error("Error fetching messages:", err);
    }
  };

  useEffect(() => {
    if (targetUserId) {
      fetchMessages();
      fetchTargetUser();
    }
  }, [targetUserId]);

  useEffect(() => {
    if (!user?._id) return;
    socketRef.current = io("http://localhost:7777", {
      query: { userId: user._id },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("newMessage", (message) => {
      if (message.senderId === targetUserId || message.senderId === user._id) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [user?._id, targetUserId]);

  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const res = await axios.post(
        `/api/messages/send/${targetUserId}`,
        { text: newMessage },
        { withCredentials: true }
      );
      setMessages((prev) => [...prev, res.data]);
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (!user || !targetUser) return <div className="chat-loading">Loading conversation...</div>;

// ... (imports and logic remain the same)

  return (
    <div className="chat-window-wrapper flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="chat-header-main border-b p-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="chat-avatar-container">
            <div className="chat-avatar-inner">
              <img src={targetUser.profilePic || "/avatar.png"} alt="avatar" />
            </div>
          </div>
          <div>
            <h3 className="chat-header-name">{targetUser.firstName} {targetUser.lastName}</h3>
            <p className="chat-header-status">Offline</p>
          </div>
        </div>
        <button onClick={() => navigate(-1)} className="chat-close-btn">
          <X size={20} />
        </button>
      </div>

      {/* Messages Area */}
      <div className="chat-messages-area flex-1 overflow-y-auto p-4">
        {messages.map((msg, index) => {
          const isOwn = (msg.senderId?._id || msg.senderId) === user._id;
          return (
            <div key={index} className={`chat-row ${isOwn ? "chat-row-end" : "chat-row-start"}`}>
              <div className="chat-avatar-container">
                <div className="chat-avatar-inner chat-avatar-small">
                  <img src={isOwn ? (user.profilePic || "/avatar.png") : (targetUser.profilePic || "/avatar.png")} />
                </div>
              </div>
              <div className="chat-message-content">
                <div className="chat-message-time">
                  {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
                <div className={`chat-bubble-box ${isOwn ? "chat-bubble-own" : "chat-bubble-target"}`}>
                  {msg.text}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={scrollRef} />
      </div>

      {/* Footer Input */}
      <div className="chat-footer-main p-4 border-t">
        <div className="flex items-center gap-2">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            className="chat-input-field"
            placeholder="Type a message..."
          />
          <button className="chat-icon-btn">
            <ImageIcon size={20} />
          </button>
          <button onClick={sendMessage} className="chat-send-btn">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chat;