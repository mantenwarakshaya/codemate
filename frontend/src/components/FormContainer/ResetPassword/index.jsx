import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "./index.css";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState("");
  const [isError, setIsError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMsg("");

    try {
      const res = await fetch(`${BASE_URL}/reset-password/${token}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password }),
      });

      const data = await res.text();

      if (!res.ok) {
        setIsError(true);
      } else {
        setIsError(false);
        setTimeout(() => navigate("/login"), 2000);
      }

      setMsg(data);
    } catch (err) {
      setIsError(true);
      setMsg("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rp-main">
      <form className="rp-card" onSubmit={handleSubmit}>
        <h2 className="rp-title">Reset your password</h2>
        <p className="rp-subtitle">
          Enter a new password for your account
        </p>

        <div className="rp-field">
          <label className="rp-label">New Password</label>
          <input
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="rp-input"
            required
          />
        </div>

        <button type="submit" className="rp-btn" disabled={isLoading}>
          {isLoading ? "Updating..." : "Reset Password"}
        </button>

        {msg && (
          <p className={`rp-message ${isError ? "error" : "success"}`}>
            {msg}
          </p>
        )}
      </form>
    </div>
  );
};

export default ResetPassword;