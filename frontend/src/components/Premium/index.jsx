import React, { useState } from "react";
import axios from "axios";
import { useSelector, useDispatch } from "react-redux";

import Header from "../Header";

import "./index.css";

const BASE_URL =
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

const Premium = () => {
  const [isYearly, setIsYearly] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const user = useSelector((store) => store.user);

  const dispatch = useDispatch();

  const membershipExpiresAt =
    user?.membershipExpiresAt?.$date || user?.membershipExpiresAt;

  const isPremiumActive =
    user?.isPremium === true &&
    membershipExpiresAt &&
    new Date(membershipExpiresAt).getTime() > Date.now();

  const handleBuyClick = async () => {
    const planType = isYearly ? "yearly" : "monthly";

    try {
      setIsProcessing(true);

      const order = await axios.post(
        BASE_URL + "/payment/create",
        { membershipType: planType },
        { withCredentials: true }
      );

      const { amount, keyId, currency, notes, orderId } = order.data;

      const options = {
        key: keyId,
        amount,
        currency,
        name: "CodeMate",
        description: "Connect to other developers",

        order_id: orderId,

        prefill: {
          name: `${notes.firstName} ${notes.lastName}`,
          email: notes.emailId,
          contact: "9999999999",
        },

        theme: {
          color: "#0967d2",
        },

        handler: async function (response) {
          try {
            setIsProcessing(true);

            await axios.post(
              BASE_URL + "/payment/verify",
              response,
              {
                withCredentials: true,
              }
            );

            // FETCH UPDATED USER
            const updatedUser = await axios.get(
              BASE_URL + "/profile/view",
              {
                withCredentials: true,
              }
            );

            // UPDATE REDUX STORE
            dispatch({
              type: "SET_USER",
              payload: updatedUser.data,
            });

            alert("Premium Activated Successfully");

            setIsProcessing(false);
          } catch (err) {
            console.error("Verification Error:", err);

            setIsProcessing(false);

            alert(
              "Payment verification failed. Please contact support."
            );
          }
        },

        modal: {
          ondismiss: function () {
            setIsProcessing(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);

      rzp.on("payment.failed", function () {
        setIsProcessing(false);

        alert("Payment Failed");
      });

      rzp.open();
    } catch (error) {
      setIsProcessing(false);

      console.error("Error creating payment order:", error);

      alert("Unable to initiate payment. Please try again.");
    }
  };

  if (isPremiumActive) {
    return (
      <>
        <Header />

        <div className="premium-container">
          <div className="premium-success-card">

            <div className="premium-badge-container">
              <div className="premium-badge-icon">✓</div>

              <p className="premium-tag">
                CODEMATE PRO ACTIVE
              </p>
            </div>

            <h1 className="premium-success-heading">
              Premium Membership Activated
            </h1>

            <p className="premium-success-description">
              Your CodeMate Pro membership is currently active.
              You now have access to exclusive developer
              networking and visibility features.
            </p>

            <div className="premium-membership-details">

              <div className="membership-detail-card">
                <p className="detail-label">
                  Membership Plan
                </p>

                <h2 className="detail-value">
                  {user?.membershipType === "yearly"
                    ? "Yearly Pro"
                    : "Monthly Pro"}
                </h2>
              </div>

              <div className="membership-detail-card">
                <p className="detail-label">
                  Active Until
                </p>

                <h2 className="detail-value">
                  {new Date(
                    membershipExpiresAt
                  ).toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </h2>
              </div>

            </div>

            <div className="premium-features-preview">

              <div className="premium-feature">
                <span>✓</span>
                <p>Verified Developer Badge</p>
              </div>

              <div className="premium-feature">
                <span>✓</span>
                <p>Profile Visitor Insights</p>
              </div>

              <div className="premium-feature">
                <span>✓</span>
                <p>200 Daily Connection & Ignore Actions</p>
              </div>

              <div className="premium-feature">
                <span>✓</span>
                <p>Priority Profile Visibility</p>
              </div>

            </div>

          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header />

      <div className="premium-container">
        {isProcessing && (
          <div className="loading-overlay">
            <p>
              Processing your membership... Please do not
              refresh.
            </p>
          </div>
        )}

        <div className="premium-hero">
          <p className="premium-tag">CodeMate Pro</p>

          <h1 className="premium-heading">
            Advanced networking tools for developers.
          </h1>

          <p className="premium-description">
            Unlock profile insights, increased visibility,
            and premium messaging features.
          </p>
        </div>

        <div className="billing-toggle-container">
          <span
            className={`toggle-label ${
              !isYearly ? "active" : ""
            }`}
          >
            Monthly
          </span>

          <label className="billing-switch">
            <input
              type="checkbox"
              checked={isYearly}
              onChange={() => setIsYearly(!isYearly)}
            />

            <span className="billing-slider"></span>
          </label>

          <span
            className={`toggle-label ${
              isYearly ? "active" : ""
            }`}
          >
            Yearly{" "}
            <span className="discount-badge">
              Save ~33%
            </span>
          </span>
        </div>

        <div className="pricing-card">
          <div className="pricing-top">
            <h2 className="plan-name">
              Pro Membership
            </h2>

            <div className="price-section">
              <h1 className="price">
                {isYearly ? "₹799" : "₹99"}
              </h1>

              <p className="duration">
                {isYearly ? "/ year" : "/ month"}
              </p>
            </div>
          </div>

          <div className="features-container">
            <div className="feature-item">
              <span>✓</span>
              <p>Verified Developer Badge</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Profile Visitor Insights</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>200 Daily Connection & Ignore Actions</p>
            </div>

            <div className="feature-item">
              <span>✓</span>
              <p>Priority Profile Visibility</p>
            </div>

          </div>

          <button
            type="button"
            className="upgrade-btn"
            disabled={isProcessing}
            onClick={handleBuyClick}
          >
            {isProcessing
              ? "Processing..."
              : `Upgrade to ${
                  isYearly ? "Yearly" : "Monthly"
                } Pro`}
          </button>
        </div>
      </div>
    </>
  );
};

export default Premium;