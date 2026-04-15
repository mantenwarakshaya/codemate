import React, { Component } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaCheck, FaTimes } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage } from "react-icons/md";
import "./index.css";
import Header from "../Header";

import { LoaderView, ErrorView, EmptyView } from "../Common";

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
      const res = await fetch(`${BASE_URL}/user/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("User not found");
      }

      const data = await res.json();
      this.setState({
        user: data?.data || null,
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

  // Logic to handle Accept/Reject directly from the profile
  handleRequestAction = async (status) => {
    const { requestId } = this.props.locationState || {};
    if (!requestId) return;

    this.setState({ isProcessingAction: true });
    try {
      // Logic uses your requestRouter.post("/request/review/:status/:requestId")
      const res = await fetch(`${BASE_URL}/request/review/${status}/${requestId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Action failed");
      
      alert(`Request ${status === 'accepted' ? 'Accepted' : 'Rejected'}!`);
      // Redirect back to requests page after action to refresh the list
      window.location.href = "/requests"; 
    } catch (err) {
      alert(err.message);
      this.setState({ isProcessingAction: false });
    }
  };

  renderSuccessView = () => {
    const { user, isProcessingAction } = this.state;
    // requestId and fromRequestPage are passed via Link state in RequestCard
    const { requestId, fromRequestPage } = this.props.locationState || {};

    if (!user) {
      return <EmptyView message="User not available." />;
    }

    return (
      <div className="show-feed-container">
        <div className="show-user-card">
          {/* LEFT SECTION */}
          <div className="show-left">
            <div className="show-image-ring">
              <img
                src={user.profilePic || "/avatar.png"}
                alt={`${user.firstName}'s profile`}
                className="show-profile-img"
              />
            </div>

            <div className="show-social-pill-grid">
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaGithub /> GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaLinkedin /> LinkedIn
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaTwitter /> Twitter
                </a>
              )}
              {user.discord && (
                <a href={user.discord} target="_blank" rel="noreferrer" className="show-social-button">
                  <SiDiscord /> Discord
                </a>
              )}
            </div>
          </div>

          {/* RIGHT SECTION */}
          <div className="show-right">
            <h2 className="show-feed-user-name">
              {user.firstName} {user.lastName}
            </h2>

            {user.emailId && (
              <p className="show-user-email">{user.emailId}</p>
            )}

            <div className="show-tags">
              <span className="show-tag">
                Experience: {user.experience ?? 0}{" "}
                {user.experience === 1 ? "year" : "years"}
              </span>
            </div>

            <p className="show-bio-box">
              {user.about || "Full Stack Developer ready to collaborate."}
            </p>

            <div className="show-skills">
              {user.skills?.map((skill, i) => (
                <span key={i} className="show-skill">
                  {skill}
                </span>
              ))}
            </div>

            <div className="show-action-footer">
              {fromRequestPage && requestId ? (
                /* ✅ CASE 1: Came from Requests Page - Show Accept/Reject */
                <div className="show-request-actions">
                  <button 
                    className="show-accept-btn" 
                    onClick={() => this.handleRequestAction("accepted")}
                    disabled={isProcessingAction}
                  >
                    <FaCheck /> {isProcessingAction ? "..." : "Accept"}
                  </button>
                  <button 
                    className="show-reject-btn" 
                    onClick={() => this.handleRequestAction("rejected")}
                    disabled={isProcessingAction}
                  >
                    <FaTimes /> {isProcessingAction ? "..." : "Reject"}
                  </button>
                </div>
              ) : (
                /* ✅ CASE 2: Normal connection view - Show Message */
                <Link to={`/chat/${user._id}`} className="show-message-link">
                  <button className="show-icon-btn">
                    <MdMessage /> Message
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
            message="Unable to load this profile. Please try again."
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