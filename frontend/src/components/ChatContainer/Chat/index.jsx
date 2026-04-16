import { useEffect, useState, useRef } from "react";
import axios from "axios";
import io from "socket.io-client";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import { X, Send, Image as ImageIcon, Menu } from "lucide-react";

import ConnectionsChatList from "../ConnectionsChatList";
import Header from "../../Header";
import navlogo from "../../../assets/navlogo.png";

import { LoaderView, ErrorView, EmptyView } from "../../Common"; // ✅ IMPORTANT

import "./index.css";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const user = useSelector((store) => store.user);

  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);

  const socketRef = useRef(null);
  const scrollRef = useRef(null);

  // ✅ AUTO SCROLL
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // ✅ FETCH USER + MESSAGES TOGETHER
  useEffect(() => {
    const fetchChatData = async () => {
      if (!targetUserId) return;

      setApiStatus(apiStatusConstants.inProgress);

      try {
        const [userRes, msgRes] = await Promise.all([
          axios.get(`/api/user/${targetUserId}`, {
            withCredentials: true,
          }),
          axios.get(`/api/messages/${targetUserId}`, {
            withCredentials: true,
          }),
        ]);

        setSelectedUser(userRes.data?.data);
        setMessages(msgRes.data || []);

        setApiStatus(apiStatusConstants.success);
      } catch (err) {
        console.error(err);
        setApiStatus(apiStatusConstants.failure);
      }
    };

    fetchChatData();
  }, [targetUserId]);

  // ✅ SOCKET
  useEffect(() => {
    if (!user?._id) return;

    socketRef.current = io("http://localhost:7777", {
      query: { userId: user._id },
      transports: ["websocket"],
      withCredentials: true,
    });

    socketRef.current.on("newMessage", (message) => {
      const isChatMessage =
        (message.senderId === targetUserId &&
          message.receiverId === user._id) ||
        (message.senderId === user._id &&
          message.receiverId === targetUserId);

      if (isChatMessage) {
        setMessages((prev) => [...prev, message]);
      }
    });

    return () => socketRef.current?.disconnect();
  }, [user?._id, targetUserId]);

  // ✅ SEND MESSAGE
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
      console.error(err);
    }
  };

  // ✅ MAIN CONTENT SWITCH
  const renderChatContent = () => {
    if (!targetUserId) {
      return (
        <div className="chat-empty chat-empty-container">
          <div className="chat-empty-content chat-empty-wrapper">
            <img
              src={navlogo}
              alt="Codemate"
              className="chat-empty-logo chat-logo"
            />

            <h2 className="chat-empty-heading">
              {isSidebarOpen
                ? "Select a Connection"
                : "Welcome to Codemate Chat"}
            </h2>

            <p className="chat-empty-text">
              {isSidebarOpen
                ? "Choose a connection from the sidebar to start chatting."
                : "Collaborate, share ideas, and solve problems faster."}
            </p>

            {!isSidebarOpen && (
              <button
                className="chat-empty-btn chat-open-btn"
                onClick={() => setIsSidebarOpen(true)}
              >
                Open Conversations
              </button>
            )}
          </div>
        </div>
      );
    }

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Failed to load chat"
            onRetry={() => window.location.reload()}
          />
        );

      case apiStatusConstants.success:
        return (
          <>
            {/* HEADER */}
            <div className="chat-header-main">
              <div className="chat-header-left">
                <button
                  className="chat-menu-btn"
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                >
                  <Menu size={20} />
                </button>

                <img
                  src={selectedUser?.profilePic || "/avatar.png"}
                  className="chat-header-avatar"
                  alt="user"
                />

                <div className="chat-header-text">
                  <h3 className="chat-header-name">
                    {selectedUser?.firstName} {selectedUser?.lastName}
                  </h3>
                </div>
              </div>

              <button
                className="chat-close-btn"
                onClick={() => navigate("/chat")}
              >
                <X size={20} />
              </button>
            </div>

            {/* MESSAGES */}
            <div className="chat-messages-area">
              {messages.length === 0 ? (
                <EmptyView message="No messages yet. Start the conversation!" />
              ) : (
                messages.map((msg, index) => {
                  const isOwn =
                    (msg.senderId?._id || msg.senderId) === user._id;

                  return (
                    <div
                      key={index}
                      className={`chat-row ${
                        isOwn ? "chat-row-end" : "chat-row-start"
                      }`}
                    >
                      {!isOwn ? (
                        <>
                          <img
                            src={selectedUser.profilePic || "/avatar.png"}
                            className="chat-message-avatar"
                            alt="user"
                          />
                          <div className="chat-bubble chat-bubble-target">
                            {msg.text}
                          </div>
                        </>
                      ) : (
                        <>
                          <div className="chat-bubble chat-bubble-own">
                            {msg.text}
                          </div>
                          <img
                            src={user.profilePic || "/avatar.png"}
                            className="chat-message-avatar"
                            alt="me"
                          />
                        </>
                      )}
                    </div>
                  );
                })
              )}
              <div ref={scrollRef} />
            </div>

            {/* INPUT */}
            <div className="chat-footer-main">
              <div className="chat-input-wrapper">
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
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Header />

      <div className="chat-layout-container">
        {/* SIDEBAR */}
        <div
          className={`chat-sidebar-container ${
            isSidebarOpen ? "open" : "collapsed"
          }`}
        >
          <ConnectionsChatList
            onSelectUser={(user) => navigate(`/chat/${user._id}`)}
            loggedInUserId={user?._id}
          />
        </div>

        {/* MAIN */}
        <div className="chat-main-container">
          {renderChatContent()}
        </div>
      </div>
    </>
  );
};

export default Chat;