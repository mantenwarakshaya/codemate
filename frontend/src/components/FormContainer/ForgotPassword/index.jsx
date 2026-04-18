import { useState } from "react";
import "./index.css";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

const ForgotPassword = () => {
  const [emailId, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const res = await fetch(`${BASE_URL}/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId }),
      });

      const data = await res.text();

      if (!res.ok) {
        setIsError(true);
      }

      setMessage(data);
    } catch (err) {
      setIsError(true);
      setMessage("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fp-container">
      <form className="fp-card" onSubmit={handleSubmit}>
        <h2 className="fp-title">Forgot your password?</h2>
        <p className="fp-desc">
          Enter your registered email and we’ll send you a reset link.
        </p>

        <div className="fp-field">
          <label className="fp-label">Email address</label>
          <input
            type="email"
            value={emailId}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="fp-input"
            required
          />
        </div>

        <button type="submit" className="fp-button" disabled={isLoading}>
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>

        {message && (
          <p className={`fp-message ${isError ? "error" : "success"}`}>
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default ForgotPassword;