import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useSelector } from "react-redux";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Send, Image, Smile, ArrowLeft, MoreVertical, CheckCheck } from "lucide-react";

import ConnectionsChatList from "../ConnectionsChatList";
import Header from "../../Header";
import { LoaderView, ErrorView, EmptyView, PremiumVerifiedBadge } from "../../Common";
import { useChatStore } from "../../../store/useChatStore";

import navlogo from "../../../assets/navlogo.png";
import "./index.css";

const BASE_URL = import.meta.env.PROD ? "/api" : "http://localhost:7777/api";

const getId = (value) => {
  if (!value) return "";
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};

const getCurrentUser = (reduxUser) =>
  reduxUser?.data || reduxUser?.user || reduxUser?.userData || reduxUser || null;

const Chat = () => {
  const { targetUserId } = useParams();
  const navigate = useNavigate();

  const reduxUser = useSelector((store) => store.user);
  const reduxLoggedInUser = getCurrentUser(reduxUser);

  const [currentUser, setCurrentUser] = useState(reduxLoggedInUser);
  const loggedInUser = currentUser || reduxLoggedInUser;
  const loggedInUserId = getId(loggedInUser?._id);

  const { messages, setMessages, addMessage, initializeSocket } = useChatStore();

  const [newMessage, setNewMessage] = useState("");
  const [apiStatus, setApiStatus] = useState("INITIAL");
  const [targetUser, setTargetUser] = useState(null);
  const [showSidebar, setShowSidebar] = useState(true);

  const scrollRef = useRef(null);

  useEffect(() => {
    if (reduxLoggedInUser?._id) {
      setCurrentUser(reduxLoggedInUser);
    }
  }, [reduxLoggedInUser]);

  useEffect(() => {
    if (loggedInUserId) return;

    const fetchLoggedInUser = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/profile/view`, {
          withCredentials: true,
        });

        const userData = res.data?.data || res.data?.user || res.data;
        setCurrentUser(userData);
      } catch (err) {
        console.error("Unable to fetch logged in user for socket:", err);
      }
    };

    fetchLoggedInUser();
  }, [loggedInUserId]);

  useEffect(() => {
    if (!loggedInUserId) return;

    initializeSocket(loggedInUserId);
  }, [loggedInUserId, initializeSocket]);

  const getDateLabel = useCallback((dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date();

    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return "Today";
    if (date.toDateString() === yesterday.toDateString()) return "Yesterday";

    return date.toLocaleDateString([], {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  }, []);

  const fetchConversation = useCallback(async () => {
    if (!targetUserId) return;

    setApiStatus("IN_PROGRESS");

    try {
      const [msgRes, userRes] = await Promise.all([
        axios.get(`${BASE_URL}/messages/${targetUserId}`, {
          withCredentials: true,
        }),
        axios.get(`${BASE_URL}/user/${targetUserId}`, {
          withCredentials: true,
        }),
      ]);

      const userData = userRes.data?.data || userRes.data?.user || userRes.data;

      setMessages(msgRes.data || []);
      setTargetUser(userData);
      setApiStatus("SUCCESS");

      axios.post(
        `${BASE_URL}/messages/mark-seen/${targetUserId}`,
        {},
        { withCredentials: true }
      );
    } catch (err) {
      console.error("Chat Load Error:", err);
      setApiStatus("FAILURE");
    }
  }, [targetUserId, setMessages]);

  useEffect(() => {
    if (!targetUserId) {
      setMessages([]);
      setTargetUser(null);
      setApiStatus("INITIAL");
      return;
    }

    fetchConversation();
  }, [targetUserId, fetchConversation, setMessages]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const activeChatMessages = useMemo(() => {
    if (!targetUserId) return [];

    return messages.filter((msg) => {
      const senderId = getId(msg.senderId);
      const receiverId = getId(msg.receiverId);
      const otherId = String(targetUserId);

      return senderId === otherId || receiverId === otherId;
    });
  }, [messages, targetUserId]);

  useEffect(() => {
    if (!targetUserId || activeChatMessages.length === 0) return;

    const hasUnseenIncomingMessages = activeChatMessages.some((msg) => {
      const senderId = getId(msg.senderId);

      return senderId === String(targetUserId) && msg.seen === false;
    });

    if (!hasUnseenIncomingMessages) return;

    axios.post(
      `${BASE_URL}/messages/mark-seen/${targetUserId}`,
      {},
      { withCredentials: true }
    );
  }, [activeChatMessages, targetUserId]);

  const handleSendMessage = async (e) => {
    e?.preventDefault();

    const trimmedMsg = newMessage.trim();
    if (!trimmedMsg || !targetUserId) return;

    try {
      setNewMessage("");

      const res = await axios.post(
        `${BASE_URL}/messages/send/${targetUserId}`,
        { text: trimmedMsg },
        { withCredentials: true }
      );

      addMessage(res.data);
    } catch (err) {
      console.error("Message Send Error:", err);
      setNewMessage(trimmedMsg);
    }
  };

  const renderedMessages = useMemo(() => {
    let lastDateLabel = "";

    return activeChatMessages.map((msg, index) => {
      const senderId = getId(msg.senderId);
      const isOwn = senderId !== String(targetUserId);

      const currentDateLabel = getDateLabel(msg.createdAt);
      const showDivider = currentDateLabel !== lastDateLabel;
      lastDateLabel = currentDateLabel;

      return (
        <React.Fragment key={msg._id || index}>
          {showDivider && (
            <div className="chat-date-divider">
              <span>{currentDateLabel}</span>
            </div>
          )}

          <div className={`chat-row ${isOwn ? "chat-row-end" : "chat-row-start"}`}>
            <div className="chat-message-wrapper">
              <img
                src={
                  (isOwn ? loggedInUser?.profilePic : targetUser?.profilePic) ||
                  "/avatar.png"
                }
                className="chat-message-avatar"
                alt="profile"
              />

              <div className="chat-bubble-container">
                <div
                  className={`chat-bubble ${
                    isOwn ? "chat-bubble-own" : "chat-bubble-target"
                  }`}
                >
                  {msg.text}
                </div>

                <span className="chat-time-stamp">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {isOwn && (
                    <CheckCheck
                      size={14}
                      strokeWidth={2.4}
                      className={`chat-seen-icon ${msg.seen ? "seen" : "unseen"}`}
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
        </React.Fragment>
      );
    });
  }, [activeChatMessages, targetUserId, loggedInUser, targetUser, getDateLabel]);

  return (
    <div className="chat-page-wrapper">
      <Header />

      <main className="chat-layout-container">
        <aside
          className={`chat-sidebar-container ${
            showSidebar ? "open" : "mobile-hide-sidebar"
          }`}
        >
        <ConnectionsChatList
          onSelectUser={(u) => {
            navigate(`/chat/${u._id}`);

            if (window.innerWidth <= 768) {
              setShowSidebar(false);
            }
          }}
          loggedInUserId={loggedInUserId}
        />
        </aside>

        <section
          className={`chat-main-container ${
            !showSidebar ? "open-chat-mobile" : "mobile-hide-chat"
          }`}
        >
          {!targetUserId ? (
            <div className="chat-empty-container">
              <div className="chat-empty-content">
                <img src={navlogo} alt="Codemate Logo" className="chat-empty-logo" />
                <h2 className="chat-empty-heading">Your Messages</h2>
                <p className="chat-empty-text">
                  Select a connection to start a professional conversation.
                </p>
              </div>
            </div>
          ) : apiStatus === "IN_PROGRESS" ? (
            <LoaderView />
          ) : apiStatus === "FAILURE" ? (
            <ErrorView message="Unable to load conversation." />
          ) : (
            <>
              <header className="chat-header-main">
                <div className="chat-header-left">
                <button
                  type="button"
                  className="chat-menu-btn"
                  onClick={() => {
                    navigate("/chat");

                    if (window.innerWidth <= 768) {
                      setShowSidebar(true);
                    }
                  }}
                >
                  <ArrowLeft size={20} />
                </button>

                  <img
                    src={targetUser?.profilePic || "/avatar.png"}
                    className="chat-header-avatar"
                    alt="user"
                    onClick={() => targetUser?._id && navigate(`/profile/${targetUser._id}`)}
                    style={{ cursor: targetUser?._id ? "pointer" : "default" }}
                    title={targetUser?._id ? "View profile" : ""}
                  />

                  <h3 
                    className="chat-header-name"
                    onClick={() => targetUser?._id && navigate(`/profile/${targetUser._id}`)}
                    style={{ cursor: targetUser?._id ? "pointer" : "default" }}
                    title={targetUser?._id ? "View profile" : ""}
                  >
                    {targetUser
                      ? `${targetUser.firstName || ""} ${
                          targetUser.lastName || ""
                        }`.trim() || "Chat"
                      : "Chat"}
                    <PremiumVerifiedBadge user={targetUser} />
                  </h3>
                </div>

                <button type="button" className="chat-icon-btn">
                  <MoreVertical size={20} />
                </button>
              </header>

              <div className="chat-messages-area">
                {activeChatMessages.length === 0 ? (
                  <EmptyView message="No messages yet. Break the ice!" />
                ) : (
                  renderedMessages
                )}

                <div ref={scrollRef} />
              </div>

              <footer className="chat-footer-main">
                <form className="chat-input-wrapper" onSubmit={handleSendMessage}>
                  <button type="button" className="chat-icon-btn">
                    <Image size={20} />
                  </button>

                  <input
                    className="chat-input-field"
                    placeholder="Write a message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                  />

                  <button type="button" className="chat-icon-btn">
                    <Smile size={20} />
                  </button>

                  <button
                    type="submit"
                    className="chat-send-btn"
                    disabled={!newMessage.trim()}
                  >
                    <Send size={18} />
                  </button>
                </form>
              </footer>
            </>
          )}
        </section>
      </main>
    </div>
  );
};

export default Chat;
