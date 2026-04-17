import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import "./index.css";

class RequestCard extends Component {
  render() {
    const { request, onAction } = this.props;
    const { fromUser } = request || {};

    if (!fromUser) return null;

    const { firstName, lastName, profilePic, skills = [], _id } = fromUser;

    return (
      <div className="requestcard-card">
        <div className="requestcard-card-left">
          <Link 
            to={`/profile/${_id}`} 
            state={{ requestId: request._id, fromRequestPage: true }}
            className="requestcard-avatar-link"
          >
            <img
              src={profilePic || "/avatar.png"}
              alt={`${firstName} ${lastName}`}
              className="requestcard-profile-img"
            />
          </Link>

          <div className="requestcard-user-info">
            <h2 className="requestcard-user-name">
              <Link 
                to={`/profile/${_id}`} 
                state={{ requestId: request._id, fromRequestPage: true }} 
                className="requestcard-user-link"
              >
                {firstName} {lastName}
              </Link>
            </h2>

            <div className="requestcard-skills">
              {/* Rendering only the first 5 skills */}
              {skills.slice(0, 5).map((skill, index) => (
                <span key={index} className="requestcard-skill-badge">
                  {skill}
                </span>
              ))}
              {skills.length > 5 && (
                <span className="requestcard-skill-more">
                  +{skills.length - 5} more
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="requestcard-action-buttons">
          <button
            className="requestcard-accept-btn"
            onClick={() => onAction(request._id, "accepted")}
          >
            <span className="requestcard-btn-text">Accept</span>
            <FaCheck className="requestcard-btn-icon" />
          </button>

          <button
            className="requestcard-reject-btn"
            onClick={() => onAction(request._id, "rejected")}
          >
            <span className="requestcard-btn-text">Reject</span>
            <FaTimes className="requestcard-btn-icon" />
          </button>
        </div>
      </div>
    );
  }
}

export default RequestCard;