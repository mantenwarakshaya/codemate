import React, { Component } from "react";
import { useParams } from "react-router-dom";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import { SiDiscord } from "react-icons/si";
import { MdMessage } from "react-icons/md";
import "./index.css";
import Header from "../Header";

import { LoaderView, ErrorView, EmptyView } from "../Common";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";
    
const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

class ShowProfile extends Component {
  // Initialize state replacing useState hooks
  state = {
    user: null,
    apiStatus: apiStatusConstants.initial,
  };

  // Replaces useEffect with [id] dependency
  componentDidMount() {
    this.fetchUser();
  }

  // Handle API call
  fetchUser = async () => {
    const { id } = this.props.params; // Accessing id from HOC props
    this.setState({ apiStatus: apiStatusConstants.inProgress });

    try {
      const res = await fetch(`${BASE_URL}/user/${id}`, {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("User not found");
      }

      const data = await res.json();
      this.setState({
        user: data?.data || null,
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({
        user: null,
        apiStatus: apiStatusConstants.failure,
      });
    }
  };

  // 🟢 SUCCESS VIEW
  renderSuccessView = () => {
    const { user } = this.state;
    if (!user) {
      return <EmptyView message="User not available." />;
    }

    return (
      <div className="show-feed-container">
        <div className="show-user-card">
          {/* LEFT */}
          <div className="show-left">
            <div className="show-image-ring">
              <img
                src={user.photoUrl || "https://via.placeholder.com/150"}
                alt="profile"
                className="show-profile-img"
              />
            </div>

            <div className="show-social-pill-grid">
              {user.github && (
                <a href={user.github} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaGithub /> GitHub
                </a>
              )}
              {user.linkedin && (
                <a href={user.linkedin} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaLinkedin /> LinkedIn
                </a>
              )}
              {user.twitter && (
                <a href={user.twitter} target="_blank" rel="noreferrer" className="show-social-button">
                  <FaTwitter /> Twitter
                </a>
              )}
              {user.discord && (
                <a href={user.discord} target="_blank" rel="noreferrer" className="show-social-button">
                  <SiDiscord /> Discord
                </a>
              )}
            </div>
          </div>

          {/* RIGHT */}
          <div className="show-right">
            <h2 className="show-feed-user-name">
              {user.firstName} {user.lastName}
            </h2>

            {user.emailId && (
              <p className="show-user-email">{user.emailId}</p>
            )}

            <div className="show-tags">
              <span className="show-tag">
                Experience: {user.experience ?? 0}{" "}
                {user.experience === 1 ? "year" : "years"}
              </span>
            </div>

            <p className="show-bio-box">
              {user.about || "Full Stack Developer ready to collaborate."}
            </p>

            <div className="show-skills">
              {user.skills?.map((skill, i) => (
                <span key={i} className="show-skill">
                  {skill}
                </span>
              ))}
            </div>

            <div className="show-action-footer">
              <button className="show-icon-btn">
                <MdMessage /> Message
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // 🎯 MAIN SWITCH
  renderProfile = () => {
    const { apiStatus } = this.state;

    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView
            message="Unable to load this profile. Please try again."
            onRetry={this.fetchUser}
          />
        );

      case apiStatusConstants.success:
        return this.renderSuccessView();

      default:
        return null;
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

// Higher-Order Component to inject useParams into class component
const ShowProfileWithParams = (props) => {
  const params = useParams();
  return <ShowProfile {...props} params={params} />;
};

export default ShowProfileWithParams;