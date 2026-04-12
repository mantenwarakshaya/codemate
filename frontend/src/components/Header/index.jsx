import { Component } from "react";
import { Link, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaBars, FaTimes } from "react-icons/fa";
import "./index.css";
import navlogo from "../../assets/navlogo.png";

class Header extends Component {
  // Initialize state replacing useState hook
  state = {
    isOpen: false,
  };

  // Toggles the mobile menu visibility
  toggleMenu = () => {
    this.setState((prevState) => ({ isOpen: !prevState.isOpen }));
  };

  // Closes the menu when a link is clicked
  closeMenu = () => {
    this.setState({ isOpen: false });
  };

  onClickLogout = () => {
    const { navigate } = this.props;
    Cookies.remove("jwt_token");
    // Using navigate prop from the HOC wrapper
    navigate("/login", { replace: true });
  };

  render() {
    const { isOpen } = this.state;

    return (
      <nav className="nav-header">
        <div className="nav-content">
          {/* LOGO */}
          <Link to="/">
            <img className="website-logo" src={navlogo} alt="website logo" />
          </Link>

          {/* HAMBURGER ICON (MOBILE) */}
          <div className="menu-icon" onClick={this.toggleMenu}>
            {isOpen ? <FaTimes /> : <FaBars />}
          </div>

          {/* NAV ITEMS */}
          <div className={`nav-content-sub ${isOpen ? "active" : ""}`}>
            <ul className="nav-menu">
              <li>
                <Link to="/" className="nav-link" onClick={this.closeMenu}>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/profile" className="nav-link" onClick={this.closeMenu}>
                  Profile
                </Link>
              </li>
              <li>
                <Link to="/connections" className="nav-link" onClick={this.closeMenu}>
                  Connections
                </Link>
              </li>
              <li>
                <Link to="/requests" className="nav-link" onClick={this.closeMenu}>
                  Requests
                </Link>
              </li>
            </ul>

            <button className="logout-btn" onClick={this.onClickLogout}>
              Logout
            </button>
          </div>
        </div>
      </nav>
    );
  }
}

// Wrapper to inject navigate hook into class component
const HeaderWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Header {...props} navigate={navigate} />;
};

export default HeaderWithNavigate;