import React, { Component } from "react";
import { useParams, useLocation, Link } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter, FaCheck, FaTimes } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage, MdWork, MdHandshake } from "react-icons/md";
import "./index.css";
import Header from "../../Header";

import { LoaderView, ErrorView, EmptyView, PremiumVerifiedBadge } from "../../Common";

const BASE_URL = "/api";

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
          <div className="sp-profile-sidebar">
            <div className="sp-profile-image-container">
              <img src={user.profilePic || "/avatar.png"} alt="profile" className="sp-profile-avatar" />
            </div>
            
            {/* Status Indicator */}
            <div className="sp-status-indicator">
               <MdHandshake /> {user.connectionStatus || "Networking"}
            </div>

          <div className="sp-social-links-grid">

            {user.github && (
              <a 
                href={user.github} 
                target="_blank" 
                rel="noreferrer" 
                className="sp-social-pill github"
              >
                <FaGithub /> GitHub
              </a>
            )}

            {user.linkedin && (
              <a 
                href={user.linkedin} 
                target="_blank" 
                rel="noreferrer" 
                className="sp-social-pill linkedin"
              >
                <FaLinkedin /> LinkedIn
              </a>
            )}

            {user.twitter && (
              <a 
                href={user.twitter} 
                target="_blank" 
                rel="noreferrer" 
                className="sp-social-pill twitter"
              >
                <FaTwitter /> Twitter
              </a>
            )}

            {user.discord && (
              <a 
                href={user.discord} 
                target="_blank" 
                rel="noreferrer" 
                className="sp-social-pill discord"
              >
                <SiDiscord /> Discord
              </a>
            )}

          </div>
          </div>

          <div className="sp-profile-main">
            
            <div className="sp-profile-header">
                <h2 className="sp-user-name">
                  {user.firstName} {user.lastName} 
                  <PremiumVerifiedBadge user={user} />
                </h2>
                <div className="sp-user-meta">
                  <span>{user.emailId}</span>
                  <span className="sp-meta-divider">•</span>
                  <span className="sp-experience-badge">
                    <MdWork style={{marginBottom: '-2px'}}/> {user.experience ?? 0} Years Experience
                  </span>
                </div>
            </div>

            <div className="sp-focus-container">
                <span className="sp-focus-label">Current Focus:</span>
                <span className={`sp-focus-value sp-focus-type-${user.connectionStatus?.replace(/\s+/g, '-')}`}>
                  <MdHandshake size={16} />
                  {user.connectionStatus || "Networking"}
                </span>
            </div>

            <div className="sp-bio-section">
              <p className="sp-bio-text">{user.about || "Professional developer ready to collaborate."}</p>
            </div>

            {/* Replaced Technical Stack with Professional Roles */}
            <div className="sp-roles-section">
              <h4 className="sp-section-label">Professional Roles</h4>
              <div className="sp-roles-wrapper">
                {user.roles && user.roles.length > 0 ? (
                  user.roles.map((role, i) => <span key={i} className="sp-role-tag">{role}</span>)
                ) : (
                  <span className="sp-no-data">No roles specified</span>
                )}
              </div>
            </div>

            <div className="sp-profile-actions">
              {/* ... (Actions logic stays exactly the same as your previous code) ... */}
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
                    <h4>⚠️ Danger Zone</h4>
                    <div className="sp-danger-warning">
                      <p className="sp-danger-title">Account Deactivation</p>
                      <p className="sp-danger-description">Deleting your account will deactivate it for 7 days. During this period, your profile will be hidden and you can restore your account by logging back in. After 7 days, your account and all associated data will be permanently deleted.</p>
                    </div>
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
                    <button className="sp-btn-primary"><MdMessage /> Message</button>
                  </Link>
                  <button className="sp-btn-reject" onClick={this.handleRemoveConnection}>
                    <FaTimes /> Remove
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  // ... (renderProfile and render stay the same)
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