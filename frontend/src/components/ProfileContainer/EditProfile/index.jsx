import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import { Camera } from "lucide-react";
import "./index.css";

import { LoaderView, ErrorView, PremiumVerifiedBadge } from "../../Common";

const BASE_URL = 
  process.env.NODE_ENV === "production"
    ? "/api"
    : "http://localhost:7777/api";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const SKILLS_OPTIONS = ["AWS", "Bootstrap", "C", "C++", "CSS", "Cyber Security", "Docker", "Django", "Express.js", "Firebase", "Git", "GraphQL", "HTML", 
  "Java", "JavaScript", "Jest", "Kubernetes", "MongoDB", "Next.js", "Node.js", "PostgreSQL", "Python", "React", "Redux", "REST APIs", "Tailwind CSS", "TypeScript"];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

class EditProfile extends Component {
  state = {
    user: {},
    selectedSkills: [],
    apiStatus: apiStatusConstants.initial,
    isUpdatingProfile: false,
    previewImg: null, 
    activeTab: "general",
  };

  componentDidMount() {
    this.getProfile();
  }

  getProfile = async () => {
    this.setState({ apiStatus: apiStatusConstants.inProgress });
    try {
      const res = await fetch(`${BASE_URL}/profile/view`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch profile");
      const data = await res.json();
      this.setState({
        user: data,
        selectedSkills: data.skills || [],
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
      console.error(err);
      this.setState({ apiStatus: apiStatusConstants.failure });
    }
  };

  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      user: { ...prevState.user, [name]: value },
    }));
  };

  handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      this.setState({ previewImg: reader.result });
    };
  };

  handleAddSkill = (e) => {
    const skill = e.target.value;
    const { selectedSkills } = this.state;
    if (skill && !selectedSkills.includes(skill)) {
      this.setState({ selectedSkills: [...selectedSkills, skill] });
    }
  };

  handleRemoveSkill = (skillToRemove) => {
    this.setState((prevState) => ({
      selectedSkills: prevState.selectedSkills.filter(
        (skill) => skill !== skillToRemove
      ),
    }));
  };

  handleSave = async () => {
    const { user, selectedSkills, previewImg } = this.state;
    this.setState({ isUpdatingProfile: true });

    try {
      const updatedData = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        age: user.age,
        about: user.about,
        skills: selectedSkills,
        experience: user.experience,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        discord: user.discord,
        profilePic: previewImg || user.profilePic,
      };

      const res = await fetch(`${BASE_URL}/profile/edit`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Unknown error");

      this.setState({ 
        user: data.data, 
        isUpdatingProfile: false, 
        previewImg: null 
      });
      if (res.ok) {
        alert("Profile updated successfully!");
        this.props.navigate("/profile"); 
      }
    } catch (err) {
      alert("Error updating profile: " + err.message);
      this.setState({ isUpdatingProfile: false });
    }
  };  

  renderProfile = () => {
    const { user, selectedSkills, isUpdatingProfile, previewImg, activeTab = 'general' } = this.state;

    return (
      <div className="ep-profile-dashboard-layout">
        {/* 1. Header & Identity Surface (Always Visible) */}
        <section className="ep-profile-identity-header">
          <div className="ep-identity-flex-container">
            <div className="ep-avatar-interaction-group">
              <div className="ep-avatar-squircle">
                <img
                  src={previewImg || user.profilePic || "/avatar.png"}
                  alt="Profile"
                />
                <label htmlFor="avatar-upload" className="ep-avatar-edit-trigger">
                  <Camera size={16} />
                  <input type="file" id="avatar-upload" hidden onChange={this.handleImageUpload} />
                </label>
              </div>
              <div className="ep-identity-meta">
                <h1 className="ep-user-full-name">
                  {user.firstName} {user.lastName}
                  <PremiumVerifiedBadge user={user} />
                </h1>
                <span className="ep-user-email-badge">{user.emailId}</span>
              </div>
            </div>
            <button 
              className={`ep-sync-profile-btn ${isUpdatingProfile ? 'ep-is-loading' : ''}`} 
              onClick={this.handleSave} 
              disabled={isUpdatingProfile}
            >
              {isUpdatingProfile ? "Saving Changes..." : "Save Profile"}
            </button>
          </div>

          {/* 2. Navigation Tabs */}
          <nav className="ep-profile-navigation-tabs">
            <button 
              className={`ep-tab-link ${activeTab === 'general' ? 'ep-active' : ''}`}
              onClick={() => this.setState({ activeTab: 'general' })}
            >
              General
            </button>
            <button 
              className={`ep-tab-link ${activeTab === 'pro' ? 'ep-active' : ''}`}
              onClick={() => this.setState({ activeTab: 'pro' })}
            >
              Professional
            </button>
            <button 
              className={`ep-tab-link ${activeTab === 'social' ? 'ep-active' : ''}`}
              onClick={() => this.setState({ activeTab: 'social' })}
            >
              Social Presence
            </button>
          </nav>
        </section>

        {/* 3. Form Content Area (Changes based on activeTab) */}
        <section className="ep-profile-form-surface">
          
          {/* --- GENERAL TAB --- */}
          {activeTab === 'general' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Personal Information</h3>
                <p>Update your photo and personal details here.</p>
              </div>

              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label>First Name</label>
                  <input name="firstName" value={user.firstName || ""} onChange={this.handleChange} placeholder="e.g. Akshaya" />
                </div>
                <div className="ep-field-container">
                  <label>Last Name</label>
                  <input name="lastName" value={user.lastName || ""} onChange={this.handleChange} placeholder="e.g. Mantenwar" />
                </div>
                <div className="ep-field-container">
                  <label>Age</label>
                  <input name="age" type="number" value={user.age || ""} onChange={this.handleChange} />
                </div>
                <div className="ep-field-container">
                  <label>Gender</label>
                  <select name="gender" value={user.gender || ""} onChange={this.handleChange}>
                    <option value="" disabled>Select gender</option>
                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* --- PROFESSIONAL TAB --- */}
          {activeTab === 'pro' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Professional Bio</h3>
                <p>This will be displayed on your public profile.</p>
              </div>
              
              <div className="ep-field-container ep-full-span">
                <label>About Me</label>
                <textarea name="about" value={user.about || ""} onChange={this.handleChange} rows="5" />
                <span className="ep-field-hint">Brief description for your profile. URLs are allowed.</span>
              </div>

              <div className="ep-form-divider" />

              <div className="ep-form-section-header">
                <h3>Skills & Tech Stack</h3>
              </div>
              
              <div className="ep-skills-management-box">
                <select className="ep-skills-dropdown" onChange={this.handleAddSkill} defaultValue="">
                  <option value="" disabled>Add a technology...</option>
                  {SKILLS_OPTIONS.map((skill) => <option key={skill} value={skill}>{skill}</option>)}
                </select>
                <div className="ep-skills-pill-cloud">
                  {selectedSkills.map((skill) => (
                    <div key={skill} className="ep-skill-pill">
                      {skill}
                      <button className="ep-skill-del-btn" onClick={() => this.handleRemoveSkill(skill)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* --- SOCIAL TAB --- */}
          {activeTab === 'social' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Social & Portfolios</h3>
                <p>Connect your professional networks.</p>
              </div>
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label>GitHub URL</label>
                  <input name="github" value={user.github || ""} onChange={this.handleChange} placeholder="https://github.com/..." />
                </div>
                <div className="ep-field-container">
                  <label>LinkedIn URL</label>
                  <input name="linkedin" value={user.linkedin || ""} onChange={this.handleChange} placeholder="https://linkedin.com/in/..." />
                </div>
                <div className="ep-field-container">
                  <label>Twitter (X)</label>
                  <input name="twitter" value={user.twitter || ""} onChange={this.handleChange} />
                </div>
                <div className="ep-field-container">
                  <label>Discord</label>
                  <input name="discord" value={user.discord || ""} onChange={this.handleChange} />
                </div>
              </div>
            </div>
          )}
        </section>
      </div>
    );
  };
  renderContent = () => {
    const { apiStatus } = this.state;
    switch (apiStatus) {
      case apiStatusConstants.inProgress: return <LoaderView />;
      case apiStatusConstants.failure: return <ErrorView message="Failed to load profile" onRetry={this.getProfile} />;
      case apiStatusConstants.success: return this.renderProfile();
      default: return null;
    }
  };

  render() {
    return (
      <div className="ep-profile-app-container">
        <Header />
        {this.renderContent()}
      </div>
    );
  }
}

const EditProfileWithNavigation = (props) => {
  const navigate = useNavigate();
  return <EditProfile {...props} navigate={navigate} />;
};

export default EditProfileWithNavigation;