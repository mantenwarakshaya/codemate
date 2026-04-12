import { Component } from 'react'
import Cookies from 'js-cookie'
import { Navigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './index.css'
import navlogo from "../../assets/navlogo.png";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";
    
class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      emailId: '',
      password: '',
      showSubmitError: false,
      errorMsg: '',
      showPassword: false, 
    }
  }

  onChangeEmail = event => {
    this.setState({ emailId: event.target.value })
  }

  onChangePassword = event => {
    this.setState({ password: event.target.value })
  }

  togglePasswordVisibility = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }))
  }

  onSubmitSuccess = () => {
    window.location.replace('/')
  }

  onSubmitFailure = errorMsg => {
    if (errorMsg && errorMsg.toLowerCase().includes("verify")) {
      this.setState({
        showSubmitError: true,
        errorMsg: "📩 Please verify your email before logging in.",
      })
    } else {
      this.setState({
        showSubmitError: true,
        errorMsg: errorMsg || "Something went wrong",
      })
    }
  }

  submitForm = async event => {
    event.preventDefault()
    const { emailId, password } = this.state
    const userDetails = { emailId, password }
    const url = `${BASE_URL}/login`;

    const options = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(userDetails),
    }

    try {
      const response = await fetch(url, options)
      if (response.ok) {
        this.onSubmitSuccess()
      } else {
        const data = await response.text()
        this.onSubmitFailure(data)
      }
    } catch (error) {
      console.error("Login error:", error)
      this.setState({
        showSubmitError: true,
        errorMsg: "Server error. Please try again later.",
      })
    }
  }

  render() {
    const { emailId, password, showSubmitError, errorMsg, showPassword } = this.state
    const jwtToken = Cookies.get('jwt_token')

    if (jwtToken !== undefined) {
      return <Navigate to="/" replace />
    }

    return (
      <div className="login-form-container">
        <form className="form-container" onSubmit={this.submitForm}>
          <img
            src={navlogo}
            className="login-website-logo-desktop-img"
            alt="website logo"
          />

          <div className="input-container">
            <label htmlFor="email" className="input-label">EMAIL</label>
            <input
              id="email"
              name="email"
              type="email"
              className="username-input-field"
              value={emailId}
              onChange={this.onChangeEmail}
              placeholder="Enter your email"
              autoComplete="email"
            />
          </div>

          <div className="input-container password-container">
            <label htmlFor="password" className="input-label">PASSWORD</label>
            <div className="sub-password-container">
              <input
                id="password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                className="password-input-field"
                value={password}
                onChange={this.onChangePassword}
                placeholder="Enter your password"
                autoComplete="current-password"
              />
              <span
                className="password-toggle-icon"
                onClick={this.togglePasswordVisibility}
              >
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="login-button">
            Login
          </button>

          {showSubmitError && (
            <p className="error-message">* {errorMsg}</p>
          )}

          <div className="signup-desc">
            <p>
              New User? Signup Here{" "}
              <Link to="/signup" className="signup-link">
                Signup
              </Link>
            </p>
          </div>
        </form>
      </div>
    )
  }
}

export default LoginForm