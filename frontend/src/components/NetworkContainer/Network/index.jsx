import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import Header from "../../Header";
import Connections from "../Connections";
import Requests from "../Requests";
import "./index.css";

const Network = () => {
  const location = useLocation();
  const dispatch = useDispatch();
  
  const user = useSelector((store) => store.user);

  const membershipExpiresAt = user?.membershipExpiresAt?.$date || user?.membershipExpiresAt;
  
  const isPremiumActive =
    user?.isPremium === true &&
    membershipExpiresAt &&
    new Date(membershipExpiresAt).getTime() > Date.now();

  const initialTab = location.state?.activeTab || "requests";
  const [activeTab, setActiveTab] = useState(initialTab);

  useEffect(() => {
    if (location.state?.activeTab) {
      setActiveTab(location.state.activeTab);
    }
  }, [location.state]);

  return (
    <div className="network-page-wrapper">
      <Header />
      
      <div className="network-container">
        {/* TABS NAVIGATION */}
        <div className="tabs-navigation-card">
          <div className="tabs-header">
            <button
              type="button"
              className={`tab-btn ${activeTab === "requests" ? "active" : ""}`}
              onClick={() => setActiveTab("requests")}
            >
              Requests
            </button>
            <button
              type="button"
              className={`tab-btn ${activeTab === "connections" ? "active" : ""}`}
              onClick={() => setActiveTab("connections")}
            >
              Connections
            </button>
          </div>

          {/* DYNAMIC CONTENT AREA */}
          <div className="tab-content-area">
            {activeTab === "requests" && <Requests />}
            {activeTab === "connections" && <Connections />}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;