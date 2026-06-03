import { Component } from 'react'
import Cookies from 'js-cookie'
import { Navigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdEmail, MdLock, MdPerson } from 'react-icons/md'
import Footer from "../Footer";
import './index.css'
import navlogo from "../../../assets/navlogo.png";

const BASE_URL = import.meta.env.PROD
  ? "/api"
  : "http://localhost:7777/api";


class SignupForm extends Component {
  state = {
    firstName: '',
    lastName: '',
    emailId: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
    showPassword: false,
    isLoading: false,
    // isEmailSent: false,
    // signupToken: '', // ✅ Added to track temporary cryptographic registration token
  }

  onChangeInput = (event) => {
    this.setState({ [event.target.id]: event.target.value })
  }

  togglePasswordVisibility = () => {
    this.setState(prev => ({ showPassword: !prev.showPassword }))
  }

  // onSubmitSuccess = (token) => {
  //   this.setState({
  //     isEmailSent: true,
  //     isLoading: false,
  //     showSubmitError: false,
  //     signupToken: token, // ✅ Storing the token to state for resend flows
  //   })
  // }

  onSubmitSuccess = () => {
    window.location.replace('/login')
  }

  onSubmitFailure = (errorMsg) => {
    this.setState({
      showSubmitError: true,
      errorMsg: errorMsg || "Something went wrong",
      isLoading: false,
    })
  }

  submitForm = async (event) => {
    event.preventDefault()

    const { firstName, lastName, emailId, password } = this.state

    this.setState({
      isLoading: true,
      showSubmitError: false,
    })

    const userDetails = { firstName, lastName, emailId, password }

    try {
      const response = await fetch(`${BASE_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userDetails),
      })

      const data = await response.json();

      if (response.ok) {
        // ✅ Passing data.token over to the success state handler
        // this.onSubmitSuccess(data.token)
        this.onSubmitSuccess()
      } else {
        this.onSubmitFailure(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Signup Terminal Error:", error);
      this.onSubmitFailure("Check your internet connection and try again.");
    }
  }

  // resendVerificationEmail = async () => {
  //   const { signupToken } = this.state

  //   if (!signupToken) {
  //     return this.setState({
  //       showSubmitError: true,
  //       errorMsg: "Verification session missing. Please register again.",
  //     })
  //   }

  //   this.setState({
  //     isLoading: true,
  //     showSubmitError: false,
  //   })

  //   try {
  //     const response = await fetch(`${BASE_URL}/resend-verification`, {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify({ token: signupToken }), // ✅ Sending token to backend instead of email
  //     })

  //     const data = await response.json()

  //     if (response.ok) {
  //       this.setState({
  //         showSubmitError: true,
  //         errorMsg: "📩 Email sent again!",
  //         isLoading: false,
  //         signupToken: data.token, // ✅ Saving fresh verification token from backend
  //       })
  //     } else {
  //       this.setState({
  //         showSubmitError: true,
  //         errorMsg: data.message || "Resend failed",
  //         isLoading: false,
  //       })
  //     }
  //   } catch (err) {
  //     this.setState({
  //       showSubmitError: true,
  //       errorMsg: "Something went wrong",
  //       isLoading: false,
  //     })
  //   }
  // }

  render() {
    const {
      firstName,
      lastName,
      emailId,
      password,
      showSubmitError,
      errorMsg,
      showPassword,
      isLoading,
      // isEmailSent,
    } = this.state

    // Redirect if already logged in
    // if (Cookies.get('jwt_token') && !isEmailSent) {
    //   return <Navigate to="/" replace />
    // }
    if (Cookies.get('jwt_token')) {
      return <Navigate to="/" replace />
    }

    // =========================
    // EMAIL SENT SCREEN
    // =========================
    // if (isEmailSent) {
    //   return (
    //   <div className="signupform-main-container">
    //     <div className="verify-card">

    //       <img
    //         src={navlogo}
    //         alt="logo"
    //         className="verify-logo"
    //       />

    //       <div className="verify-icon">📩</div>

    //       <h2 className="verify-title">Verify your email</h2>

    //       <p className="verify-text">
    //         We’ve sent a verification link to
    //       </p>

    //       <p className="verify-email">{emailId}</p>

    //       <p className="verify-subtext">
    //         Please check your inbox and click the link to activate your account.
    //       </p>

    //       <button
    //         type="button"
    //         className="verify-btn"
    //         onClick={this.resendVerificationEmail}
    //         disabled={isLoading}
    //       >
    //         {isLoading ? "Sending..." : "Resend Email"}
    //       </button>

    //       <p className="verify-hint">
    //         Didn’t receive the email? Check your spam folder.
    //       </p>

    //       {showSubmitError && (
    //         <p className="signupform-error-message">
    //           {errorMsg} 
    //           {errorMsg.includes("already registered") && (
    //             <span>. <Link to="/login" style={{color: 'blue', textDecoration: 'underline'}}>Login here</Link></span>
    //           )}
    //         </p>
    //       )}

    //       <p className="verify-footer">
    //         After verification, you can{" "}
    //         <Link to="/login" className="verify-link">
    //           login here
    //         </Link>
    //       </p>

    //     </div>
    //   </div>
    //   )
    // }

    // =========================
    // SIGNUP FORM
    // =========================
    return (
      <>
      <div className="signupform-main-container">
        <form className="signupform-container" onSubmit={this.submitForm}>
          <img
            src={navlogo}
            className="signupform-website-logo-desktop-img"
            alt="website logo"
          />

          <div className="signupform-input-container">
            <label htmlFor="firstName" className="signupform-input-label">
              FIRST NAME
            </label>
            <div className="signupform-input-wrapper">
              <MdPerson className="signupform-field-icon" />
              <input
                id="firstName"
                type="text"
                className="signupform-input-field"
                value={firstName}
                onChange={this.onChangeInput}
                placeholder="John"
                required
              />
            </div>
          </div>

          <div className="signupform-input-container">
            <label htmlFor="lastName" className="signupform-input-label">
              LAST NAME
            </label>
            <div className="signupform-input-wrapper">
              <MdPerson className="signupform-field-icon" />
              <input
                id="lastName"
                type="text"
                className="signupform-input-field"
                value={lastName}
                onChange={this.onChangeInput}
                placeholder="Doe"
                required
              />
            </div>
          </div>

          <div className="signupform-input-container">
            <label htmlFor="emailId" className="signupform-input-label">
              EMAIL
            </label>
            <div className="signupform-input-wrapper">
              <MdEmail className="signupform-field-icon" />
              <input
                id="emailId"
                type="email"
                className="signupform-input-field"
                value={emailId}
                onChange={this.onChangeInput}
                placeholder="name@gmail.com"
                required
              />
            </div>
          </div>

          <div className="signupform-input-container">
            <label htmlFor="password" className="signupform-input-label">
              PASSWORD
            </label>
            <div className="signupform-input-wrapper">
              <MdLock className="signupform-field-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="signupform-input-field"
                value={password}
                onChange={this.onChangeInput}
                placeholder="••••••••"
                required
              />
              <span
                className="signupform-password-toggle-icon"
                onClick={this.togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="signupform-button"
            disabled={isLoading}
          >
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {showSubmitError && (
            <p className="signupform-error-message">{errorMsg}</p>
          )}

          <div className="signupform-login-desc">
            Already have an account?{' '}
            <Link to="/login" className="signupform-link">
              Sign In
            </Link>
          </div>
        </form>
      </div>
      {/* Footer */}
      <Footer />
      </>
    )
  }
}

export default SignupForm