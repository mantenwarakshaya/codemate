import React from "react";
import { useNavigate } from "react-router-dom";
import { 
  MessageSquare, 
  Users, 
  Zap, 
  ChevronRight, 
  Terminal,
  RefreshCw,
  BarChart3,
  ShieldCheck
} from "lucide-react";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa";
import navlogo from "../../../assets/navlogo.png";
import Footer from "../Footer";
import "./index.css";

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="lp-container">
      {/* Navigation */}
      <nav className="lp-navbar">
        <div className="lp-nav-content">
          <div className="lp-logo-brand" onClick={() => navigate("/")}>
            <img src={navlogo} alt="Codemate" className="lp-nav-logo-img" />
          </div>
          <div className="lp-nav-links">
            <a href="#features">Features</a>
            <a href="#tech-stack">Tech Stack</a>
            <a href="#community">Community</a>
          </div>
          <div className="lp-nav-actions">
            <button className="lp-btn-ghost" onClick={() => navigate("/login")}>Log in</button>
            <button className="lp-btn-primary-glow" onClick={() => navigate("/signup")}>
              Get Started
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <header className="lp-hero">
        <div className="lp-hero-badge">
          <span className="badge-dot"></span>
          Open for Collaboration
        </div>
        <h1 className="lp-hero-title">
          Ship your ideas with the <br />
          <span className="lp-text-gradient">Co-builders.</span>
        </h1>
        <p className="lp-hero-subtitle">
          Don't build in a silo. CodeMate connects you with developers who share your stack and passion, making project collaboration seamless and secure.        </p>
        <div className="lp-hero-cta">
          <button className="lp-btn-primary-glow" onClick={() => navigate("/signup")}>
            Start Matching <ChevronRight size={18} />
          </button>
          <button className="lp-btn-outline" onClick={() => window.open('https://github.com', '_blank')}>
            <FaGithub size={18} /> Star on GitHub
          </button>
        </div>
      </header>

      {/* Features Grid */}
      <section id="features" className="lp-section">
        <div className="lp-inner-container">
          <div className="lp-section-header">
            <span className="lp-section-tag">Key Features</span>
            <h2>Engineered for Networking</h2>
          </div>

          <div className="lp-feature-grid">
            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><MessageSquare /></div>
              <h3>Live Messaging</h3>
              <p>Bi-directional communication powered by <strong>Socket.io</strong> with instant status indicators.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><Users /></div>
              <h3>Feed System</h3>
              <p>Smart discovery algorithm that filters out existing connections to keep your feed fresh.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><RefreshCw /></div>
              <h3>Account Restoration</h3>
              <p>Soft-delete protection allows you to restore your profile within a 7-day window.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><BarChart3 /></div>
              <h3>Profile Analytics</h3>
              <p>Track who viewed your profile and manage your professional visibility effectively.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><ShieldCheck /></div>
              <h3>Robust Security</h3>
              <p>JWT-based authentication with Bcrypt hashing for maximum account safety.</p>
            </div>

            <div className="lp-feature-card">
              <div className="lp-icon-wrapper"><Zap /></div>
              <h3>Dev-Focused Profiles</h3>
              <p>Showcase up to 10 technical skills and integrate GitHub, LinkedIn, and Discord.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack Section - Fixed alignment */}
      <section id="tech-stack" className="lp-section lp-tech-bg">
        <div className="lp-inner-container">
           <div className="lp-section-header">
              <span className="lp-section-tag">Infrastructure</span>
              <h3>Powered by MERN Stack & Cloudinary</h3>
           </div>
        </div>
      </section>

      {/* CTA */}
      <section className="lp-section">
        <div className="lp-cta-box">
          <div className="lp-cta-content">
            <h2>Build something great together.</h2>
            <p>Join hundreds of developers on CodeMate today and start collaborating.</p>
            <button className="lp-btn-white" onClick={() => navigate("/signup")}>Create Free Account</button>
          </div>
          {/* <Terminal size={180} strokeWidth={0.5} className="lp-cta-icon-bg" /> */}
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default LandingPage;