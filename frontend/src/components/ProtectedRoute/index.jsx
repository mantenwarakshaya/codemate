import { Component } from 'react'
import { Navigate } from 'react-router-dom'
import Cookies from 'js-cookie'

class ProtectedRoute extends Component {
  render() {
    // Check for the presence of the JWT token in cookies
    const token = Cookies.get('jwt_token')
    const { children } = this.props

    // If token is missing, redirect the user to the login page
    if (token === undefined) {
      return <Navigate to="/landing" replace />
    }

    // If authenticated, render the protected content
    return children
  }
}

export default ProtectedRoute