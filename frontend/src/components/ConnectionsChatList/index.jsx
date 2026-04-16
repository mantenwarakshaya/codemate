import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import { LoaderView, ErrorView, EmptyView } from "../Common";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const ConnectionsChatList = ({ onSelectUser, loggedInUserId }) => {
  const [chatData, setChatData] = useState([]);
  const [apiStatus, setApiStatus] = useState(
    apiStatusConstants.initial
  );

  useEffect(() => {
    fetchConnections();
  }, []);

  const fetchConnections = async () => {
    setApiStatus(apiStatusConstants.inProgress);

    try {
      // ✅ Step 1: Get connections
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });

      const users = res.data?.data || [];

      if (users.length === 0) {
        setChatData([]);
        setApiStatus(apiStatusConstants.success);
        return;
      }

      // ✅ Step 2: Get last messages safely
      const results = await Promise.allSettled(
        users.map((user) =>
          axios.get(`${BASE_URL}/chat/${user._id}`, {
            withCredentials: true,
          })
        )
      );

      const chats = results.map((result, index) => {
        const user = users[index];

        if (result.status === "fulfilled") {
          const messages = result.value.data?.messages || [];
          const lastMsg = messages[messages.length - 1];

          return {
            user,
            lastMessage: lastMsg || null,
          };
        }

        return {
          user,
          lastMessage: null,
        };
      });

      setChatData(chats);
      setApiStatus(apiStatusConstants.success);
    } catch (err) {
      console.error("Chat list error:", err.message);
      setApiStatus(apiStatusConstants.failure);
    }
  };

  // ✅ Format last message
  const formatMessage = (msg) => {
    if (!msg) return "Start a conversation";

    let text = msg.text || "";

    if (text.length > 25) {
      text = text.slice(0, 25) + "...";
    }

    if (msg.senderId?.toString() === loggedInUserId?.toString()) {
      return `You: ${text}`;
    }

    return text;
  };

  // ✅ SUCCESS VIEW
  const renderSuccessView = () => {
    if (chatData.length === 0) {
      return (
        <EmptyView
          message="No chats yet."
          actionText="Start Connecting"
        />
      );
    }

    return (
      <div className="chat-sidebar">
        <h2 className="chat-heading">Chats</h2>

        {chatData.map(({ user, lastMessage }) => (
          <div
            key={user._id}
            className="chat-user-card"
            onClick={() => onSelectUser(user)}
          >
            <img
              src={user.profilePic || "/avatar.png"}
              alt="user"
              className="chat-user-img"
            />

            <div className="chat-user-info">
              <p className="chat-user-name">
                {user.firstName} {user.lastName}
              </p>

              <p className="chat-last-message">
                {formatMessage(lastMessage)}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // ✅ MAIN RENDER SWITCH
  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Failed to load chats."
            onRetry={fetchConnections}
          />
        );

      case apiStatusConstants.success:
        return renderSuccessView();

      default:
        return null;
    }
  };

  return <>{renderContent()}</>;
};

export default ConnectionsChatList;