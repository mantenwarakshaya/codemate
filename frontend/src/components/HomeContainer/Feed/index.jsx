import React, { Component } from "react";
import "./index.css";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage } from "react-icons/md";

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
      this.setState({
        feed: data?.data || [],
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
        }
      );

      if (!res.ok) throw new Error("Request failed");

      this.setState((prevState) => ({
        currentIndex: prevState.currentIndex + 1,
      }));
    } catch (err) {
      console.error("Error sending request:", err);
    }
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
          <div className="feed-image-ring">
            <img 
              src={user.profilePic || "/avatar.png"} 
              alt={`${user.firstName}'s profile`} 
              className="feed-profile-img" 
            />
          </div>

          <h2 className="feed-user-name">
            {user.firstName} {user.lastName}
            <PremiumVerifiedBadge user={user} />
          </h2>

          <p className="feed-user-email">{user.emailId}</p>

          <div className="feed-tags">
            <span className="feed-tag">
              experience : {user.experience || 0}{" "}
              {user.experience === 1 ? "year" : "years"}
            </span>
          </div>

          <div className="feed-social-bar">
            {user.github && (
              <a href={user.github} target="_blank" rel="noreferrer">
                <FaGithub size={22} className="fa-github"/>
              </a>
            )}

            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                <FaLinkedin size={22} className="fa-linkedin"/>
              </a>
            )}

            {user.twitter && (
              <a href={user.twitter} target="_blank" rel="noreferrer">
                <FaTwitter size={22} className="fa-twitter"/>
              </a>
            )}

            {user.discord && (
              <a href={user.discord} target="_blank" rel="noreferrer">
                <SiDiscord size={22} className="fa-discord"/>
              </a>
            )}
          </div>

          <p className="feed-bio-box">{user.about ? user.about : "No bio provided"}</p>

          <div className="feed-skills">
            {user.skills?.map((skill, i) => (
              <span key={i} className="feed-skill">
                {skill}
              </span>
            ))}
          </div>

          <div className="feed-action-footer">
            <button
              className="feed-btn-ignore"
              onClick={() => this.handleSwipe("left")}
            >
              Ignore
            </button>

            <button
              className="feed-btn-connect"
              onClick={() => this.handleSwipe("right")}
            >
              Connect
            </button>
          </div>
        </div>
      </div>
    );
  };

  renderFeed = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView message="Failed to load feed" onRetry={this.getFeed} />
        );

      case apiStatusConstants.success:
        return this.renderSuccessView();

      default:
        return null;
    }
  };

  render() {
    return this.renderFeed();
  }
}

export default Feed;