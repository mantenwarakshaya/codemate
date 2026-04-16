import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

class ConnectionCard extends Component {
  render() {
    const { user } = this.props; // navigate prop is available via the wrapper if needed

    // Safety check for user data
    if (!user) return null;

    const {
      firstName = "",
      lastName = "",
      profilePic = "", // Updated from photoUrl to profilePic
      skills = [],
      _id,
    } = user;

    const safeSkills = Array.isArray(skills) ? skills : [];

    return (
      <div className="connectioncard-card">
        <div className="connectioncard-card-left">
          {/* ✅ Wrapped Image in Link for navigation */}
          <Link to={`/profile/${_id}`} className="connectioncard-avatar-link">
            <img
              src={profilePic || "/avatar.png"} // Added fallback
              alt={`${firstName} ${lastName}`}
              className="connectioncard-profile-img"
            />
          </Link>

          <div className="connectioncard-user-info">
            <h2 className="connectioncard-user-name">
              <Link to={`/profile/${_id}`} className="connectioncard-user-link">
                {firstName} {lastName}
              </Link>
            </h2>

            <div className="connection-skills">
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

        <Link to={`/chat/${_id}`} className="connectioncard-message-btn">
          <span className="connectioncard-msg-text">Message</span>
        </Link>
      </div>
    );
  }
}

const ConnectionCardWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ConnectionCard {...props} navigate={navigate} />;
};

export default ConnectionCardWithNavigate;