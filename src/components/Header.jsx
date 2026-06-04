// src/components/Header.jsx
import "./Header.css";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useState, useContext, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { CartContext } from "../context/CartContext";
import UserMenu from "./UserMenu";
import { ShoppingCart, X, Menu, ChevronDown } from "lucide-react";
import { fetchCategoriesWithSubcategories } from "../services/api";

const SWEETS_SUBCATEGORIES = [
  { label: "Traditional Sweets",  dbValue: "Traditional Sweets" },
  { label: "Milk Based Sweets",   dbValue: "Milk Based Sweets" },
  { label: "Maida Based Pakam",   dbValue: "Maida Based Pakam" },
  { label: "Dry Fruit Sweets",    dbValue: "Dry Fruit Sweets" },
  { label: "Bites And Chikkis",   dbValue: "Bites And Chikkis" },
  { label: "Sugar Free Sweets",   dbValue: "Sugar Free Sweets" },
  { label: "Other Sweets",        dbValue: "Other Sweets" },
];

const PICKLES_SUBCATEGORIES = [
  { label: "Vegetarian Pickles",     dbValue: "Vegatarian Pickles" },
  { label: "Non Vegetarian Pickles", dbValue: "Non Vegetarian Pickles" },
];

const FALLBACK_NAV_ITEMS = [
  {
    label: "SWEETS",
    to: "/category/sweets",
    subcategories: SWEETS_SUBCATEGORIES,
    key: "sweets",
  },
  { label: "NAMKEEN",          to: "/category/namkeen",          key: "namkeen" },
  {
    label: "PICKLES",
    to: "/category/pickles",
    subcategories: PICKLES_SUBCATEGORIES,
    key: "pickles",
  },
  { label: "DAILY ESSENTIALS", to: "/category/daily-essentials", key: "daily-essentials" },
  { label: "CHILLI POWDERS",   to: "/category/chilli-powders",   key: "chilli-powders" },
  { label: "GIFT PACKS",       to: "/category/gift-packs",       key: "gift-packs" },
];

function Header() {
  const { cartItems } = useContext(CartContext);
  const { isAdmin } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [expandedMobileItem, setExpandedMobileItem] = useState(null);
  const [navItems, setNavItems] = useState(FALLBACK_NAV_ITEMS);
  const closeTimer = useRef(null);

  const navigate = useNavigate();
  const location = useLocation();

  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  // Add shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch categories with subcategories from the endpoint
  useEffect(() => {
    const loadHeaderCategories = async () => {
      try {
        const response = await fetchCategoriesWithSubcategories();
        if (response && Array.isArray(response.data) && response.data.length > 0) {
          const mapped = response.data.map((cat) => {
            const slug = cat.name.toLowerCase().trim().replace(/\s+/g, "-");
            return {
              label: cat.name.toUpperCase(),
              to: `/category/${slug}`,
              key: slug,
              subcategories: cat.subcategory && Array.isArray(cat.subcategory) && cat.subcategory.length > 0
                ? cat.subcategory.map((sub) => ({
                    label: sub.name,
                    dbValue: sub.name,
                  }))
                : null,
            };
          });
          setNavItems(mapped);
        }
      } catch (err) {
        console.error("Failed to load header categories:", err);
      }
    };
    loadHeaderCategories();
  }, []);

  // Close mobile drawer on route change
  useEffect(() => {
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const handleMouseEnter = (key) => {
    clearTimeout(closeTimer.current);
    setOpenDropdown(key);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const handleSubcategoryClick = (mainCategory, sub) => {
    navigate(
      `/category/${mainCategory}?subcategory=${encodeURIComponent(sub.dbValue)}&label=${encodeURIComponent(sub.label)}`
    );
    setOpenDropdown(null);
    setMobileMenuOpen(false);
  };

  const isActive = (to) => location.pathname.startsWith(to);

  return (
    <header className={`main-header ${scrolled ? "scrolled" : ""}`}>
      {/* Logo */}
      <div className="logo-section">
        <Link to="/">
          <img src="/logo.png" alt="Raviteja Home Foods" className="site-logo" />
        </Link>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="desktop-nav">
        {navItems.map((item) =>
          item.subcategories && item.subcategories.length > 0 ? (
            <div
              key={item.key}
              className={`nav-item dropdown ${isActive(item.to) ? "active" : ""}`}
              onMouseEnter={() => handleMouseEnter(item.key)}
              onMouseLeave={handleMouseLeave}
            >
              <Link to={item.to} className="nav-link">
                {item.label}
                <ChevronDown
                  size={12}
                  className={`dropdown-arrow ${openDropdown === item.key ? "open" : ""}`}
                />
              </Link>

              {openDropdown === item.key && (
                <div
                  className="dropdown-menu"
                  onMouseEnter={() => handleMouseEnter(item.key)}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    to={item.to}
                    className="dropdown-item view-all"
                    onClick={() => setOpenDropdown(null)}
                  >
                    View All {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                  </Link>
                  <div className="dropdown-divider" />
                  {item.subcategories.map((sub) => (
                    <button
                      key={sub.dbValue}
                      className="dropdown-item"
                      onClick={() => handleSubcategoryClick(item.key, sub)}
                    >
                      {sub.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Link
              key={item.key}
              to={item.to}
              className={`nav-link ${isActive(item.to) ? "active" : ""}`}
            >
              {item.label}
            </Link>
          )
        )}
      </nav>

      {/* Right Utility Icons */}
      <div className="header-icons">
        {/* User Menu (login / profile) */}
        <UserMenu />

        {/* Cart (hide for admin users) */}
        {!isAdmin && (
          <Link to="/cart" className="icon-wrapper cart-link" aria-label="Cart" title="Cart">
            <ShoppingCart size={20} strokeWidth={2.2} />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount > 99 ? "99+" : cartItemCount}</span>
            )}
            <span className="icon-tooltip">Cart</span>
          </Link>
        )}

        {/* Hamburger Menu Icon (Mobile Only) */}
        <button
          className="icon-wrapper hamburger-menu-btn"
          onClick={() => setMobileMenuOpen(true)}
          aria-label="Open Menu"
          title="Menu"
        >
          <Menu size={20} strokeWidth={2.2} />
        </button>
      </div>

      {/* Mobile Drawer Navigation overlay */}
      <div 
        className={`mobile-menu-drawer-backdrop ${mobileMenuOpen ? "open" : ""}`} 
        onClick={() => setMobileMenuOpen(false)}
      >
        <div 
          className={`mobile-menu-drawer ${mobileMenuOpen ? "open" : ""}`} 
          onClick={(e) => e.stopPropagation()}
        >
          <div className="drawer-header">
            <h3>Menu</h3>
            <button className="drawer-close-btn" onClick={() => setMobileMenuOpen(false)}>
              <X size={20} />
            </button>
          </div>
          <div className="drawer-content">
            <nav className="mobile-nav">
              {navItems.map((item) => {
                const hasSub = item.subcategories && item.subcategories.length > 0;
                const isExpanded = expandedMobileItem === item.key;
                return (
                  <div key={item.key} className="mobile-nav-item">
                    <div className="mobile-nav-link-row">
                      <Link 
                        to={item.to} 
                        className={`mobile-nav-link ${isActive(item.to) ? "active" : ""}`}
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        {item.label}
                      </Link>
                      {hasSub && (
                        <button
                          className="mobile-expand-btn"
                          onClick={() => setExpandedMobileItem(isExpanded ? null : item.key)}
                        >
                          <ChevronDown size={18} className={`expand-chevron ${isExpanded ? "rotated" : ""}`} />
                        </button>
                      )}
                    </div>
                    {hasSub && isExpanded && (
                      <div className="mobile-submenu">
                        <Link
                          to={item.to}
                          className="mobile-submenu-item view-all"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          View All {item.label.charAt(0) + item.label.slice(1).toLowerCase()}
                        </Link>
                        {item.subcategories.map((sub) => (
                          <button
                            key={sub.dbValue}
                            className="mobile-submenu-item"
                            onClick={() => handleSubcategoryClick(item.key, sub)}
                          >
                            {sub.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
