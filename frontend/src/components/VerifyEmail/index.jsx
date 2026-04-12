import React, { Component } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { LoaderView, ErrorView } from "../Common";
import "./index.css";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "";

class VerifyEmail extends Component {
  // Initialize state replacing useState hooks
  state = {
    status: "loading",
    message: "Verifying your email...",
  };

  // Replaces useEffect; triggers the verification logic on mount
  componentDidMount() {
    this.verifyEmail();
  }

  verifyEmail = async () => {
    const { searchParams, navigate } = this.props;
    const token = searchParams.get("token");

    if (!token) {
      this.setState({ status: "error", message: "Invalid verification link" });
      return;
    }

    try {
      const res = await fetch(
        `${BASE_URL}/verify-email?token=${token}`
      );

      const data = await res.text();

      if (res.ok) {
        this.setState({
          status: "success",
          message: "Email verified successfully!",
        });

        // Delay navigation to show success message
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        this.setState({
          status: "error",
          message: data || "Invalid or expired link",
        });
      }
    } catch (error) {
      this.setState({
        status: "error",
        message: "Server error. Please try again.",
      });
    }
  };

  render() {
    const { status, message } = this.state;

    // 🔥 RENDER STATES
    if (status === "loading") {
      return (
        <div className="verify-email-container">
          <LoaderView />
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="verify-email-container">
          <ErrorView message={message} />
        </div>
      );
    }

    return (
      <div className="verify-email-container">
        <div className="verify-email-card">
          <h2 className="verify-email-text success-text">{message}</h2>
          <p className="verify-email-subtext">Redirecting to login...</p>
        </div>
      </div>
    );
  }
}

// Wrapper to inject hooks into the class component via props
const VerifyEmailWithHooks = (props) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  return (
    <VerifyEmail
      {...props}
      searchParams={searchParams}
      navigate={navigate}
    />
  );
};

export default VerifyEmailWithHooks;