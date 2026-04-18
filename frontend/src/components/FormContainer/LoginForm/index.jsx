import { Component } from 'react'
import Cookies from 'js-cookie'
import { Navigate, Link } from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdEmail, MdLock } from 'react-icons/md' 
import './index.css'
import navlogo from "../../../assets/navlogo.png";

const BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";
        
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
    }
  }

  onChangeEmail = event => this.setState({ emailId: event.target.value })
  onChangePassword = event => this.setState({ password: event.target.value })
  togglePasswordVisibility = () => this.setState(prevState => ({ showPassword: !prevState.showPassword }))

  onSubmitSuccess = () => window.location.replace('/')

  onSubmitFailure = errorMsg => {
    let message = errorMsg || "Something went wrong"
    if (message.toLowerCase().includes("verify")) {
      message = "📩 Please verify your email before logging in."
    }
    this.setState({ showSubmitError: true, errorMsg: message, isLoading: false })
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
        const data = await response.text()
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
          <div className="loginform-forgot-row">
              <Link to="/forgot-password" className="loginform-forgot-link">
                Forgot password?
              </Link>
          </div>
          {showSubmitError && <p className="loginform-error-message">{errorMsg}</p>}

          <div className="loginform-desc">
           New to Codemate? <Link to="/signup" className="loginform-link">Create an account</Link>
          </div>
        </form>
      </div>
    )
  }
}

export default LoginForm