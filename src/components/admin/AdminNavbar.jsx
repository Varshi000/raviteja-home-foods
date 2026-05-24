// src/components/admin/AdminNavbar.jsx
import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaUserCircle, 
  FaSignOutAlt,
  FaCog,
  FaStore,
  FaMoon,
  FaSun
} from "react-icons/fa";
import "./AdminNavbar.css";

function AdminNavbar({ title }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("admin-dark-mode");
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Get user display name
  const displayName = user?.name || user?.fullname || "Administrator";
  const userEmail = user?.email || "admin@ravitejafoods.com";
  const userInitial = displayName.charAt(0).toUpperCase();

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-navbar-title">
          <FaStore className="title-icon" />
          <span>{title || "Dashboard"}</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        {/* Theme Toggle */}
        <button className="nav-icon-btn theme-toggle" onClick={toggleTheme} title="Toggle Theme">
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* User Menu */}
        <div className="admin-user-wrapper">
          <button 
            ref={buttonRef}
            className="admin-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="admin-avatar">
              {userInitial}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{displayName}</span>
              <span className="admin-user-role">Admin</span>
            </div>
            <FaUserCircle className="user-icon" />
          </button>

          {showDropdown && (
            <div ref={dropdownRef} className="admin-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {userInitial}
                </div>
                <div className="dropdown-user-info">
                  <h4>{displayName}</h4>
                  <p>{userEmail}</p>
                </div>
              </div>
              <div className="dropdown-menu">
                <button onClick={() => navigate("/admin/profile")}>
                  <FaUserCircle /> My Profile
                </button>
                <button onClick={() => navigate("/admin/settings")}>
                  <FaCog /> Settings
                </button>
                <div className="dropdown-divider"></div>
                <button className="logout-btn" onClick={handleLogout}>
                  <FaSignOutAlt /> Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

export default AdminNavbar;