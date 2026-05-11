import React from "react";
import { Link } from "react-router-dom";
import { FaUndo } from "react-icons/fa";
// Importing the badge and other common components
import { PremiumVerifiedBadge } from "../../Common";

const IgnoredCard = ({ item, onRestore }) => {
  const { toUser } = item || {};
  
  if (!toUser) return null;

  const { firstName, lastName, profilePic, skills = [], _id } = toUser;

  return (
    <div className="ignoredcard-card">
      <div className="ignoredcard-card-left">
        <Link to={`/profile/${_id}`} className="ignoredcard-avatar-link">
          <img
            src={profilePic || "/avatar.png"}
            alt={`${firstName} ${lastName}`}
            className="ignoredcard-profile-img"
          />
        </Link>

        <div className="ignoredcard-user-info">
          <h2 className="ignoredcard-user-name">
            <Link to={`/profile/${_id}`} className="ignoredcard-user-link">
              {firstName} {lastName}
            </Link>
            {/* Including the Premium Badge here */}
            <PremiumVerifiedBadge user={toUser} />
          </h2>
          
          <div className="ignoredcard-skills">
            {skills.slice(0, 3).map((skill, index) => (
              <span key={index} className="ignoredcard-skill-badge">
                {skill}
              </span>
            ))}
            {skills.length > 3 && (
              <span className="ignoredcard-skill-more">
                +{skills.length - 3}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="ignoredcard-action-buttons">
        <button
          type="button"
          className="ignoredcard-restore-btn" 
          onClick={() => onRestore(item._id)}
        >
          <span className="ignoredcard-btn-text">Restore to Feed</span>
          <FaUndo className="ignoredcard-btn-icon" />
        </button>
      </div>
    </div>
  );
};

export default IgnoredCard;