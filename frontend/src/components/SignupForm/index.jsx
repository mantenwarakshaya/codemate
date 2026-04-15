import {Component} from 'react'
import Cookies from 'js-cookie'
import {Navigate, Link} from 'react-router-dom'
import { FaEye, FaEyeSlash } from 'react-icons/fa'
import './index.css'
import navlogo from "../../assets/navlogo.png";

const BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "http://localhost:7777/api"
    : "/api";

class SignupForm extends Component {
  // Initialize state to track form inputs and API feedback
  state = {
    firstName: '',
    lastName: '',
    emailId: '',
    password: '',
    showSubmitError: false,
    errorMsg: '',
    showPassword: false,
  }

  // Update specific state fields on input change
  onChangeFirstName = event => {
    this.setState({firstName: event.target.value})
  }

  onChangeLastName = event => {
    this.setState({lastName: event.target.value})
  }

  onChangeEmail = event => {
    this.setState({emailId: event.target.value})
  }

  onChangePassword = event => {
    this.setState({password: event.target.value})
  }

  togglePasswordVisibility = () => {
    this.setState(prevState => ({ showPassword: !prevState.showPassword }))
  }

  onSubmitSuccess = () => {
    window.location.replace('/login')
  }

  onSubmitFailure = errorMsg => {
    this.setState({showSubmitError: true, errorMsg})
  }

  submitForm = async event => {
    event.preventDefault() // Prevent page refresh on form submission

    const {firstName, lastName, emailId, password} = this.state
    const userDetails = {firstName, lastName, emailId, password}

    const url = `${BASE_URL}/signup`
    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // Include cookies/session info if required by backend
      body: JSON.stringify(userDetails),
    }

    const response = await fetch(url, options)

    if (response.ok) {
      this.onSubmitSuccess()
    } else {
      const data = await response.text()
      this.onSubmitFailure(data)
    }
  }

  render() {
    const {
      firstName,
      lastName,
      emailId,
      password,
      showSubmitError,
      errorMsg,
      showPassword,
    } = this.state

    const jwtToken = Cookies.get('jwt_token')

    // Redirect to home if user is already authenticated
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
            <label htmlFor="firstName" className="input-label">FIRST NAME</label>
            <input
              id="firstName"
              name="firstName"
              type="text"
              className="username-input-field"
              value={firstName}
              onChange={this.onChangeFirstName}
              placeholder="Enter First Name"
              autoComplete="given-name"
            />
          </div>

          <div className="input-container">
            <label htmlFor="lastName" className="input-label">LAST NAME</label>
            <input
              id="lastName"
              name="lastName"
              type="text"
              className="username-input-field"
              value={lastName}
              onChange={this.onChangeLastName}
              placeholder="Enter Last Name"
              autoComplete="family-name"
            />
          </div>

          <div className="input-container">
            <label htmlFor="email" className="input-label">EMAIL</label>
            <input
              id="email"
              name="email"
              type="email"
              className="username-input-field"
              value={emailId}
              onChange={this.onChangeEmail}
              placeholder="Enter Email"
              autoComplete="email"
            />
          </div>

          <div className="input-container">
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
                autoComplete="new-password"
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
            Signup
          </button>

          {/* Conditional error message rendering */}
          {showSubmitError && (
            <p className="error-message">*{errorMsg}</p>
          )}

          <div className="login-desc">
            <p>
              Existing User? Login Here{' '}
              <Link to="/login" className="login-link">
                Login
              </Link>
            </p>
          </div>
        </form>
      </div>
    )
  }
}

export default SignupForm