// src/components/admin/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaBox, 
  FaTags, 
  FaClipboardList,
  FaSignOutAlt,
  FaStore,
  FaTruck,
  FaTicketAlt,
  FaExclamationCircle
} from "react-icons/fa";
import { useAuth } from "../../context/AuthContext";
import "./AdminSidebar.css";

function AdminSidebar() {
  const { logout } = useAuth();

  const menuItems = [
    { icon: <FaTachometerAlt />, label: "Dashboard", path: "/admin/dashboard" },
    { icon: <FaBox />, label: "Products", path: "/admin/products" },
    { icon: <FaTags />, label: "Categories", path: "/admin/categories" },
    { icon: <FaClipboardList />, label: "Orders", path: "/admin/orders" },
    { icon: <FaTruck />, label: "Shipping", path: "/admin/shipping" },
    { icon: <FaTicketAlt />, label: "Coupons", path: "/admin/coupons" },
    { icon: <FaExclamationCircle />, label: "Issues", path: "/admin/issues" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo-container">
          <div className="admin-logo-wrapper">
            <img src="/images/logo.png" alt="Raviteja Home Foods" className="admin-logo-img" />
          </div>
          <div className="admin-branding">
            <div className="admin-brand-text">
              <span className="admin-brand-main">Admin</span>
              <span className="admin-brand-sub">Panel</span>
            </div>
          </div>
        </div>
      </div>

      <nav className="admin-nav">
        {menuItems.map((item, index) => (
          <NavLink
            key={index}
            to={item.path}
            className={({ isActive }) => 
              isActive ? "admin-nav-item active" : "admin-nav-item"
            }
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="admin-sidebar-footer">
        <button className="admin-logout-btn" onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

export default AdminSidebar;