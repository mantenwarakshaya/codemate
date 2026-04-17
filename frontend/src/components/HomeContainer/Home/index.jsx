import React, { Component } from "react";
import Feed from "../Feed";
import Header from "../../Header";
import LeftSidebar from "../LeftSidebar"; 
import RightSidebar from "../RightSidebar";
import "./index.css";

class Home extends Component {
  render() {
    return (
      <div className="page-wrapper">
        <Header />
        <main className="home-container main-content-area">
          {/* LEFT */}
          <aside className="left-sidebar-wrapper">
            <LeftSidebar />
          </aside>

          {/* CENTER */}
          <section className="center-content">
            <Feed />
          </section>

          {/* RIGHT */}
          <aside className="right-sidebar-wrapper">
            <RightSidebar />
          </aside>
        </main>
      </div>
    );
  }
}

export default Home;