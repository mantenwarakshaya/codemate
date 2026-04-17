import {Component} from 'react'
import Cookies from 'js-cookie'
import {Navigate, Link} from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import { MdEmail, MdLock, MdPerson } from 'react-icons/md'
import './index.css'
import navlogo from "../../../assets/navlogo.png";

const BASE_URL = location.hostname === "localhost" ? "http://localhost:7777" : "/api";

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
  }

  onChangeInput = event => {
    this.setState({[event.target.id]: event.target.value})
  }

  togglePasswordVisibility = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }))
  }

  onSubmitSuccess = () => {
    window.location.replace('/login')
  }

  onSubmitFailure = errorMsg => {
    this.setState({showSubmitError: true, errorMsg: errorMsg || "Something went wrong", isLoading: false})
  }

  submitForm = async event => {
    event.preventDefault()
    this.setState({isLoading: true, showSubmitError: false})

    const {firstName, lastName, emailId, password} = this.state
    const userDetails = {firstName, lastName, emailId, password}

    try {
      const response = await fetch(`${BASE_URL}/api/signup`, {
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
    const {firstName, lastName, emailId, password, showSubmitError, errorMsg, showPassword, isLoading} = this.state
    if (Cookies.get('jwt_token') !== undefined) return <Navigate to="/" replace />

    return (
      <div className="signupform-main-container">
        <form className="signupform-container" onSubmit={this.submitForm}>
          <img src={navlogo} className="signupform-website-logo-desktop-img" alt="website logo" />

          {/* First Name */}
          <div className="signupform-input-container">
            <label htmlFor="firstName" className="signupform-input-label">FIRST NAME</label>
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

          {/* Last Name */}
          <div className="signupform-input-container">
            <label htmlFor="lastName" className="signupform-input-label">LAST NAME</label>
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

          {/* Email */}
          <div className="signupform-input-container">
            <label htmlFor="emailId" className="signupform-input-label">EMAIL</label>
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

          {/* Password */}
          <div className="signupform-input-container">
            <label htmlFor="password" className="signupform-input-label">PASSWORD</label>
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
              <span className="signupform-password-toggle-icon" onClick={this.togglePasswordVisibility}>
                {showPassword ? <FaEyeSlash /> : <FaEye />}
              </span>
            </div>
          </div>

          <button type="submit" className="signupform-button" disabled={isLoading}>
            {isLoading ? 'Creating account...' : 'Create Account'}
          </button>

          {showSubmitError && <p className="signupform-error-message">{errorMsg}</p>}

          <div className="signupform-login-desc">
            Already have an account?{' '}
            <Link to="/login" className="signupform-link">
              Sign In
            </Link>
          </div>
        </form>
      </div>
    )
  }
}

export default SignupForm