import { Component } from "react";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import Cookies from "js-cookie";
import { FaBars, FaTimes } from "react-icons/fa";
import { Users, MessageSquare, Bell, Home, ChevronDown, Crown } from "lucide-react";
import "./index.css";
import navlogo from "../../assets/navlogo.png";

const BASE_URL = "/api";

class Header extends Component {
  state = {
    isOpen: false,
    showDropdown: false,
    profilePic: "/avatar.png",
    fetching: false,
  };

  componentDidMount() {
    this.fetchProfile();
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.location?.pathname !== this.props.location?.pathname
    ) {
      this.fetchProfile();
    }
  }

  fetchProfile = async () => {
    try {
      if (this.state.fetching) return;

      this.setState({ fetching: true });

      const token = Cookies.get("jwt_token");

      const response = await fetch(`${BASE_URL}/profile/view`, {
        credentials: "include"
      });

      if (response.ok) {
        const data = await response.json();
        this.setState({
          profilePic: data.profilePic || "/avatar.png",
        });
      }
    } catch (error) {
      console.log("Error fetching profile:", error);
    } finally {
      this.setState({ fetching: false });
    }
  };

  toggleMenu = () => {
    this.setState((prev) => ({ isOpen: !prev.isOpen }));
  };

  toggleDropdown = (e) => {
    e.stopPropagation();
    this.setState((prev) => ({ showDropdown: !prev.showDropdown }));
  };

  closeMenu = () => {
    this.setState({ isOpen: false, showDropdown: false });
  };

  onClickLogout = () => {
    Cookies.remove("jwt_token");
    this.props.navigate("/landing", { replace: true });
  };

  render() {
    const { isOpen, showDropdown, profilePic } = this.state;

    return (
      <>
        {isOpen && (
          <div className="menu-backdrop" onClick={this.closeMenu}></div>
        )}

        <nav className="nav-header">
          <div className="nav-content">

            {/* LOGO */}
            <NavLink to="/" className="nav-logo">
              <img src={navlogo} alt="logo" />
            </NavLink>

            {/* HAMBURGER */}
            <div className="nav-menu-icon" onClick={this.toggleMenu}>
              {isOpen ? <FaTimes /> : <FaBars />}
            </div>

            {/* NAV ITEMS */}
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
                    </div>
                  </NavLink>
                </li>

                <li>
                  <NavLink to="/premium" className="nav-link" onClick={this.closeMenu}>
                    <div className="nav-item">
                      <Crown size={22} strokeWidth={1.5} />
                      <span>Pro</span>
                    </div>
                  </NavLink>
                </li>

              </ul>

              {/* ACTIONS */}
              <div className="nav-actions">
                <div className="nav-profile" onClick={this.toggleDropdown}>

                  <div className="profile-info-wrapper">
                    <img
                      src={profilePic || "/avatar.png"}
                      alt="profile"
                      className="profile-img"
                    />

                    <span className="mobile-profile-label">
                      My Account
                    </span>

                    <ChevronDown
                      size={18}
                      className={`chevron ${showDropdown ? "rotate" : ""}`}
                    />
                  </div>

                  {showDropdown && (
                    <div className="nav-dropdown">

                      <p
                        className="dropdown-item"
                        onClick={() => this.props.navigate("/profile")}
                      >
                        Account Settings
                      </p>

                      <p
                        className="dropdown-item logout"
                        onClick={this.onClickLogout}
                      >
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

/* Router wrapper */
const HeaderWithNavigate = (props) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <Header
      {...props}
      navigate={navigate}
      location={location}
    />
  );
};

export default HeaderWithNavigate;