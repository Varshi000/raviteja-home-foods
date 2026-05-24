// src/components/admin/AdminSidebar.jsx
import { NavLink } from "react-router-dom";
import { 
  FaTachometerAlt, 
  FaBox, 
  FaTags, 
  FaClipboardList,
  FaUsers,
  FaSignOutAlt,
  FaStore
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
    { icon: <FaUsers />, label: "Customers", path: "/admin/customers" },
  ];

  return (
    <div className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-logo">
          <FaStore />
          <span>Admin Panel</span>
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