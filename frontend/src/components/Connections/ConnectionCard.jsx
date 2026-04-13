import React, { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./index.css";

class ConnectionCard extends Component {
  render() {
    const { user, navigate } = this.props;

    // Safety check for user data
    if (!user) return null;

    const {
      firstName = "",
      lastName = "",
      photoUrl = "",
      skills = [],
      _id,
    } = user;

    const safeSkills = Array.isArray(skills) ? skills : [];

    return (
      <div className="connection-card">
        <div className="connection-card-left">
          <img
            src={photoUrl || "https://via.placeholder.com/75"}
            // Fallback for broken image URLs
            onError={(e) => (e.target.src = "https://via.placeholder.com/75")}
            alt={`${firstName} ${lastName}`}
            className="connection-profile-img"
          />

          <div className="connection-user-info">
            <h2 className="connection-user-name">
              <Link to={`/profile/${_id}`} className="connection-user-link">
                {firstName || lastName
                  ? `${firstName} ${lastName}`
                  : "Unknown User"}
              </Link>
            </h2>

            <div className="connection-skills">
              {/* Render only first 5 skills for UI cleanliness */}
              {safeSkills.slice(0, 5).map((skill, index) => (
                <span key={index} className="connection-skill-badge">
                  {skill}
                </span>
              ))}
              {safeSkills.length > 5 && (
                <span className="connection-skill-more">
                  +{safeSkills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        
        <Link to={`/chat/${_id}`} className="connection-message-btn">
          <span className="connection-msg-text">Message</span>
        </Link>
      </div>
    );
  }
}

// Wrapper to inject navigate hook into the class component
const ConnectionCardWithNavigate = (props) => {
  const navigate = useNavigate();
  return <ConnectionCard {...props} navigate={navigate} />;
};

export default ConnectionCardWithNavigate;