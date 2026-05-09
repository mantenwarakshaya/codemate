import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";
import { LoaderView, ErrorView, EmptyView } from "../../Common";

const BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:7777/api";

const apiStatusConstants = {
  INITIAL: "INITIAL",
  SUCCESS: "SUCCESS",
  FAILURE: "FAILURE",
  IN_PROGRESS: "IN_PROGRESS",
};

const ConnectionsChatList = ({ onSelectUser, loggedInUserId }) => {
  const [chatData, setChatData] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.INITIAL);
  const [selectedUserId, setSelectedUserId] = useState(null);

const navigate = useNavigate();

  useEffect(() => {
    fetchConnections();
  }, []);

  // Fetch connections + last messages
  const fetchConnections = async () => {
    setApiStatus(apiStatusConstants.IN_PROGRESS);

    try {
      const res = await axios.get(`${BASE_URL}/user/connections`, {
        withCredentials: true,
      });

      const users = res.data?.data || [];

      if (users.length === 0) {
        setChatData([]);
        setApiStatus(apiStatusConstants.SUCCESS);
        return;
      }

      const results = await Promise.allSettled(
        users.map((user) =>
          axios.get(`${BASE_URL}/messages/${user._id}`, {
            withCredentials: true,
          })
        )
      );

      const chats = results.map((result, index) => {
        const user = users[index];

        if (result.status === "fulfilled") {
          const messages = result.value.data || [];
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
      setApiStatus(apiStatusConstants.SUCCESS);
    } catch (error) {
      console.error("Chat list error:", error);
      setApiStatus(apiStatusConstants.FAILURE);
    }
  };

  // Format message preview
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

  // Success UI
  const renderSuccessView = () => {
    if (chatData.length === 0) {
      return (
        <EmptyView
          message="No chats yet."
          actionText="Start Connecting"
          onAction={() => navigate("/")}
        />
      );
    }

    return (
      <div className="ConnectionsChatList-sidebar">
        {/* HEADER */}
        <div className="ConnectionsChatList-header">
          <h2 className="ConnectionsChatList-heading">Chats</h2>
        </div>

        {/* USERS LIST */}
        <div className="ConnectionsChatList-list">
          {chatData.map(({ user, lastMessage }) => (
            <div
              key={user._id}
              className={`ConnectionsChatList-user-card ${
                selectedUserId === user._id ? "active" : ""
              }`}
              onClick={() => {
                setSelectedUserId(user._id);
                onSelectUser(user);
              }}
            >
              {/* Profile Image */}
              <img
                src={user.profilePic || "/avatar.png"}
                alt="user"
                className="ConnectionsChatList-user-img"
              />

              {/* User Info */}
              <div className="ConnectionsChatList-user-info">
                <p className="ConnectionsChatList-user-name">
                  {user.firstName} {user.lastName}
                </p>

                <p className="ConnectionsChatList-last-message">
                  {formatMessage(lastMessage)}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // API State Handler
  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.IN_PROGRESS:
        return <LoaderView />;

      case apiStatusConstants.FAILURE:
        return (
          <ErrorView
            message="Failed to load chats."
            onRetry={fetchConnections}
          />
        );

      case apiStatusConstants.SUCCESS:
        return renderSuccessView();

      default:
        return null;
    }
  };

  return <div className="ConnectionsChatList-container">{renderContent()}</div>;
};

export default ConnectionsChatList;