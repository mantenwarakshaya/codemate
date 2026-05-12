import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import { PremiumVerifiedBadge } from "../../Common";
import "./index.css";

const BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

class ConnectionCard extends Component {
  state = {
    isRemoving: false,
    statusMessage: "",
    showConfirm: false // New state for custom UI confirmation
  };

  // Toggle confirmation view
  toggleConfirm = () => {
    this.setState((prevState) => ({ 
        showConfirm: !prevState.showConfirm,
        statusMessage: "" 
    }));
  };

  handleRemove = async () => {
    const { user } = this.props;
    
    // Switch from "Confirm?" UI to "Removing..." UI
    this.setState({ isRemoving: true, statusMessage: "Removing...", showConfirm: false });

    try {
      const res = await fetch(`${BASE_URL}/connection/remove/${user._id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (res.ok) {
        this.setState({ statusMessage: "Removed!" });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        this.setState({ isRemoving: false, statusMessage: "Failed to remove" });
      }
    } catch (err) {
      console.error("Error removing connection:", err);
      this.setState({ isRemoving: false, statusMessage: "Error occurred" });
    }
  };

  render() {
    const { user } = this.props; 
    const { isRemoving, statusMessage, showConfirm } = this.state;
    
    if (!user) return null;

    const {
      firstName = "",
      lastName = "",
      profilePic = "", 
      skills = [],
      _id,
    } = user;

    const safeSkills = Array.isArray(skills) ? skills : [];

    return (
      <div className="connectioncard-card">
        <div className="connectioncard-card-left">
          <Link to={`/profile/${_id}`} className="connectioncard-avatar-link">
            <img
              src={profilePic || "/avatar.png"} 
              alt={`${firstName} ${lastName}`}
              className="connectioncard-profile-img"
            />
          </Link>

          <div className="connectioncard-user-info">
            <h2 className="connectioncard-user-name">
              <Link to={`/profile/${_id}`} className="connectioncard-user-link">
                {firstName} {lastName}
              </Link>
              <PremiumVerifiedBadge user={user} />
            </h2>

            <div className="connectioncard-skills">
              {safeSkills.slice(0, 5).map((skill, index) => (
                <span key={index} className="connectioncard-skill-badge">
                  {skill}
                </span>
              ))}
              {safeSkills.length > 5 && (
                <span className="connectioncard-skill-more">
                  +{safeSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="connectioncard-actions">
          {/* FLOW: Status Message -> Confirmation Prompt -> Default Buttons */}
          {statusMessage ? (
            <span className={`status-message ${statusMessage.toLowerCase().replace(" ", "-")}`}>
              {statusMessage}
            </span>
          ) : showConfirm ? (
            <div className="connectioncard-confirm-box">
              <span className="confirm-text">Are you sure?</span>
              <button 
                onClick={this.handleRemove} 
                className="confirm-btn-yes"
              >
                Yes
              </button>
              <button 
                onClick={this.toggleConfirm} 
                className="confirm-btn-no"
              >
                No
              </button>
            </div>
          ) : (
            <>
              <Link to={`/chat/${_id}`} className="connectioncard-message-btn">
                <span className="connectioncard-msg-text">Message</span>
              </Link>
              <button 
                onClick={this.toggleConfirm} 
                className="connectioncard-remove-btn"
                disabled={isRemoving}
              >
                Remove
              </button>
            </>
          )}
        </div>
      </div>
    );
  }
}

const ConnectionCardWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ConnectionCard {...props} navigate={navigate} />;
};

export default ConnectionCardWithNavigate;