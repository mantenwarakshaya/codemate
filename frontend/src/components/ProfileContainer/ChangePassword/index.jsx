import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./index.css";
import Header from "../../Header";

const ChangePassword = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    oldPassword: "",
    newPassword: "",
  });

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const onChangeInput = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const onSubmitForm = async (e) => {
    e.preventDefault();
    setError("");
    setMessage("");

    try {
      setLoading(true);

      const res = await axios.patch(
        "/api/profile/password",
        formData,
        { withCredentials: true }
      );

      setMessage(res.data.message);
      setFormData({ oldPassword: "", newPassword: "" });

      setTimeout(() => navigate("/profile"), 2000);

    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Header />

      <div className="change-password__container">
        <form className="change-password__card" onSubmit={onSubmitForm}>
          <h2 className="change-password__title">Change Password</h2>

          <div className="change-password__group">
            <label className="change-password__label">Old Password</label>
            <input
              className="change-password__input"
              type="password"
              name="oldPassword"
              value={formData.oldPassword}
              onChange={onChangeInput}
              placeholder="Enter old password"
              required
            />
          </div>

          <div className="change-password__group">
            <label className="change-password__label">New Password</label>
            <input
              className="change-password__input"
              type="password"
              name="newPassword"
              value={formData.newPassword}
              onChange={onChangeInput}
              placeholder="Enter new password"
              required
            />
          </div>

          <button
            type="submit"
            className="change-password__button"
            disabled={loading}
          >
            {loading ? "Updating..." : "Update Password"}
          </button>

          {message && (
            <p className="change-password__message change-password__message--success">
              {message}
            </p>
          )}

          {error && (
            <p className="change-password__message change-password__message--error">
              {error}
            </p>
          )}
        </form>
      </div>
    </>
  );
};

export default ChangePassword;