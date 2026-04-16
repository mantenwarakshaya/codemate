import React, { Component } from "react";
import Feed from "../Feed";
import Header from "../Header";
import ConnectionsChatList from "../ConnectionsChatList"; // 👈 left sidebar
import ProfileCard from "../ProfileCard"; // 👈 create this next
import "./index.css";

class Home extends Component {
  render() {
    return (
      <>
        <Header />

        <div className="home-container">
          {/* LEFT - CHAT */}
          <div className="left-sidebar">
            <ConnectionsChatList />
          </div>

          {/* CENTER - FEED */}
          <div className="center-content">
            <Feed />
          </div>

          {/* RIGHT - PROFILE + STATS */}
          <div className="right-sidebar">
            <ProfileCard />
          </div>
        </div>
      </>
    );
  }
}

export default Home;