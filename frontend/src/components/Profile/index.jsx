import React, { Component } from "react";
import Header from "../Header";
import "./index.css";

import { LoaderView, ErrorView } from "../Common";

const BASE_URL =
  location.hostname === "localhost"
    ? "http://localhost:7777"
    : "/api";

const apiStatusConstants = {
  initial: "INITIAL",
  success: "SUCCESS",
  failure: "FAILURE",
  inProgress: "IN_PROGRESS",
};

const SKILLS_OPTIONS = [
  "JavaScript", "React", "Node.js", "Python", "C", "Java", "C++", "Django", "MongoDB", "CSS", "HTML", "TypeScript",
  "Next.js", "Express.js", "Redux", "Tailwind CSS", "Bootstrap", "Git", "REST APIs", "Firebase", "GraphQL", "Cyber Security"
];

const GENDER_OPTIONS = [
  { label: "Male", value: "male" },
  { label: "Female", value: "female" },
  { label: "Other", value: "other" },
];

class Profile extends Component {
  // Initialize state replacing useState hooks
  state = {
    user: {},
    selectedSkills: [],
    apiStatus: apiStatusConstants.initial,
  };

  // Replaces useEffect with empty dependency array
  componentDidMount() {
    this.getProfile();
  }

  // Fetch Profile Data
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

  // Handle input changes for the user object
  handleChange = (e) => {
    const { name, value } = e.target;
    this.setState((prevState) => ({
      user: { ...prevState.user, [name]: value },
    }));
  };

  handleAddSkill = (e) => {
    const skill = e.target.value;
    const { selectedSkills } = this.state;
    if (skill && !selectedSkills.includes(skill)) {
      this.setState((prevState) => ({
        selectedSkills: [...prevState.selectedSkills, skill],
      }));
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
    const { user, selectedSkills } = this.state;
    try {
      const updatedData = {
        firstName: user.firstName,
        lastName: user.lastName,
        photoUrl: user.photoUrl,
        gender: user.gender,
        age: user.age,
        about: user.about,
        skills: selectedSkills,
        experience: user.experience,
        github: user.github,
        linkedin: user.linkedin,
        twitter: user.twitter,
        discord: user.discord,
      };

      const res = await fetch(`${BASE_URL}/profile/edit`, {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedData),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.error || "Unknown error");

      alert(data.message);
      this.setState({ user: data.data });
    } catch (err) {
      alert("Error updating profile: " + err.message);
    }
  };

  // SUCCESS VIEW
  renderProfile = () => {
    const { user, selectedSkills } = this.state;
    return (
      <div className="profile-main-container">
        <div className="profile-card">
          <h1 className="profile-title">Edit Profile</h1>
          <p className="profile-subtitle">Update your details below.</p>

          <div className="profile-image-section">
            <img
              src={user.photoUrl || "/default-profile.png"}
              alt="profile"
              className="profile-image"
            />
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
              className="input"
              placeholder="Email"
              value={user.emailId || ""}
              readOnly
            />
            <input
              name="age"
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
              <option value="" disabled>
                Select Gender
              </option>
              {GENDER_OPTIONS.map((g) => (
                <option key={g.value} value={g.value}>
                  {g.label}
                </option>
              ))}
            </select>

            <input
              name="experience"
              className="input"
              placeholder="Experience (years)"
              value={user.experience || ""}
              onChange={this.handleChange}
            />
          </div>

          <h2 className="section-title">Image URL</h2>
          <div className="form-row">
            <input
              name="photoUrl"
              className="input imageinput"
              value={user.photoUrl || ""}
              onChange={this.handleChange}
            />
          </div>

          <h2 className="section-title">About</h2>
          <div className="form-row">
            <textarea
              name="about"
              className="textarea about"
              value={user.about || ""}
              onChange={this.handleChange}
            />
          </div>

          <h2 className="section-title">Skills</h2>

          <div className="form-row">
            <select
              className="skills-select"
              onChange={this.handleAddSkill}
              defaultValue=""
            >
              <option value="" disabled>
                Select a skill
              </option>
              {SKILLS_OPTIONS.map((skill) => (
                <option key={skill} value={skill}>
                  {skill}
                </option>
              ))}
            </select>
          </div>

          <div className="skills-container">
            {selectedSkills.map((skill, index) => (
              <div key={index} className="skill-tag">
                {skill}
                <span
                  className="skill-remove"
                  onClick={() => this.handleRemoveSkill(skill)}
                >
                  ×
                </span>
              </div>
            ))}
          </div>

          <h2 className="section-title">Social</h2>

          <div className="form-row">
            <div className="sub-form-row">
              <label>GitHub</label>
              <input
                name="github"
                className="input"
                placeholder="GitHub URL"
                value={user.github || ""}
                onChange={this.handleChange}
              />
            </div>

            <div className="sub-form-row">
              <label>LinkedIn</label>
              <input
                name="linkedin"
                className="input"
                placeholder="LinkedIn URL"
                value={user.linkedin || ""}
                onChange={this.handleChange}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="sub-form-row">
              <label>Twitter</label>
              <input
                name="twitter"
                className="input"
                placeholder="Twitter URL"
                value={user.twitter || ""}
                onChange={this.handleChange}
              />
            </div>

            <div className="sub-form-row">
              <label>Discord</label>
              <input
                name="discord"
                className="input"
                placeholder="Discord URL"
                value={user.discord || ""}
                onChange={this.handleChange}
              />
            </div>
          </div>

          <button className="save-btn" onClick={this.handleSave}>
            Save Changes
          </button>
        </div>
      </div>
    );
  };

  // Main status switcher
  renderContent = () => {
    const { apiStatus } = this.state;
    switch (apiStatus) {
      case apiStatusConstants.inProgress:
        return <LoaderView />;

      case apiStatusConstants.failure:
        return (
          <ErrorView message="Failed to load profile" onRetry={this.getProfile} />
        );

      case apiStatusConstants.success:
        return this.renderProfile();

      default:
        return null;
    }
  };

  render() {
    return (
      <>
        <Header />
        {this.renderContent()}
      </>
    );
  }
}

export default Profile;