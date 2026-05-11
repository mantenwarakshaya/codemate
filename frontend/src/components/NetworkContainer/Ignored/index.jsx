import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import IgnoredCard from "./IgnoredCard";
import "./index.css";

import { LoaderView, ErrorView, EmptyView } from "../../Common";

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

class Ignored extends Component {
  state = {
    ignoredList: [],
    apiStatus: apiStatusConstants.initial,
  };

  componentDidMount() {
    this.fetchIgnoredProfiles();
  }

  // 1. FETCH DATA
  fetchIgnoredProfiles = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const res = await fetch(`${BASE_URL}/user/requests/ignored`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch ignored profiles");

      const data = await res.json();

      const formattedData = (data.data || []).map((req) => ({
        _id: req._id,
        toUser: req.toUserId, 
      }));

      this.setState({
        ignoredList: formattedData,
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error("Error fetching ignored list:", err);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  // 2. RESTORE LOGIC (Deletes the record so it returns to the feed)
  handleRestore = async (requestId) => {
    try {
      const res = await fetch(
        `${BASE_URL}/request/restore/${requestId}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Failed to restore profile");

      // Updates UI state immediately
      this.setState((prevState) => ({
        ignoredList: prevState.ignoredList.filter((req) => req._id !== requestId),
      }));
    } catch (err) {
      console.error("Error restoring profile:", err);
    }
  };

  renderSuccessView = () => {
    const { ignoredList } = this.state;
    const { navigate } = this.props; 

    if (ignoredList.length === 0) {
      return (
        <EmptyView
          message="No ignored profiles."
          actionText="Explore Feed"
          onAction={() => navigate("/")}
        />
      );
    }

    return (
      <div className="ignored-content-wrapper">
        <div className="ignored-header">
          <h1 className="ignored-title">Ignored Profiles</h1>
          <span className="ignored-badge">{ignoredList.length}</span>
        </div>

        {ignoredList.map((item) => (
          <IgnoredCard
            key={item._id}
            item={item}
            onRestore={this.handleRestore}
          />
        ))}
      </div>
    );
  };

  render() {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;
      case apiStatusConstants.failure:
        return <ErrorView message="Failed to load list" onRetry={this.fetchIgnoredProfiles} />;
      case apiStatusConstants.success:
        return this.renderSuccessView();
      default:
        return null;
    }
  }
}

const IgnoredWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Ignored {...props} navigate={navigate} />;
};

export default IgnoredWithNavigate;