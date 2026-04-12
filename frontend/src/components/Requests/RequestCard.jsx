import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./index.css";

class RequestCard extends Component {
  render() {
    // Accessing props in class component
    const { request, onAction } = this.props;
    const { fromUser } = request || {};

    // Null check for user data
    if (!fromUser) return null;

    const { firstName, lastName, photoUrl, skills = [], _id } = fromUser;

    return (
      <div className="request-card">
        <div className="request-card-left">
          <img
            src={photoUrl}
            alt={`${firstName} ${lastName}`}
            className="request-profile-img"
          />

          <div className="request-user-info">
            <h2 className="request-user-name">
              <Link to={`/profile/${_id}`} className="request-user-link">
                {firstName} {lastName}
              </Link>
            </h2>

            <div className="request-skills">
              {/* Rendering only the first 5 skills */}
              {skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="request-skill-badge">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="request-skill-more">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="request-action-buttons">
          <button
            className="request-accept-btn"
            // Invoking parent method via props
            onClick={() => onAction(request._id, "accepted")}
          >
            <span className="request-btn-text">Accept</span>
            <FaCheck className="request-btn-icon" />
          </button>

          <button
            className="request-reject-btn"
            onClick={() => onAction(request._id, "rejected")}
          >
            <span className="request-btn-text">Reject</span>
            <FaTimes className="request-btn-icon" />
          </button>
        </div>
      </div>
    );
  }
}

export default RequestCard;