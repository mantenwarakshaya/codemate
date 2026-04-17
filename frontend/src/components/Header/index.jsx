import { Component } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { FaBars, FaTimes } from "react-icons/fa";
import { Users, MessageSquare, Bell, Home, ChevronDown } from 'lucide-react';
import "./index.css";
import navlogo from "../../assets/navlogo.png";

class Header extends Component {
  state = {
    isOpen: false,
    showDropdown: false,
  };

  toggleMenu = () => {
    this.setState((prev) => ({ isOpen: !prev.isOpen }));
  };

  toggleDropdown = (e) => {
    e.stopPropagation(); // Prevents menu from closing when clicking profile
    this.setState((prev) => ({ showDropdown: !prev.showDropdown }));
  };

  closeMenu = () => {
    this.setState({ isOpen: false, showDropdown: false });
  };

  onClickLogout = () => {
    Cookies.remove("jwt_token");
    this.props.navigate("/login", { replace: true });
  };

  render() {
    const { isOpen, showDropdown } = this.state;

    return (
      <>
        {isOpen && <div className="menu-backdrop" onClick={this.closeMenu}></div>}
        
        <nav className="nav-header">
          <div className="nav-content">
            {/* LOGO */}
            <NavLink to="/" className="nav-logo">
              <img src={navlogo} alt="logo" />
            </NavLink>

            {/* MOBILE HAMBURGER */}
            <div className="nav-menu-icon" onClick={this.toggleMenu}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* NAV LINKS & ACTIONS */}
            <div className={`nav-right ${isOpen ? "active" : ""}`}>
              <ul className="nav-menu">
                <li>
                  <NavLink to="/" className="nav-link" onClick={this.closeMenu}>
                    <div className="nav-item">
                      <Home size={22} strokeWidth={1.5} />
                      <span>Home</span>
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/network" className="nav-link" onClick={this.closeMenu}>
                    <div className="nav-item">
                      <Users size={22} strokeWidth={1.5} />
                      <span>Network</span>
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/chat" className="nav-link" onClick={this.closeMenu}>
                    <div className="nav-item">
                      <MessageSquare size={22} strokeWidth={1.5} />
                      <span>Messages</span>
                    </div>
                  </NavLink>
                </li>
                <li>
                  <NavLink to="/notifications" className="nav-link" onClick={this.closeMenu}>
                    <div className="nav-item nav-notification">
                      <Bell size={22} strokeWidth={1.5} />
                      <span>Notifications</span>
                      {/* <span className="nav-badge">3</span> */}
                    </div>
                  </NavLink>
                </li>
              </ul>
              {/* navactions */}
              <div className="nav-actions">
                <div className="nav-profile" onClick={this.toggleDropdown}>
                  <div className="profile-info-wrapper">
                    <img src="/avatar.png" alt="profile" className="profile-img" />
                    <span className="mobile-profile-label">My Account</span> 
                    <ChevronDown 
                        size={18} 
                        className={`chevron ${showDropdown ? "rotate" : ""}`} 
                    />
                  </div>

                  {showDropdown && (
                    <div className="nav-dropdown">
                      <p className="dropdown-item" onClick={() => this.props.navigate("/profile")}>
                        View Profile
                      </p>
                      <p className="dropdown-item logout" onClick={this.onClickLogout}>
                        Sign Out
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      </>
    );
  }
}

const HeaderWithNavigate = (props) => {
  const navigate = useNavigate();
  return <Header {...props} navigate={navigate} />;
};

export default HeaderWithNavigate;