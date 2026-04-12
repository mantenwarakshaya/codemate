import React, { Component } from "react";
import { ThreeDots } from "react-loader-spinner";
import "./index.css";

class LoaderView extends Component {
  // Simple render for a stateless UI loader
  render() {
    return (
      <div className="loader-container">
        <ThreeDots height="60" width="60" color="#0967d2" visible={true} />
      </div>
    );
  }
}

export default LoaderView;