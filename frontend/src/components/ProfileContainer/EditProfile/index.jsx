import React, { Component } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../../Header";
import { Camera, Briefcase, Handshake } from "lucide-react";
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

const ROLE_OPTIONS = [
  "Frontend Developer", "Backend Developer", "Full Stack Developer", 
  "Mobile App Developer", "DevOps Engineer", "Data Scientist", 
  "UI/UX Designer", "Product Manager", "System Architect", 
  "QA Engineer", "Security Analyst", "Cloud Architect"
];

const CONNECTION_STATUS_OPTIONS = [
  { label: "Seeking Opportunities", value: "seeking opportunities" },
  { label: "Open to Collaboration", value: "open to collaboration" },
  { label: "Available for Mentorship", value: "available for mentorship" },
  { label: "Networking Exclusively", value: "networking exclusively" },
  { label: "Currently Engaged", value: "currently engaged" },
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

class EditProfile extends Component {
  state = {
    user: {},
    selectedRoles: [],
    apiStatus: apiStatusConstants.initial,
    isUpdatingProfile: false,
    previewImg: null, 
    activeTab: "general",
    toast: { message: "", type: "" }
  };

  componentDidMount() {
    this.getProfile();
  }

  showToast = (message, type = "error") => {
    this.setState({ toast: { message, type } });
    setTimeout(() => {
      this.setState({ toast: { message: "", type: "" } });
    }, 4000); 
  };

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
        selectedRoles: data.roles || [],
        apiStatus: apiStatusConstants.success,
      });
    } catch (err) {
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

  handleAddRole = (e) => {
    const role = e.target.value;
    const { selectedRoles } = this.state;
    if (role && !selectedRoles.includes(role) && selectedRoles.length < 5) {
      this.setState({ selectedRoles: [...selectedRoles, role] });
    } else if (selectedRoles.length >= 5) {
      this.showToast("You can select up to 5 professional roles.", "error");
    }
  };

  handleRemoveRole = (roleToRemove) => {
    this.setState((prevState) => ({
      selectedRoles: prevState.selectedRoles.filter(
        (role) => role !== roleToRemove
      ),
    }));
  };

  handleSave = async () => {
    const { user, selectedRoles, previewImg } = this.state;
    this.setState({ isUpdatingProfile: true });

    try {
      const updatedData = {
        firstName: user.firstName,
        lastName: user.lastName,
        gender: user.gender,
        age: user.age,
        about: user.about,
        roles: selectedRoles, 
        connectionStatus: user.connectionStatus, 
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
      
      if (!res.ok) {
        // Extracting specific Mongoose validation error from backend
        throw new Error(data.message || data.error || "Update failed");
      }
      
      this.setState({ 
        user: data.data, 
        isUpdatingProfile: false, 
        previewImg: null 
      });

      this.showToast("Profile updated successfully!", "success");
      setTimeout(() => this.props.navigate("/profile"), 1500);

    } catch (err) {
      this.showToast(err.message, "error");
      this.setState({ isUpdatingProfile: false });
    }
  };  

  renderProfile = () => {
    const { user, selectedRoles, isUpdatingProfile, previewImg, activeTab } = this.state;

    return (
      <div className="ep-profile-dashboard-layout">
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
              {isUpdatingProfile ? "Updating..." : "Save Changes"}
            </button>
          </div>

          <nav className="ep-profile-navigation-tabs">
            <button className={`ep-tab-link ${activeTab === 'general' ? 'ep-active' : ''}`} onClick={() => this.setState({ activeTab: 'general' })}>General</button>
            <button className={`ep-tab-link ${activeTab === 'pro' ? 'ep-active' : ''}`} onClick={() => this.setState({ activeTab: 'pro' })}>Professional</button>
            <button className={`ep-tab-link ${activeTab === 'social' ? 'ep-active' : ''}`} onClick={() => this.setState({ activeTab: 'social' })}>Social Presence</button>
          </nav>
        </section>

        <section className="ep-profile-form-surface">
          {activeTab === 'general' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Personal Information</h3>
                <p>Basic details to help people know who you are.</p>
              </div>
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label>First Name</label>
                  <input name="firstName" value={user.firstName || ""} onChange={this.handleChange} />
                </div>
                <div className="ep-field-container">
                  <label>Last Name</label>
                  <input name="lastName" value={user.lastName || ""} onChange={this.handleChange} />
                </div>
                <div className="ep-field-container">
                  <label>Age</label>
                  <input name="age" type="number" value={user.age || ""} onChange={this.handleChange} />
                </div>
                <div className="ep-field-container">
                  <label>Gender</label>
                  <select name="gender" value={user.gender || ""} onChange={this.handleChange}>
                    <option value="" disabled>Select</option>
                    {GENDER_OPTIONS.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
                  </select>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'pro' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Professional Identity</h3>
                <p>Define your role and current status in the ecosystem.</p>
              </div>
              
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label><Briefcase size={14} style={{marginRight: '4px'}}/>Current Focus</label>
                  <select name="connectionStatus" value={user.connectionStatus || "seeking opportunities"} onChange={this.handleChange}>
                    {CONNECTION_STATUS_OPTIONS.map((status) => (
                      <option key={status.value} value={status.value}>{status.label}</option>
                    ))}
                  </select>
                </div>
                <div className="ep-field-container">
                  <label>Years of Experience</label>
                  <input name="experience" type="number" value={user.experience || 0} onChange={this.handleChange} />
                </div>
              </div>

              <div className="ep-field-container ep-full-span">
                <label>
                  Professional Bio 
                  <span style={{ fontSize: '11px', color: (user.about?.length >= 500) ? '#ef4444' : '#6b7280', marginLeft: '10px', textTransform: 'none' }}>
                    ({user.about?.length || 0} / 500)
                  </span>
                </label>
                <textarea 
                  name="about" 
                  value={user.about || ""} 
                  onChange={this.handleChange} 
                  rows="4" 
                  maxLength="500"
                  placeholder="Tell the community about your journey..." 
                />
              </div>

              <div className="ep-form-divider" />

              <div className="ep-form-section-header">
                <h3>Expertise & Roles</h3>
                <p>Select up to 5 roles that best describe your professional career.</p>
              </div>
              
              <div className="ep-roles-management-box">
                <select className="ep-roles-dropdown" onChange={this.handleAddRole} defaultValue="">
                  <option value="" disabled>Add a role...</option>
                  {ROLE_OPTIONS.map((role) => <option key={role} value={role}>{role}</option>)}
                </select>
                <div className="ep-roles-pill-cloud">
                  {selectedRoles.map((role) => (
                    <div key={role} className="ep-role-pill">
                      {role}
                      <button className="ep-role-del-btn" onClick={() => this.handleRemoveRole(role)}>×</button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'social' && (
            <div className="ep-animate-fade-in">
              <div className="ep-form-section-header">
                <h3>Social Presence</h3>
                <p>Links to your professional portfolios and social profiles.</p>
              </div>
              <div className="ep-form-grid-layout">
                <div className="ep-field-container">
                  <label>GitHub</label>
                  <input name="github" value={user.github || ""} onChange={this.handleChange} placeholder="https://github.com/username" />
                </div>
                <div className="ep-field-container">
                  <label>LinkedIn</label>
                  <input name="linkedin" value={user.linkedin || ""} onChange={this.handleChange} placeholder="https://linkedin.com/in/username" />
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
    const { toast } = this.state;
    return (
      <div className="ep-profile-app-container">
        <Header />
        {toast.message && (
          <div className={`ep-toast-notification ${toast.type}`}>
            {toast.message}
          </div>
        )}
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