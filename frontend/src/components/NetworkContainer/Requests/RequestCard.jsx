import React, { Component } from "react";
import { Link } from "react-router-dom";
import { FaCheck, FaTimes } from "react-icons/fa";
import { PremiumVerifiedBadge } from "../../Common";
import "./index.css";

class RequestCard extends Component {
  render() {
    const { request, onAction } = this.props;
    const { fromUser } = request || {};

    if (!fromUser) return null;

    const { 
      firstName, 
      lastName, 
      profilePic, 
      roles = [], 
      connectionStatus = "", 
      _id 
    } = fromUser;

    const safeRoles = Array.isArray(roles) ? roles : [];

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
              <PremiumVerifiedBadge user={fromUser} />
            </h2>

            {connectionStatus && (
              <span className="requestcard-status-label">
                {connectionStatus}
              </span>
            )}

            {/* Roles logic replacing skills */}
            <div className="requestcard-roles">
              {safeRoles.map((role, index) => (
                <span key={index} className="requestcard-role-badge">
                  {role}
                </span>
              ))}
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