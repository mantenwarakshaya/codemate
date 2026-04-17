import { useEffect, useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { LoaderView, ErrorView } from "../../Common";

const BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";
const LIMIT = 3;

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const RightSidebar = () => {
  const [requests, setRequests] = useState([]);
  const [messages, setMessages] = useState([]);
  const [views, setViews] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    setApiStatus(apiStatusConstants.inProgress);
    
    try {
      const safeFetch = async (endpoint) => {
        try {
          const response = await fetch(`${BASE_URL}${endpoint}`, { credentials: "include" });
          
          if (!response.ok) {
            console.error(`Backend Error @ ${endpoint}: Status ${response.status}`);
            return []; 
          }
          
          const result = await response.json();
          return result.data || [];
        } catch (err) {
          console.error(`Network error for ${endpoint}:`, err);
          return [];
        }
      };

      const reqData = await safeFetch("/user/requests/received");
      const msgData = await safeFetch("/messages/unread");
      const viewData = await safeFetch("/user/profile-views");

      setRequests(reqData);
      setMessages(msgData);
      setViews(viewData);

      setApiStatus(apiStatusConstants.success);
    } catch (err) {
      console.error("Critical error in fetchNotifications:", err);
      setApiStatus(apiStatusConstants.failure);
    }
  };

  const getLimitedData = (data) => {
    const arrayData = Array.isArray(data) ? data : [];
    return {
      visible: arrayData.slice(0, LIMIT),
      remaining: Math.max(0, arrayData.length - LIMIT),
    };
  };

  const { visible: visibleViews, remaining: remainingViews } = getLimitedData(views);
  const { visible: visibleMessages, remaining: remainingMessages } = getLimitedData(messages);
  const { visible: visibleRequests, remaining: remainingRequests } = getLimitedData(requests);

  const renderSuccessView = () => (
    <div className="rightbar-container">
      {/* PROFILE VIEWS */}
      <div className="rightbar-card">
        <h4>👀 Profile Views</h4>
        {views.length === 0 ? (
          <p className="empty">No one viewed yet</p>
        ) : (
          <>
            {visibleViews.map((view) => {
              if (!view.viewerId || !view.viewerId._id) return null;

              return (
                <div
                  key={view._id}
                  className="rightbar-item"
                  onClick={() => navigate(`/profile/${view.viewerId._id}`)}
                >
                  <img src={view.viewerId.profilePic || "/avatar.png"} alt="User" />
                  <div>
                    <p>{view.viewerId.firstName}</p>
                    <span>
                      {formatDistanceToNow(new Date(view.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
            {remainingViews > 0 && <p className="more-text">+{remainingViews} more</p>}
          </>
        )}
      </div>

      {/* MESSAGES */}
      <div className="rightbar-card">
        <h4>💬 Messages</h4>
        {messages.length === 0 ? (
          <p className="empty">No new messages</p>
        ) : (
          <>
            {visibleMessages.map((msg) => {
              if (!msg.user || !msg.user._id) return null;

              return (
                <div
                  key={msg.user._id}
                  className="rightbar-item"
                  onClick={() => navigate(`/chat/${msg.user._id}`)}
                >
                  <img src={msg.user.profilePic || "/avatar.png"} alt="Sender" />
                  <div>
                    <p>{msg.user.firstName}</p>
                    <span className="truncate-text">
                      {msg.lastMessage || "New message"} •{" "}
                      {formatDistanceToNow(new Date(msg.updatedAt), { addSuffix: true })}
                    </span>
                  </div>
                  <div className="badge">{msg.count}</div>
                </div>
              );
            })}
            {remainingMessages > 0 && <p className="more-text">+{remainingMessages} more</p>}
          </>
        )}
      </div>

      {/* REQUESTS */}
      <div className="rightbar-card">
        <h4>🤝 Requests</h4>
        {requests.length === 0 ? (
          <p className="empty">No requests</p>
        ) : (
          <>
            {visibleRequests.map((req) => {
              if (!req.fromUserId || !req.fromUserId._id) return null;

              return (
                <div
                  key={req._id}
                  className="rightbar-item"
                  onClick={() => navigate(`/profile/${req.fromUserId._id}`)}
                >
                  <img src={req.fromUserId.profilePic || "/avatar.png"} alt="Requester" />
                  <div>
                    <p>{req.fromUserId.firstName}</p>
                    <span>
                      {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
            {remainingRequests > 0 && <p className="more-text">+{remainingRequests} more</p>}
          </>
        )}
      </div>
    </div>
  );

  switch (apiStatus) {
    case apiStatusConstants.inProgress:
      return <LoaderView />;
    case apiStatusConstants.failure:
      return <ErrorView message="Failed to load notifications" onRetry={fetchNotifications} />;
    case apiStatusConstants.success:
      return renderSuccessView();
    default:
      return null;
  }
};

export default RightSidebar;