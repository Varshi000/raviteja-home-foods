// src/components/UserMenu.jsx
import { useState, useRef, useCallback } from "react";
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
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const btnRef = useRef(null);
  const navigate = useNavigate();

  const closeMenu = useCallback(() => setIsOpen(false), []);

  const toggleMenu = () => {
    if (isOpen) { setIsOpen(false); return; }
    const rect = btnRef.current?.getBoundingClientRect();
    if (rect) {
      setDropdownPos({
        top: rect.bottom + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(true);
  };

  const handleLogout = () => {
    logout();
    closeMenu();
    navigate("/");
  };

  const handleLogin = () => {
    closeMenu();
    navigate("/login");
  };

  const getUserInitials = () => {
    if (!user?.name) return "U";
    return user.name.charAt(0).toUpperCase();
  };

  const userIsAdmin = isAdmin === true;

  const userMenuItems = [
    { icon: <ShoppingBag size={16} />, label: "My Orders", path: "/my-orders" },
    { icon: <Heart size={16} />, label: "Wishlist", path: "/wishlist" },
    { icon: <MapPin size={16} />, label: "Addresses", path: "/addresses" },
  ];

  const adminMenuItems = [
    { icon: <LayoutDashboard size={16} />, label: "Admin Dashboard", path: "/admin/dashboard" },
    { icon: <Boxes size={16} />, label: "Manage Products", path: "/admin/products" },
    { icon: <Tags size={16} />, label: "Manage Categories", path: "/admin/categories" },
    { icon: <ClipboardList size={16} />, label: "All Orders", path: "/admin/orders" },
  ];

  const menuItems = userIsAdmin ? adminMenuItems : userMenuItems;

  return (
    <>
      {/* Transparent backdrop — closes menu when clicking outside */}
      {isOpen && (
        <div
          style={{ position: "fixed", inset: 0, zIndex: 1199 }}
          onClick={closeMenu}
        />
      )}

      <div className="user-menu-container">
        <button
          ref={btnRef}
          className="icon-wrapper user-menu-button"
          onClick={toggleMenu}
          aria-label="Account"
        >
          {isAuthenticated ? (
            <div className="user-avatar">{getUserInitials()}</div>
          ) : (
            <User size={20} strokeWidth={2.2} />
          )}
          <span className="icon-tooltip">Account</span>
        </button>
      </div>

      {/* Dropdown rendered at viewport level via position:fixed — escapes all stacking contexts */}
      {isOpen && (
        <div
          className="user-dropdown"
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 1200,
          }}
          onClick={e => e.stopPropagation()}
        >
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
                    onClick={closeMenu}
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
    </>
  );
}

export default UserMenu;