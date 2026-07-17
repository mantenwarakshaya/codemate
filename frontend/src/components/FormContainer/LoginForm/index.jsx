import { Component } from 'react'
import Cookies from 'js-cookie'
import { Navigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdEmail, MdLock } from 'react-icons/md' 
import Footer from "../Footer";
import './index.css'
import navlogo from "../../../assets/navlogo.png";

const BASE_URL = "/api";

        
class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailId: '',
      password: '',
      showSubmitError: false,
      errorMsg: '',
      showPassword: false, 
      isLoading: false,
      showRestore: false, 
      isRestoring: false,
    }
  }

  onChangeEmail = event => this.setState({ emailId: event.target.value })
  onChangePassword = event => this.setState({ password: event.target.value })
  togglePasswordVisibility = () => this.setState(prevState => ({ showPassword: !prevState.showPassword }))

  onSubmitSuccess = () => window.location.replace('/')

  onSubmitFailure = (error) => {
    let message = error?.message || error || "Something went wrong"

    // ✅ HANDLE DEACTIVATED ACCOUNT CORRECTLY
    if (error?.code === "ACCOUNT_DEACTIVATED") {
      this.setState({
        showRestore: true,
        showSubmitError: false,
        isLoading: false,
      })
      return
    }

    // if (message.toLowerCase().includes("verify")) {
    //   message = "📩 Please verify your email before logging in."
    // }

    this.setState({
      password: '',
      showSubmitError: true,
      errorMsg: message,
      isLoading: false,
    })
  }

  handleRestoreAccount = async () => {
    const { emailId, password } = this.state

    if (!emailId || !password) {
      this.setState({
        showSubmitError: true,
        errorMsg: "Enter email & password to restore account",
      })
      return
    }

    this.setState({ isRestoring: true })

    try {
      const response = await fetch(`${BASE_URL}/restore-account`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emailId, password }),
      })

      const data = await response.text()

      if (response.ok) {
        this.setState({
          showRestore: false,
          isRestoring: false,
          showSubmitError: true,
          errorMsg: "Account restored successfully. You can login now.",
        })
      } else {
        this.setState({
          showSubmitError: true,
          errorMsg: data,
          isRestoring: false,
        })
      }
    } catch (err) {
      this.setState({
        showSubmitError: true,
        errorMsg: "Restore failed. Try again.",
        isRestoring: false,
      })
    }
  }

  submitForm = async event => {
    event.preventDefault()
    this.setState({ isLoading: true, showSubmitError: false })
    const { emailId, password } = this.state
    const userDetails = { emailId, password }
    
    try {
      const response = await fetch(`${BASE_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(userDetails),
      })
      if (response.ok) {
        this.onSubmitSuccess()
      } else {
        const data = await response.json()
        this.onSubmitFailure(data)
      }
    } catch (error) {
      this.onSubmitFailure("Server error. Please try again later.")
    }
  }

  render() {
    const { emailId, password, showSubmitError, errorMsg, showPassword, isLoading } = this.state
    if (Cookies.get('jwt_token') !== undefined) return <Navigate to="/" replace />

    return (
      <>
      <div className="loginform-main-container">
        <form className="loginform-container" onSubmit={this.submitForm}>
          <img src={navlogo} className="loginform-website-logo-desktop-img" alt="website logo" />

          {/* Email Input Group */}
          <div className="loginform-input-container">
            <label htmlFor="email" className="loginform-input-label">EMAIL</label>
            <div className="loginform-input-wrapper">
              <MdEmail className="loginform-field-icon" />
              <input
                id="email"
                type="email"
                className="loginform-input-field"
                value={emailId}
                onChange={this.onChangeEmail}
                placeholder="name@gmail.com"
                required
              />
            </div>
          </div>

          {/* Password Input Group */}
          <div className="loginform-input-container">
            <label htmlFor="password" className="loginform-input-label">PASSWORD</label>
            <div className="loginform-input-wrapper">
              <MdLock className="loginform-field-icon" />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                className="loginform-input-field"
                value={password}
                onChange={this.onChangePassword}
                placeholder="••••••••"
                required
              />
              <span className="loginform-password-toggle-icon" onClick={this.togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="loginform-button" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
          {this.state.showRestore && (
            <div className="restore-box">
              <p className="restore-text">
                Your account is deactivated. You can restore it within 7 days.
              </p>

              <button
                type="button"
                className="restore-btn"
                onClick={this.handleRestoreAccount}
                disabled={this.state.isRestoring}
              >
                {this.state.isRestoring ? "Restoring..." : "Restore Account"}
              </button>
            </div>
          )}
          {/* <div className="loginform-forgot-row">
              <Link to="/forgot-password" className="loginform-forgot-link">
                Forgot password?
              </Link>
          </div> */}
          {showSubmitError && <p className="loginform-error-message">{errorMsg}</p>}

          <div className="loginform-desc">
           New to Codemate? <Link to="/signup" className="loginform-link">Create an account</Link>
          </div>
        </form>
      </div>
      {/* Footer */}
      <Footer />
      </>
    )
  }
}

export default LoginForm