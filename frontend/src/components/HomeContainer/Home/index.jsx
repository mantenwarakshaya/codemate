import React, { Component } from "react";
import Feed from "../Feed";
import Header from "../../Header";
import ProfileCard from "../ProfileCard"; 
import "./index.css";

class Home extends Component {
  render() {
    return (
      <>
        <Header />

        <div className="home-container">
          <ProfileCard />
          {/* CENTER - FEED */}
          <div className="center-content">
            <Feed />
          </div>

          {/* RIGHT - PROFILE + STATS */}
          <div className="right-sidebar">
            <div>hi</div>
          </div>
        </div>
      </>
    );
  }
}

export default Home;