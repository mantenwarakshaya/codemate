import React, { Component } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaCheck, FaTimes } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage } from "react-icons/md";
import "./index.css";
import Header from "../../Header";

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

class ShowProfile extends Component {
  state = {
    user: null,
    apiStatus: apiStatusConstants.initial,
    isProcessingAction: false,
  };

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = async () => {
    const { id } = this.props.params;

    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const url = id
        ? `${BASE_URL}/user/${id}`
        : `${BASE_URL}/profile/view`;

      const res = await fetch(url, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("User not found");

      const data = await res.json();

      this.setState({
        user: data?.data || data,
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        user: null,
        apiStatus: apiStatusConstants.failure,
      });
    }
  };

  handleRequestAction = async (status) => {
    const { requestId } = this.props.locationState || {};
    if (!requestId) return;

    this.setState({ isProcessingAction: true });

    try {
      const res = await fetch(
        `${BASE_URL}/request/review/${status}/${requestId}`,
        {
          method: "POST",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Action failed");

      alert(`Request ${status === "accepted" ? "Accepted" : "Rejected"}!`);
      window.location.href = "/requests";
    } catch (err) {
      alert(err.message);
      this.setState({ isProcessingAction: false });
    }
  };

  renderSuccessView = () => {
    const { user, isProcessingAction } = this.state;
    const { requestId, fromRequestPage } = this.props.locationState || {};
    const { id } = this.props.params;

    const isOwnProfile = !id;

    if (!user) return <EmptyView message="User not available." />;

    return (
      <div className="sp-profile-container">
        <div className="sp-profile-card">
          
          {/* LEFT */}
          <div className="sp-profile-sidebar">
            <div className="sp-profile-image-container">
              <img
                src={user.profilePic || "/avatar.png"}
                alt="profile"
                className="sp-profile-avatar"
              />
            </div>

            <div className="sp-social-links-grid">
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" className="sp-social-pill">
                  <FaGithub /> GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="sp-social-pill">
                  <FaLinkedin /> LinkedIn
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="sp-social-pill">
                  <FaTwitter /> Twitter
                </a>
              )}
              {user.discord && (
                <a href={user.discord} target="_blank" rel="noreferrer" className="sp-social-pill">
                  <SiDiscord /> Discord
                </a>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="sp-profile-main">
            <div className="sp-profile-header">
              <h2 className="sp-user-name">
                {user.firstName} {user.lastName}
              </h2>

              <div className="sp-user-meta">
                <span>{user.emailId}</span>
                <span className="sp-meta-divider">•</span>
                <span className="sp-experience-badge">
                  {user.experience ?? 0}{" "}
                  {user.experience === 1 ? "Year" : "Years"} Exp.
                </span>
              </div>
            </div>

            <div className="sp-bio-section">
              <p className="sp-bio-text">
                {user.about || "Full Stack Developer ready to collaborate."}
              </p>
            </div>

            <div className="sp-skills-section">
              <h4 className="sp-section-label">Technical Stack</h4>
              <div className="sp-skills-wrapper">
                {user.skills?.map((skill, i) => (
                  <span key={i} className="sp-skill-tag">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* ACTIONS */}
            <div className="sp-profile-actions">

              {isOwnProfile ? (
                <div className="sp-request-controls">
                  <Link to="/profile/edit" className="sp-message-link">
                    <button className="sp-btn-accept">✏️ Edit Profile</button>
                  </Link>

                  <Link to="/profile/password" className="sp-message-link">
                    <button className="sp-btn-reject">🔐 Change Password</button>
                  </Link>
                </div>
              ) : fromRequestPage && requestId ? (
                <div className="sp-request-controls">
                  <button
                    className="sp-btn-accept"
                    onClick={() => this.handleRequestAction("accepted")}
                    disabled={isProcessingAction}
                  >
                    <FaCheck />{" "}
                    {isProcessingAction ? "Processing..." : "Accept Request"}
                  </button>

                  <button
                    className="sp-btn-reject"
                    onClick={() => this.handleRequestAction("rejected")}
                    disabled={isProcessingAction}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              ) : (
                <Link to={`/chat/${user._id}`} className="sp-message-link">
                  <button className="sp-btn-primary">
                    <MdMessage /> Send Message
                  </button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  renderProfile = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;
      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Unable to load profile"
            onRetry={this.fetchUser}
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
        {this.renderProfile()}
      </>
    );
  }
}

const ShowProfileWithParams = (props) => {
  const params = useParams();
  const location = useLocation();
  return <ShowProfile {...props} params={params} locationState={location.state} />;
};

export default ShowProfileWithParams;