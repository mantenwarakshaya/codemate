import { useEffect, useState } from "react";
import axios from "axios";
import "./index.css";
import { LoaderView, ErrorView } from "../Common";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";

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

const RightSidebar = () => {
  const [user, setUser] = useState(null);
  const [connectionsCount, setConnectionsCount] = useState(0);
  const [requestsCount, setRequestsCount] = useState(0);
  const [apiStatus, setApiStatus] = useState(apiStatusConstants.initial);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setApiStatus(apiStatusConstants.inProgress);

    try {
      const [profileRes, connectionsRes, requestsRes] = await Promise.all([
        axios.get(`${BASE_URL}/profile/view`, { withCredentials: true }),
        axios.get(`${BASE_URL}/user/connections`, { withCredentials: true }),
        axios.get(`${BASE_URL}/user/requests/received`, { withCredentials: true }),
      ]);

      setUser(profileRes.data);
      setConnectionsCount(connectionsRes.data?.data?.length || 0);
      setRequestsCount(requestsRes.data?.data?.length || 0);

      setApiStatus(apiStatusConstants.success);
    } catch (err) {
      console.error("Sidebar error:", err);
      setApiStatus(apiStatusConstants.failure);
    }
  };

  const renderContent = () => {
    if (!user) return null;

    return (
      <div className="right-sidebar">

        {/* 🔹 CARD 1: PROFILE */}
<div className="card profile-card">
  <img src={user.profilePic || "/avatar.png"} alt="profile" />
  <h4>{user.firstName} {user.lastName}</h4>
  <p>{user.emailId}</p>
</div>

        {/* 🔹 CARD 2: STATS */}
<div className="card stats-card">
  <h4>Network</h4>

  <div className="stat-item">
    <span>Connections</span>
    <strong>{connectionsCount}</strong>
  </div>

  <div className="stat-item">
    <span>Requests</span>
    <strong>{requestsCount}</strong>
  </div>
</div>

        {/* 🔹 CARD 3: LINKS */}

<div className="card social-card">
  <h4>Connect</h4>

  <div className="social-pill-grid">
    {user.github && (
      <a href={user.github} target="_blank" rel="noreferrer" className="social-button">
        <FaGithub /> GitHub
      </a>
    )}

    {user.linkedin && (
      <a href={user.linkedin} target="_blank" rel="noreferrer" className="social-button">
        <FaLinkedin /> LinkedIn
      </a>
    )}

    {user.twitter && (
      <a href={user.twitter} target="_blank" rel="noreferrer" className="social-button">
        <FaTwitter /> Twitter
      </a>
    )}

    {user.discord && (
      <a href={user.discord} target="_blank" rel="noreferrer" className="social-button">
        <SiDiscord /> Discord
      </a>
    )}

    {!user.github && !user.linkedin && !user.twitter && !user.discord && (
      <p className="no-links">No links added</p>
    )}
  </div>
</div>

      </div>
    );
  };

  switch (apiStatus) {
    case apiStatusConstants.inProgress:
      return <LoaderView />;

    case apiStatusConstants.failure:
      return (
        <ErrorView
          message="Failed to load sidebar"
          onRetry={fetchData}
        />
      );

    case apiStatusConstants.success:
      return renderContent();

    default:
      return null;
  }
};

export default RightSidebar;