// src/components/UserMenu.jsx
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  User,
  ShoppingBag,
  Heart,
  MapPin,
  LayoutDashboard,
  Boxes,
  Tags,
  ClipboardList,
  LogOut,
} from "lucide-react";
import "./UserMenu.css";

function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const menuRef = useRef(null);
  const navigate = useNavigate();

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate("/");
  };

  const handleLogin = () => {
    setIsOpen(false);
    navigate("/login");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  // Check if user is admin (isAdmin is a boolean from AuthContext)
  const userIsAdmin = isAdmin === true;

  // Regular user menu items
  const userMenuItems = [
    { icon: <ShoppingBag size={16} />, label: "My Orders", path: "/my-orders" },
    { icon: <Heart size={16} />, label: "Wishlist", path: "/wishlist" },
    { icon: <MapPin size={16} />, label: "Addresses", path: "/addresses" },
  ];

  // Admin menu items (extra)
  const adminMenuItems = [
    { icon: <LayoutDashboard size={16} />, label: "Admin Dashboard", path: "/admin/dashboard" },
    { icon: <Boxes size={16} />, label: "Manage Products", path: "/admin/products" },
    { icon: <Tags size={16} />, label: "Manage Categories", path: "/admin/categories" },
    { icon: <ClipboardList size={16} />, label: "All Orders", path: "/admin/orders" },
  ];

  const menuItems = userIsAdmin ? [...adminMenuItems, ...userMenuItems] : userMenuItems;

  return (
    <div className="user-menu-container" ref={menuRef}>
      <button 
        className="icon-wrapper user-menu-button" 
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Account"
      >
        {isAuthenticated ? (
          <div className="user-avatar">{getUserInitials()}</div>
        ) : (
          <User size={20} strokeWidth={2.2} />
        )}
        <span className="icon-tooltip">Account</span>
      </button>

      {isOpen && (
        <div className="user-dropdown">
          {isAuthenticated ? (
            <>
              <div className="dropdown-user-info">
                <h4>{user?.name || "Welcome!"}</h4>
                <p>{user?.email}</p>
                {userIsAdmin && <span className="admin-badge">Administrator</span>}
              </div>

              <div className="dropdown-menu-items">
                {menuItems.map((item, index) => (
                  <Link
                    key={index}
                    to={item.path}
                    className="dropdown-item"
                    onClick={() => setIsOpen(false)}
                  >
                    <span className="icon">{item.icon}</span>
                    <span>{item.label}</span>
                  </Link>
                ))}

                <div className="divider"></div>

                <div className="dropdown-item logout-item" onClick={handleLogout}>
                  <span className="icon"><LogOut size={16} /></span>
                  <span>Logout</span>
                </div>
              </div>
            </>
          ) : (
            <div className="login-prompt">
              <p>Sign in to access your orders, wishlist, and more!</p>
              <button className="login-btn-dropdown" onClick={handleLogin}>
                Sign In / Register
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default UserMenu;