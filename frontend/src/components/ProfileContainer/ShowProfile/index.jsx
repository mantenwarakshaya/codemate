import React, { Component } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaCheck, FaTimes } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage } from "react-icons/md";
import "./index.css";
import Header from "../../Header";

import { LoaderView, ErrorView, EmptyView, PremiumVerifiedBadge } from "../../Common";

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
    deletePassword: "",
    isDeleting: false,
    showConfirm: false,
    // New state for UI feedback
    statusMessage: "",
    messageType: "" 
  };

  componentDidMount() {
    this.fetchUser();
  }

  fetchUser = async () => {
    const { id } = this.props.params;
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const url = id ? `${BASE_URL}/user/${id}` : `${BASE_URL}/profile/view`;
      const res = await fetch(url, { method: "GET", credentials: "include" });
      if (!res.ok) throw new Error("User not found");
      const data = await res.json();
      this.setState({ user: data?.data || data, apiStatus: apiStatusConstants.success });
    } catch (err) {
      console.error(err);
      this.setState({ user: null, apiStatus: apiStatusConstants.failure });
    }
  };

  // New Method
  handleRemoveConnection = async () => {
    const { user } = this.state;
    if (!window.confirm(`Remove ${user.firstName} from your connections?`)) return;

    this.setState({ isProcessingAction: true, statusMessage: "Removing..." });

    try {
      const res = await fetch(`${BASE_URL}/connection/remove/${user._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        this.setState({ statusMessage: "Connection Removed!", messageType: "success" });
        setTimeout(() => { window.location.href = "/connections"; }, 1500);
      } else {
        this.setState({ isProcessingAction: false, statusMessage: "Action Failed", messageType: "error" });
      }
    } catch (err) {
      this.setState({ isProcessingAction: false, statusMessage: "Error occurred", messageType: "error" });
    }
  };

  handleRequestAction = async (status) => {
    const { requestId } = this.props.locationState || {};
    if (!requestId) return;

    this.setState({ isProcessingAction: true });

    try {
      const res = await fetch(`${BASE_URL}/request/review/${status}/${requestId}`, {
        method: "POST",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Action failed");
      
      this.setState({ statusMessage: `Request ${status}!`, messageType: "success" });
      setTimeout(() => { window.location.href = "/requests"; }, 1500);
    } catch (err) {
      alert(err.message);
      this.setState({ isProcessingAction: false });
    }
  };

  handleDeleteAccount = async () => {
    const { deletePassword } = this.state;
    if (!deletePassword) { alert("Please enter password"); return; }

    this.setState({ isDeleting: true });

    try {
      const res = await fetch(`${BASE_URL}/delete-account`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ password: deletePassword }),
      });

      const data = await res.text();
      if (res.ok) {
        alert(data);
        window.location.href = "/login"; 
      } else {
        alert(data);
        this.setState({ isDeleting: false });
      }
    } catch (err) {
      alert("Something went wrong");
      this.setState({ isDeleting: false });
    }
  };

  renderSuccessView = () => {
    const { user, isProcessingAction, statusMessage, messageType } = this.state;
    const { requestId, fromRequestPage } = this.props.locationState || {};
    const { id } = this.props.params;
    const isOwnProfile = !id;

    if (!user) return <EmptyView message="User not available." />;

    return (
      <div className="sp-profile-container">
        <div className="sp-profile-card">
          {/* Sidebar and Main content remains exactly as your original */}
          <div className="sp-profile-sidebar">
            <div className="sp-profile-image-container">
              <img src={user.profilePic || "/avatar.png"} alt="profile" className="sp-profile-avatar" />
            </div>
            <div className="sp-social-links-grid">
              {user.github && <a href={user.github} target="_blank" rel="noreferrer" className="sp-social-pill"><FaGithub /> GitHub</a>}
              {user.linkedin && <a href={user.linkedin} target="_blank" rel="noreferrer" className="sp-social-pill"><FaLinkedin /> LinkedIn</a>}
              {user.twitter && <a href={user.twitter} target="_blank" rel="noreferrer" className="sp-social-pill"><FaTwitter /> Twitter</a>}
              {user.discord && <a href={user.discord} target="_blank" rel="noreferrer" className="sp-social-pill"><SiDiscord /> Discord</a>}
            </div>
          </div>

          <div className="sp-profile-main">
            <div className="sp-profile-header">
              <h2 className="sp-user-name">{user.firstName} {user.lastName} <PremiumVerifiedBadge user={user} /></h2>
              <div className="sp-user-meta">
                <span>{user.emailId}</span>
                <span className="sp-meta-divider">•</span>
                <span className="sp-experience-badge">{user.experience ?? 0} {user.experience === 1 ? "Year" : "Years"} Exp.</span>
              </div>
            </div>

            <div className="sp-bio-section">
              <p className="sp-bio-text">{user.about || "Full Stack Developer ready to collaborate."}</p>
            </div>

            <div className="sp-skills-section">
              <h4 className="sp-section-label">Technical Stack</h4>
              <div className="sp-skills-wrapper">
                {user.skills?.map((skill, i) => <span key={i} className="sp-skill-tag">{skill}</span>)}
              </div>
            </div>

            <div className="sp-profile-actions">
              {/* If there is a status message, show it instead of buttons */}
              {statusMessage ? (
                <div className={`sp-status-feedback sp-status-${messageType}`}>
                   {statusMessage}
                </div>
              ) : isOwnProfile ? (
                <>
                  <div className="sp-request-controls">
                    <Link to="/profile/edit" className="sp-message-link"><button className="sp-btn-accept">✏️ Edit Profile</button></Link>
                    <Link to="/profile/password" className="sp-message-link"><button className="sp-btn-reject">🔐 Change Password</button></Link>
                  </div>
                  <div className="sp-danger-zone">
                    <h4>Danger Zone</h4>
                    <p>Deleting your account will deactivate it for 7 days.</p>
                    {!this.state.showConfirm ? (
                      <button className="sp-danger-btn" onClick={() => this.setState({ showConfirm: true })}>Delete Account</button>
                    ) : (
                      <div className="sp-danger-confirm">
                        <p className="sp-warning-text">⚠️ Please confirm your password to continue</p>
                        <input type="password" placeholder="Enter password" className="sp-danger-input" value={this.state.deletePassword} onChange={(e) => this.setState({ deletePassword: e.target.value })} />
                        <div className="sp-danger-actions">
                          <button className="sp-cancel-btn" onClick={() => this.setState({ showConfirm: false, deletePassword: "" })}>Cancel</button>
                          <button className="sp-danger-btn" onClick={this.handleDeleteAccount} disabled={this.state.isDeleting}>{this.state.isDeleting ? "Deleting..." : "Confirm Delete"}</button>
                        </div>
                      </div>
                    )}
                  </div>
                </>                
              ) : fromRequestPage && requestId ? (
                <div className="sp-request-controls">
                  <button className="sp-btn-accept" onClick={() => this.handleRequestAction("accepted")} disabled={isProcessingAction}><FaCheck /> {isProcessingAction ? "Processing..." : "Accept"}</button>
                  <button className="sp-btn-reject" onClick={() => this.handleRequestAction("rejected")} disabled={isProcessingAction}><FaTimes /> Reject</button>
                </div>
              ) : (
                <div className="sp-request-controls">
                  <Link to={`/chat/${user._id}`} className="sp-message-link">
                    <button className="sp-btn-primary"><MdMessage /> Send Message</button>
                  </Link>
                  <button className="sp-btn-reject" onClick={this.handleRemoveConnection}>
                    <FaTimes /> Remove Connection
                  </button>
                </div>
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
      case apiStatusConstants.inProgress: return <LoaderView />;
      case apiStatusConstants.failure: return <ErrorView message="Unable to load profile" onRetry={this.fetchUser} />;
      case apiStatusConstants.success: return this.renderSuccessView();
      default: return null;
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