import React from "react";
import { FaGithub, FaLinkedin, FaTwitter, FaDiscord } from "react-icons/fa";
import navlogo from "../../../assets/navlogo.png";
import "./index.css";

const Footer = () => {
  return (
    <footer className="auth-footer">
      <div className="auth-footer-content">
        <div className="auth-footer-grid">
          {/* Brand Section */}
          <div className="footer-brand">
            <img src={navlogo} alt="CodeMate Logo" className="footer-logo-img" />
            <p>Connecting developers through code and collaboration.</p>
          </div>
          
          {/* Platform Section */}
          <div className="footer-links">
            <h4>Platform</h4>
            <a href="#features">Features</a>
            <a href="#">Security</a>
          </div>

          {/* Developer Section */}
          <div className="footer-links">
            <h4>Developer</h4>
            <a href="https://github.com" target="_blank" rel="noreferrer">GitHub Repo</a>
            <a href="#">API Docs</a>
          </div>

          {/* Social Section */}
          <div className="footer-socials">
            <h4>Community</h4>
            <div className="social-icons">
              <a href="#"><FaTwitter /></a>
              <a href="#"><FaGithub /></a>
              <a href="#"><FaLinkedin /></a>
              <a href="#"><FaDiscord /></a>
            </div>
          </div>
        </div>

        <div className="auth-footer-divider"></div>

        <div className="auth-footer-bottom">
          <p>© 2026 CodeMate. All rights reserved.</p>
          <p className="footer-credit">Crafted by Mantenwar Akshaya</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;