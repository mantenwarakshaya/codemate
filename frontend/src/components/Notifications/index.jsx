import { useEffect, useState } from "react";
import "./index.css";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux"; // Pulling state
import { formatDistanceToNow } from "date-fns";
import { LoaderView, ErrorView, EmptyView, PremiumVerifiedBadge } from "../Common";
import Header from "../Header";

const BASE_URL = "/api";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const Notification = () => {
  // Use Redux state to check premium status
  const user = useSelector((state) => state.user);
  const isPremium = user?.isPremium || false;

  const [notifications, setNotifications] = useState([]);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);
  const navigate = useNavigate();

  useEffect(() => {
    fetchNotifications();
  }, []);

  const safeFetch = async (endpoint) => {
    try {
      const res = await fetch(`${BASE_URL}${endpoint}`, { credentials: "include" });
      if (!res.ok) return [];
      const data = await res.json();
      return data.messages || data.data || [];
    } catch { return []; }
  };

  const fetchNotifications = async () => {
    setApiStatus(apiStatusConstants.inProgress);
    try {
      const [reqData, rawMessages, viewData] = await Promise.all([
        safeFetch("/user/requests/received"),
        safeFetch("/messages/unread"),
        safeFetch("/user/profile-views"),
      ]);

      const normalizedRequests = reqData.map((req) => ({
        id: req._id, type: "request", user: req.fromUserId, createdAt: req.createdAt, isRead: true,
      }));

      const normalizedViews = viewData.map((view) => ({
        id: view._id, type: "view", user: view.viewerId, createdAt: view.createdAt, isRead: true,
      }));

      const groupedMessages = rawMessages.filter((msg) => msg.user?._id).map((msg) => ({
        id: msg.user._id, type: "message", user: msg.user, text: msg.text, count: msg.count, createdAt: msg.createdAt, isRead: msg.isRead,
      }));

      const all = [...normalizedRequests, ...normalizedViews, ...groupedMessages]
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setNotifications(all);
      setApiStatus(apiStatusConstants.success);
    } catch { setApiStatus(apiStatusConstants.failure); }
  };

  const handleClick = async (item) => {
    // Prevent navigation for views if not premium
    if (item.type === "view" && !isPremium) return;

    try {
      if (item.type === "message" && !item.isRead) {
        await fetch(`${BASE_URL}/messages/mark-seen/${item.user._id}`, { method: "POST", credentials: "include" });
      }
      
      setNotifications((prev) =>
        prev.map((n) => n.id === item.id ? { ...n, isRead: true, count: 0 } : n)
      );

      if (item.type === "message") navigate(`/chat/${item.user._id}`);
      else navigate(`/profile/${item.user?._id}`);
    } catch (err) { console.error(err); }
  };

  const getNotificationMeta = (type) => {
    if (type === "message") return { label: "Message", action: "sent you a message", badge: "M" };
    if (type === "request") return { label: "Connection", action: "wants to connect", badge: "C" };
    return { label: "Profile view", action: "viewed your profile", badge: "V" };
  };

  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const renderContent = () => {
    if (notifications.length === 0) {
      return (
        <div className="notification-page-container">
          <Header />
          <main className="notification-feed-layout"><EmptyView message="You're all caught up" /></main>
        </div>
      );
    }

    return (
      <div className="notification-page-container">
        <Header />
        <main className="notification-feed-layout">
          <section className="notification-feed-card">
            <div className="notification-header">
              <div>
                <p className="notification-eyebrow">Activity center</p>
                <h2 className="notification-title-text">Notifications</h2>
              </div>
              <div className="notification-summary-pill">{unreadCount} unread</div>
            </div>

            <div className="notification-items-wrapper">
              {notifications.map((item) => {
                const meta = getNotificationMeta(item.type);
                const isLocked = item.type === "view" && !isPremium;

                return (
                  <button
                    key={item.id}
                    type="button"
                    className={`notification-row-item ${!item.isRead ? "is-unread" : ""} ${isLocked ? "notification-locked-row" : ""}`}
                    onClick={() => handleClick(item)}
                  >
                    <div className="notification-avatar-box">
                      <img
                        src={isLocked ? "/avatar.png" : (item.user?.profilePic || "/avatar.png")}
                        className={`notification-profile-image ${isLocked ? "notification-blur-img" : ""}`}
                        alt="User"
                      />
                      <span className={`notification-type-badge ${item.type}`}>
                        {meta.badge}
                      </span>
                    </div>

                    <div className="notification-content-area">
                      <div className="notification-line">
                        <p className="notification-main-text">
                          <span className="user-name">
                            {isLocked ? "Someone" : item.user?.firstName}
                            {!isLocked && <PremiumVerifiedBadge user={item.user} />}
                          </span>{" "}
                          {meta.action}
                        </p>
                        <span className="notification-time">
                          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                        </span>
                      </div>

                      {item.type === "message" && item.text && (
                        <p className="message-bubble-preview">{item.text}</p>
                      )}

                      {isLocked ? (
                        <span className="notification-premium-hint">Only premium users can see visitors</span>
                      ) : (
                        <span className="notification-label">{meta.label}</span>
                      )}
                    </div>

                    {item.count > 0 && <div className="count-badge">{item.count}</div>}
                  </button>
                );
              })}
            </div>
          </section>
        </main>
      </div>
    );
  };

  switch (apiStatus) {
    case apiStatusConstants.inProgress: return <LoaderView />;
    case apiStatusConstants.failure: return <ErrorView onRetry={fetchNotifications} />;
    case apiStatusConstants.success: return renderContent();
    default: return null;
  }
};

export default Notification;