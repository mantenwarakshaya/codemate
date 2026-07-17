import { Component } from "react";
import { Link } from "react-router-dom";
import "./index.css";
import navlogo from "../../../assets/navlogo.png";

const BASE_URL = "/api";

class VerifyEmail extends Component {
  state = {
    status: "LOADING",
    message: "",
  };

  componentDidMount() {
    this.verifyEmail();
  }

  verifyEmail = async () => {
    const token = window.location.pathname.split("/").pop();

    try {
      const response = await fetch(`${BASE_URL}/verify-email/${token}`);
      const data = await response.text();

      if (response.ok) {
        this.setState({ status: "SUCCESS", message: data });
      } else {
        this.setState({ status: "FAILURE", message: data });
      }
    } catch (err) {
      this.setState({
        status: "FAILURE",
        message: "Something went wrong",
      });
    }
  };

  render() {
    const { status, message } = this.state;

    return (
      <div className="ve-main">
        <div className="ve-card">
          <img
            src={navlogo}
            alt="logo"
            className="ve-logo"
          />

          {status === "LOADING" && (
            <>
              <h2 className="ve-title">Verifying your email...</h2>
              <p className="ve-subtitle">Please wait a moment</p>
            </>
          )}

          {status === "SUCCESS" && (
            <>
              <h2 className="ve-title success">Email verified</h2>
              <p className="ve-subtitle">{message}</p>

              <Link to="/login" className="ve-btn">
                Go to Login
              </Link>
            </>
          )}

          {status === "FAILURE" && (
            <>
              <h2 className="ve-title error">Verification failed</h2>
              <p className="ve-subtitle">{message}</p>

              <Link to="/signup" className="ve-link">
                Create a new account
              </Link>
            </>
          )}
        </div>
      </div>
    );
  }
}

export default VerifyEmail;