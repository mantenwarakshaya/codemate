import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import ConnectionCard from "./ConnectionCard";
import Header from "../Header";
import "./index.css";
import { LoaderView, ErrorView, EmptyView } from "../Common";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";
    
const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

class Connections extends Component {
  // Initialize state equivalent to useState hooks
  state = {
    connections: [],
    apiStatus: apiStatusConstants.initial,
  };

  // Replaces useEffect with empty dependency array
  componentDidMount() {
    this.fetchConnections();
  }

  fetchConnections = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const res = await fetch(`${BASE_URL}/user/connections`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed to fetch connections");

      const result = await res.json();

      this.setState({
        connections: Array.isArray(result?.data) ? result.data : [],
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error("Error fetching connections:", err);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  renderSuccessView = () => {
    const { connections } = this.state;
    const { navigate } = this.props; // Accessing navigate from props via HOC

    if (connections.length === 0) {
      return (
        <EmptyView
          message="No connections found."
          actionText="Explore Feed"
          onAction={() => navigate("/")}
        />
      );
    }

    return (
      <div className="content-wrapper">
        <div className="header">
          <h1 className="title">My Connections</h1>
          <span className="badge">{connections.length}</span>
        </div>

        {connections.map((user) =>
          user && user._id ? <ConnectionCard key={user._id} user={user} /> : null
        )}
      </div>
    );
  };

  renderConnections = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Something went wrong."
            onRetry={this.fetchConnections}
          />
        );

      case apiStatusConstants.success:
        return this.renderSuccessView();

      default:
        return null;
    }
  };

  render() {
    return (
      <>
        <Header />
        <div className="page-container">{this.renderConnections()}</div>
      </>
    );
  }
}

// HOC Wrapper to allow use of useNavigate hook in a class component
const ConnectionsWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Connections {...props} navigate={navigate} />;
};

export default ConnectionsWithNavigate;