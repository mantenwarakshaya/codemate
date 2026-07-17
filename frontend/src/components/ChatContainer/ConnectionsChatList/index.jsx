import { useEffect, useState, useMemo } from "react"; // 1. Added useMemo
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";
import { LoaderView, ErrorView, EmptyView, PremiumVerifiedBadge } from "../../Common";
import { useChatStore } from "../../../store/useChatStore"; // 2. Ensure this import is here

const BASE_URL = "/api";

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
  
  // 3. Hook must be inside the component
  const { messages } = useChatStore();

  useEffect(() => {
    fetchConnections();
  }, []);

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

      // Fetch message history for all connections to get the initial "last message"
      const results = await Promise.allSettled(
        users.map((user) =>
          axios.get(`${BASE_URL}/messages/${user._id}`, {
            withCredentials: true,
          })
        )
      );

      const chats = results.map((result, index) => {
        const user = users[index];
        const msgs = result.status === "fulfilled" ? result.value.data || [] : [];
        const lastMsg = msgs[msgs.length - 1];

        return {
          user,
          lastMessage: lastMsg || null,
          lastMessageTime: lastMsg ? new Date(lastMsg.createdAt).getTime() : 0,
        };
      });

      setChatData(chats);
      setApiStatus(apiStatusConstants.SUCCESS);
    } catch (error) {
      console.error("Chat list error:", error);
      setApiStatus(apiStatusConstants.FAILURE);
    }
  };

  // 4. This block keeps your sidebar updated in real-time as new socket messages arrive
  const sortedChatData = useMemo(() => {
    return [...chatData]
      .map((chat) => {
        // Filter messages from global store for this specific connection
        const connectionMessages = messages.filter(
          (m) => 
            String(m.senderId) === String(chat.user._id) || 
            String(m.receiverId) === String(chat.user._id)
        );

        const latestStoreMsg = connectionMessages[connectionMessages.length - 1];

        return {
          ...chat,
          lastMessage: latestStoreMsg || chat.lastMessage,
          lastMessageTime: latestStoreMsg
            ? new Date(latestStoreMsg.createdAt).getTime()
            : (chat.lastMessage ? new Date(chat.lastMessage.createdAt).getTime() : 0),
        };
      })
      .sort((a, b) => b.lastMessageTime - a.lastMessageTime);
  }, [chatData, messages]);

  const formatMessage = (msg) => {
    if (!msg) return "Start a conversation";
    let text = msg.text || "";
    if (text.length > 25) text = text.slice(0, 25) + "...";
    if (String(msg.senderId) === String(loggedInUserId)) return `You: ${text}`;
    return text;
  };

  const renderSuccessView = () => {
    if (sortedChatData.length === 0) {
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
        <div className="ConnectionsChatList-header">
          <h2 className="ConnectionsChatList-heading">Chats</h2>
        </div>

        <div className="ConnectionsChatList-list">
          {/* 5. Loop through the SORTED data here */}
          {sortedChatData.map(({ user, lastMessage }) => (
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
              <img
                src={user.profilePic || "/avatar.png"}
                alt="user"
                className="ConnectionsChatList-user-img"
              />

              <div className="ConnectionsChatList-user-info">
                <p className="ConnectionsChatList-user-name">
                  {user.firstName} {user.lastName}
                  <PremiumVerifiedBadge user={user} />
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

  const renderContent = () => {
    switch (apiStatus) {
      case apiStatusConstants.IN_PROGRESS:
        return <LoaderView />;
      case apiStatusConstants.FAILURE:
        return <ErrorView message="Failed to load chats." onRetry={fetchConnections} />;
      case apiStatusConstants.SUCCESS:
        return renderSuccessView();
      default:
        return null;
    }
  };

  return <div className="ConnectionsChatList-container">{renderContent()}</div>;
};

export default ConnectionsChatList;