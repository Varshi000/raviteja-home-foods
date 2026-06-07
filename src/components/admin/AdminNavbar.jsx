// src/components/admin/AdminNavbar.jsx
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { 
  FaBars,
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const userBtnRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/admin-login");
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    document.body.classList.toggle("admin-dark-mode");
  };

  const openUserDropdown = () => {
    if (showDropdown) { setShowDropdown(false); return; }
    const rect = userBtnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({ top: rect.bottom + 8, right: window.innerWidth - rect.right });
    }
    setShowDropdown(true);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };

  const closeAll = useCallback(() => {
    setShowDropdown(false);
    setSidebarOpen(false);
  }, []);

  useEffect(() => {
    const sidebar = document.querySelector(".admin-sidebar");
    if (!sidebar) return;
    if (sidebarOpen) {
      sidebar.classList.add("mobile-open");
    } else {
      sidebar.classList.remove("mobile-open");
    }
  }, [sidebarOpen]);

  const toggleSidebar = () => {
    setSidebarOpen(prev => !prev);
  };

  const isAnyOpen = showDropdown;

  return (
    <>
      {/* Transparent full-screen backdrop — clicking anywhere outside closes dropdowns */}
      {isAnyOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1099 }}
          onClick={closeAll}
        />
      )}

      <nav className="admin-navbar">
        <div className="admin-navbar-left">
          <button className="sidebar-toggle-btn" onClick={toggleSidebar} aria-label="Open admin menu">
            <FaBars />
          </button>
          <div className="admin-navbar-title">
            <FaStore className="title-icon" />
            <span>{title || "Dashboard"}</span>
          </div>
        </div>

        <div className="admin-navbar-center">
          <div className="admin-search-bar">
            {/* <FaSearch className="search-icon" /> */}
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

          {/* User button */}
          <div className="admin-user-wrapper">
            <button
              ref={userBtnRef}
              className="admin-user-btn"
              onClick={openUserDropdown}
            >
              <div className="admin-avatar">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="admin-user-info">
                <span className="admin-user-name">{user?.name || "Administrator"}</span>
                <span className="admin-user-role">Admin</span>
              </div>
            </button>
          </div>
        </div>
      </nav>

      {sidebarOpen && <div className="sidebar-overlay active" onClick={closeSidebar} />}

      {/* ── User dropdown — rendered at document root level via fixed position ── */}
      {showDropdown && (
        <div
          className="admin-dropdown"
          style={{ position: "fixed", top: dropdownPos.top, right: dropdownPos.right, zIndex: 1100 }}
          onClick={e => e.stopPropagation()}
        >
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
            <button onClick={() => { alert("My Profile feature is coming soon!"); closeAll(); }}>
              <FaUserCircle /> My Profile
            </button>
            <button onClick={() => { alert("Settings feature is coming soon!"); closeAll(); }}>
              <FaCog /> Settings
            </button>
            <div className="dropdown-divider"></div>
            <button className="logout-btn" onClick={handleLogout}>
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AdminNavbar;
