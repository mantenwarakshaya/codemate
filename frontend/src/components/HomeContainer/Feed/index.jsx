import React, { Component } from "react";
import { connect } from "react-redux";
import "./index.css";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
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

class Feed extends Component {
  state = {
    feed: [],
    currentIndex: 0,
    apiStatus: apiStatusConstants.initial,
    limitError: null,
  };

  componentDidMount() {
    this.getFeed();
  }

  getFeed = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const res = await fetch(`${BASE_URL}/feed`, {
        credentials: "include",
      });

      if (!res.ok) throw new Error("Failed");

      const data = await res.json();
      let feedData = data?.data || [];

      const { user: currentUser } = this.props;

      if (currentUser && currentUser.isPremium) {
        feedData = [...feedData].sort((a, b) => {
          if (a.isPremium && !b.isPremium) return -1;
          if (!a.isPremium && b.isPremium) return 1;
          return 0;
        });
      }

      this.setState({
        feed: feedData,
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  handleSwipe = async (direction) => {
    const { currentIndex, feed } = this.state;
    if (currentIndex >= feed.length) return;

    const user = feed[currentIndex];
    const status = direction === "right" ? "interested" : "ignored";

    try {
      const res = await fetch(
        `${BASE_URL}/request/send/${status}/${user._id}`,
        {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      this.setState((prevState) => ({
        currentIndex: prevState.currentIndex + 1,
      }));

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Backend error:", errorData.message);
      }

    } catch (err) {
      console.error("Error sending request:", err);
      this.setState((prevState) => ({
        currentIndex: prevState.currentIndex + 1,
      }));
    }
  };

  renderLimitCard = () => {
    const { limitError } = this.state;
    const isAlreadyPremium = limitError?.toLowerCase().includes("premium");

    return (
      <div className="feed-container">
        <div className="feed-user-card limit-card">
          <div className="limit-card-icon-container">
            <span className="limit-card-emoji">⏳</span>
          </div>
          <h2 className="limit-card-title">Daily Limit Reached</h2>
          <p className="limit-card-message-text">{limitError}</p>
          <p className="limit-card-sub-text">
            {isAlreadyPremium 
              ? "You've exhausted your premium daily allowance. Come back tomorrow!" 
              : "Upgrade to premium to get 200 requests per day and find your match faster."}
          </p>
          <div className="limit-card-actions">
            {!isAlreadyPremium && (
              <button 
                className="limit-card-btn-upgrade" 
                onClick={() => window.location.href = "/premium"}
              >
                Upgrade to Premium
              </button>
            )}
            <button 
              className="limit-card-btn-back" 
              onClick={() => this.setState({ limitError: null })}
            >
              Back to Feed
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  renderSuccessView = () => {
    const { feed, currentIndex } = this.state;

    if (feed.length === 0 || currentIndex >= feed.length) {
      return <EmptyView message="No more users" />;
    }

    const user = feed[currentIndex];

    return (
      <div className="feed-container">
        <div className="feed-user-card">
          <div className="feed-card-header">
            <div className="feed-image-ring">
              <img 
                src={user.profilePic || "/avatar.png"} 
                alt={`${user.firstName}'s profile`} 
                className="feed-profile-img" 
              />
            </div>

            <div className="feed-user-info-text">
              <h2 className="feed-user-name">
                {user.firstName} {user.lastName}
                <PremiumVerifiedBadge user={user} />
              </h2>
              <p className="feed-user-email">{user.emailId}</p>
              <div className="feed-status-section">
                <p className="feed-section-title">Current Status: </p>
                <p className="status-badge">
                  {user.connectionStatus || "seeking opportunities"}
                </p>
              </div>
            </div>
          </div>

          <div className="wrap-tag-social">
            <div className="feed-tags">
              <span className="feed-tag">
                EXPERIENCE: {user.experience || 0}{" "}
                {user.experience === 1 ? "YEAR" : "YEARS"}
              </span>
            </div>

            <div className="feed-social-bar">
              {user.github && (
                <a 
                  className="github"
                  href={user.github} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <FaGithub size={20}/>
                </a>
              )}

              {user.linkedin && (
                <a 
                  className="linkedin"
                  href={user.linkedin} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <FaLinkedin size={20}/>
                </a>
              )}

              {user.twitter && (
                <a 
                  className="twitter"
                  href={user.twitter} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <FaTwitter size={20}/>
                </a>
              )}

              {user.discord && (
                <a 
                  className="discord"
                  href={user.discord} 
                  target="_blank" 
                  rel="noreferrer"
                >
                  <SiDiscord size={20}/>
                </a>
              )}
            </div>
          </div>

          <p className="feed-bio-box">
            {user.about ? user.about : "No bio provided"}
          </p>

          <div className="feed-roles-section">
            <p className="feed-section-title">Roles</p>
            <div className="feed-roles-container">
              {user.roles?.length > 0 ? (
                user.roles.map((role, i) => (
                  <span key={i} className="feed-role-tag">{role}</span>
                ))
              ) : (
                <span className="feed-empty-role">No roles added</span>
              )}
            </div>
          </div>
          
          <div className="feed-action-footer">
            <button className="feed-btn-ignore" onClick={() => this.handleSwipe("left")}>
              Ignore
            </button>
            <button className="feed-btn-connect" onClick={() => this.handleSwipe("right")}>
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderFeed = () => {
    const { apiStatus, limitError } = this.state;
    if (limitError) return this.renderLimitCard();

    switch (apiStatus) {
      case apiStatusConstants.inProgress: return <LoaderView />;
      case apiStatusConstants.failure: return <ErrorView message="Failed to load feed" onRetry={this.getFeed} />;
      case apiStatusConstants.success: return this.renderSuccessView();
      default: return null;
    }
  };

  render() {
    return this.renderFeed();
  }
}

const mapStateToProps = (state) => ({ user: state.user });
export default connect(mapStateToProps)(Feed);