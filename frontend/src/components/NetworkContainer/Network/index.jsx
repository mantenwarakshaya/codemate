import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Header from "../../Header";
import Connections from "../Connections";
import Requests from "../Requests";
import "./index.css";

const Network = () => {
  const location = useLocation();
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
            {activeTab === "requests" ? (
              <Requests />
            ) : (
              <Connections />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Network;