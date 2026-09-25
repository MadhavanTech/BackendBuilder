import React, { useEffect, useState } from "react";
import {
  User,
  Mail,
  Briefcase,
  Save,
  CheckCircle2,
  Upload,
  Trash2,
  LogOut,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../style/Settings.css";

const PROFILE_KEY = "backendbuilder_profile";
const PROFILE_COOKIE = "backendbuilder_profile";
const PROFILE_COOKIE_MAX = 3800;
const defaultProfile = {
  name: "Madhavan M",
  email: "madhavan@example.com",
  role: "Software Developer",
  image: "",
};

const readProfileCookie = () => {
  const cookie = document.cookie
    .split("; ")
    .find((item) => item.startsWith(`${PROFILE_COOKIE}=`));

  if (!cookie) return {};

  try {
    return JSON.parse(decodeURIComponent(cookie.slice(PROFILE_COOKIE.length + 1))) || {};
  } catch {
    return {};
  }
};

const writeProfileCookie = (profile) => {
  const safeProfile = {
    name: profile.name || "",
    email: profile.email || "",
    role: profile.role || "",
    image: profile.image || "",
  };
  const encodedProfile = encodeURIComponent(JSON.stringify(safeProfile));

  if (encodedProfile.length <= PROFILE_COOKIE_MAX) {
    document.cookie = `${PROFILE_COOKIE}=${encodedProfile}; path=/; max-age=31536000; SameSite=Lax`;
  } else {
    const withoutImage = encodeURIComponent(JSON.stringify({ ...safeProfile, image: "" }));
    document.cookie = `${PROFILE_COOKIE}=${withoutImage}; path=/; max-age=31536000; SameSite=Lax`;
  }
};

const Settings = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [profile, setProfile] = useState(defaultProfile);

  const [profileImage, setProfileImage] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    const savedProfile = localStorage.getItem(PROFILE_KEY);
    const cookieProfile = readProfileCookie();
    let savedValues = {};

    if (savedProfile) {
      try {
        savedValues = JSON.parse(savedProfile) || {};
      } catch (error) {
        console.error("Unable to read saved profile:", error);
      }
    }

    const nextProfile = {
      ...defaultProfile,
      ...savedValues,
      ...cookieProfile,
      ...(user
        ? {
            name: user.name || user.username || savedValues.name || defaultProfile.name,
            email: user.email || savedValues.email || defaultProfile.email,
            role: user.role || savedValues.role || defaultProfile.role,
          }
        : {}),
    };

    setProfile(nextProfile);
    setProfileImage(nextProfile.image || "");
    localStorage.setItem(PROFILE_KEY, JSON.stringify(nextProfile));
    writeProfileCookie(nextProfile);
  }, [user]);

  const persistProfile = (nextProfile, nextImage) => {
    const payload = {
      ...defaultProfile,
      ...nextProfile,
      image: nextImage || "",
      email: nextProfile.email || defaultProfile.email,
    };

    localStorage.setItem(PROFILE_KEY, JSON.stringify(payload));
    writeProfileCookie(payload);
    window.dispatchEvent(new CustomEvent("backendbuilder-profile-updated", { detail: payload }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const imageData = String(reader.result || "");
      setProfileImage(imageData);
      persistProfile(profile, imageData);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = () => {
    setProfileImage("");
    persistProfile(profile, "");
  };

  const handleSave = () => {
    const nextProfile = {
      ...profile,
      image: profileImage,
    };

    setProfile(nextProfile);
    persistProfile(nextProfile, profileImage);
    setMessage("Profile updated successfully.");

    setTimeout(() => {
      setMessage("");
    }, 3000);
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <div className="settings-page">

      <div className="settings-header">
        <h1>Profile</h1>
        <p>Manage your personal information.</p>
      </div>

      {message && (
        <div className="settings-success">
          <CheckCircle2 size={18} />
          <span>{message}</span>
        </div>
      )}

      <div className="profile-card">

        {/* Profile Photo */}
        <div className="profile-photo-section">

          <div className="profile-avatar-wrap">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {profileImage ? (
                  <img src={profileImage} alt="Profile" className="profile-image" />
                ) : (
                  profile.name.charAt(0).toUpperCase()
                )}
              </div>

              <div className="profile-hover-actions">
                <label className="profile-upload-btn" title="Upload photo">
                  <Upload size={16} />
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                </label>

                {profileImage && (
                  <button
                    type="button"
                    className="profile-remove-btn"
                    onClick={handleRemoveImage}
                    title="Remove photo"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </div>
          </div>

          <h2>{profile.name}</h2>
          <p>{profile.role}</p>

        </div>

        {/* Profile Form */}
        <div className="profile-form">

          <div className="profile-field">
            <label>Full Name</label>

            <div className="profile-input">
              <User size={18} />

              <input
                type="text"
                name="name"
                value={profile.name}
                onChange={handleChange}
                placeholder="Enter your full name"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Email Address</label>

            <div className="profile-input">
              <Mail size={18} />

              <input
                type="email"
                name="email"
                value={profile.email}
                onChange={handleChange}
                placeholder="Enter your email"
              />
            </div>
          </div>

          <div className="profile-field">
            <label>Role</label>

            <div className="profile-input">
              <Briefcase size={18} />

              <input
                type="text"
                name="role"
                value={profile.role}
                onChange={handleChange}
                placeholder="Enter your role"
              />
            </div>
          </div>

        </div>

        {/* Save Button */}
        <div className="profile-actions">
          <button
            type="button"
            className="profile-logout-btn"
            onClick={handleLogout}
          >
            <LogOut size={18} />
            Logout
          </button>
          <button
            type="button"
            className="profile-save-btn"
            onClick={handleSave}
          >
            <Save size={18} />
            Save Changes
          </button>
        </div>

      </div>

    </div>
  );
};

export default Settings;