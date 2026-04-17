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
    const { requestId, fromRequestPage } = this.props.locationState || {};

    if (!user) return <EmptyView message="User not available." />;

    return (
      <div className="profile-container">
        <div className="profile-card">
          {/* LEFT COLUMN: Identity */}
          <div className="profile-sidebar">
            <div className="profile-image-container">
              <img
                src={user.profilePic || "/avatar.png"}
                alt="profile"
                className="profile-avatar"
              />
            </div>
            
            <div className="social-links-grid">
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" className="social-pill">
                  <FaGithub /> GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="social-pill">
                  <FaLinkedin /> LinkedIn
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="social-pill">
                  <FaTwitter /> Twitter
                </a>
              )}
              {user.discord && (
                <a href={user.discord} target="_blank" rel="noreferrer" className="social-pill">
                  <SiDiscord /> Discord
                </a>
              )}
            </div>
          </div>

          {/* RIGHT COLUMN: Content */}
          <div className="profile-main">
            <div className="profile-header">
              <h2 className="user-name">{user.firstName} {user.lastName}</h2>
              <div className="user-meta">
                <span className="meta-item">{user.emailId}</span>
                <span className="meta-divider">•</span>
                <span className="meta-item experience-badge">
                  {user.experience ?? 0} {user.experience === 1 ? "Year" : "Years"} Exp.
                </span>
              </div>
            </div>

            <div className="bio-section">
              <p className="bio-text">
                {user.about || "Full Stack Developer ready to collaborate."}
              </p>
            </div>

            <div className="skills-section">
              <h4 className="section-label">Technical Stack</h4>
              <div className="skills-wrapper">
                {user.skills?.map((skill, i) => (
                  <span key={i} className="skill-tag">{skill}</span>
                ))}
              </div>
            </div>

            <div className="profile-actions">
              {fromRequestPage && requestId ? (
                <div className="request-controls">
                  <button 
                    className="btn-accept" 
                    onClick={() => this.handleRequestAction("accepted")}
                    disabled={isProcessingAction}
                  >
                    <FaCheck /> {isProcessingAction ? "Processing..." : "Accept Request"}
                  </button>
                  <button 
                    className="btn-reject" 
                    onClick={() => this.handleRequestAction("rejected")}
                    disabled={isProcessingAction}
                  >
                    <FaTimes /> Reject
                  </button>
                </div>
              ) : (
                <Link to={`/chat/${user._id}`} className="message-link">
                  <button className="btn-primary">
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