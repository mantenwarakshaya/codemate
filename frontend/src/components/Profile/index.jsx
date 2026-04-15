import React, { Component } from "react";
import Header from "../Header";
import { Camera } from "lucide-react";
import "./index.css";

import { LoaderView, ErrorView } from "../Common";

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

class Profile extends Component {
  state = {
    user: {},
    selectedSkills: [],
    apiStatus: apiStatusConstants.initial,
    isUpdatingProfile: false,
    previewImg: null, // Holds the base64 string for preview and upload
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
      // Update state with base64 for preview
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
        // Send previewImg (base64) if it exists, otherwise keep existing URL
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

      alert("Profile updated successfully!");
      this.setState({ 
        user: data.data, 
        isUpdatingProfile: false, 
        previewImg: null // Reset preview after successful save
      });
    } catch (err) {
      alert("Error updating profile: " + err.message);
      this.setState({ isUpdatingProfile: false });
    }
  };

  renderProfile = () => {
    const { user, selectedSkills, isUpdatingProfile, previewImg } = this.state;

    return (
      <div className="profile-main-container">
        <div className="profile-card">
          <h1 className="profile-title">Edit Profile</h1>
          <p className="profile-subtitle">Update your developer presence.</p>

          {/* Avatar Upload Section */}
          <div className="profile-container">
            <div className="avatar-wrapper">
              <img
                src={previewImg || user.profilePic || "/avatar.png"}
                alt="Profile"
                className="profile-avatar"
              />
              <label
                htmlFor="avatar-upload"
                className={`upload-button ${isUpdatingProfile ? "upload-loading" : ""}`}
              >
                <Camera className="camera-icon" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden-input"
                  accept="image/*"
                  onChange={this.handleImageUpload}
                  disabled={isUpdatingProfile}
                />
              </label>
            </div>
            <p className="status-text">
              {isUpdatingProfile ? "Processing..." : "Click the camera to change photo"}
            </p>
          </div>

          <h2 className="section-title">Personal Details</h2>
          <div className="form-row">
            <input
              name="firstName"
              className="input"
              placeholder="First Name"
              value={user.firstName || ""}
              onChange={this.handleChange}
            />
            <input
              name="lastName"
              className="input"
              placeholder="Last Name"
              value={user.lastName || ""}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-row">
            <input
              className="input readonly-input"
              placeholder="Email"
              value={user.emailId || ""}
              readOnly
            />
            <input
              name="age"
              type="number"
              className="input"
              placeholder="Age"
              value={user.age || ""}
              onChange={this.handleChange}
            />
          </div>

          <div className="form-row">
            <select
              name="gender"
              className="input"
              value={user.gender || ""}
              onChange={this.handleChange}
            >
              <option value="" disabled>Select Gender</option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>{g.label}</option>
              ))}
            </select>
            <input
              name="experience"
              type="number"
              className="input"
              placeholder="Years of Experience"
              value={user.experience || ""}
              onChange={this.handleChange}
            />
          </div>

          <h2 className="section-title">About</h2>
          <div className="form-row">
            <textarea
              name="about"
              className="textarea about"
              placeholder="Tell us about yourself..."
              value={user.about || ""}
              onChange={this.handleChange}
            />
          </div>

          <h2 className="section-title">Skills</h2>
          <div className="form-row">
            <select className="skills-select" onChange={this.handleAddSkill} defaultValue="">
              <option value="" disabled>Add a skill</option>
              {SKILLS_OPTIONS.map((skill) => (
                <option key={skill} value={skill}>{skill}</option>
              ))}
            </select>
          </div>
          <div className="skills-container">
            {selectedSkills.map((skill) => (
              <div key={skill} className="skill-tag">
                {skill}
                <span className="skill-remove" onClick={() => this.handleRemoveSkill(skill)}>×</span>
              </div>
            ))}
          </div>

          <h2 className="section-title">Social Links</h2>
          <div className="form-row">
            <input name="github" className="input" placeholder="GitHub URL" value={user.github || ""} onChange={this.handleChange} />
            <input name="linkedin" className="input" placeholder="LinkedIn URL" value={user.linkedin || ""} onChange={this.handleChange} />
          </div>
          <div className="form-row">
            <input name="twitter" className="input" placeholder="Twitter URL" value={user.twitter || ""} onChange={this.handleChange} />
            <input name="discord" className="input" placeholder="Discord URL" value={user.discord || ""} onChange={this.handleChange} />
          </div>

          <button 
            className="save-btn" 
            onClick={this.handleSave} 
            disabled={isUpdatingProfile}
          >
            {isUpdatingProfile ? "Saving..." : "Save Changes"}
          </button>
        </div>
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
      <div className="app-container">
        <Header />
        {this.renderContent()}
      </div>
    );
  }
}

export default Profile;