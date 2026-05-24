// src/components/admin/AdminNavbar.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaBell, 
  FaUserCircle, 
  FaSignOutAlt,
  FaCog,
  FaStore,
  FaMoon,
  FaSun,
  FaSearch
} from "react-icons/fa";
import "./AdminNavbar.css";

function AdminNavbar({ title }) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
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

  const notifications = [
    { id: 1, message: "New order #ORD123 received", time: "2 min ago", read: false },
    { id: 2, message: "Product 'Kaju Barfi' low in stock", time: "1 hour ago", read: false },
    { id: 3, message: "Customer review added", time: "3 hours ago", read: true },
  ];

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <nav className="admin-navbar">
      <div className="admin-navbar-left">
        <div className="admin-navbar-title">
          <FaStore className="title-icon" />
          <span>{title || "Dashboard"}</span>
        </div>
      </div>

      <div className="admin-navbar-center">
        <div className="admin-search-bar">
          <FaSearch className="search-icon" />
          <input 
            type="text" 
            placeholder="Search products, orders, customers..." 
            className="admin-search-input"
          />
          <span className="search-shortcut">⌘K</span>
        </div>
      </div>

      <div className="admin-navbar-right">
        {/* Theme Toggle */}
        <button className="nav-icon-btn" onClick={toggleTheme}>
          {isDarkMode ? <FaSun /> : <FaMoon />}
        </button>

        {/* Notifications */}
        <div className="notification-wrapper">
          <button 
            className="nav-icon-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <FaBell />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>
          
          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h4>Notifications</h4>
                <button className="mark-all-read">Mark all read</button>
              </div>
              <div className="notification-list">
                {notifications.map(notif => (
                  <div key={notif.id} className={`notification-item ${!notif.read ? 'unread' : ''}`}>
                    <div className="notification-dot"></div>
                    <div className="notification-content">
                      <p>{notif.message}</p>
                      <span>{notif.time}</span>
                    </div>
                  </div>
                ))}
              </div>
              <div className="notification-footer">
                <button>View All Notifications</button>
              </div>
            </div>
          )}
        </div>

        {/* User Menu */}
        <div className="admin-user-wrapper">
          <button 
            className="admin-user-btn"
            onClick={() => setShowDropdown(!showDropdown)}
          >
            <div className="admin-avatar">
              {user?.name?.charAt(0) || 'A'}
            </div>
            <div className="admin-user-info">
              <span className="admin-user-name">{user?.name || "Administrator"}</span>
              <span className="admin-user-role">Admin</span>
            </div>
            <FaUserCircle className="user-icon" />
          </button>

          {showDropdown && (
            <div className="admin-dropdown">
              <div className="dropdown-header">
                <div className="dropdown-avatar">
                  {user?.name?.charAt(0) || 'A'}
                </div>
                <div className="dropdown-user-info">
                  <h4>{user?.name || "Administrator"}</h4>
                  <p>{user?.email || "admin@ravitejafoods.com"}</p>
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