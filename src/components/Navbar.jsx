// src/components/Navbar.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [openDropdown, setOpenDropdown] = useState(null);
  const navigate = useNavigate();

  // Sweets subcategories
  const sweetsSubcategories = [
    "Traditional Sweets",
    "Milk Based Sweets",
    "Maida Based Pakam",
    "Dry Fruit Sweets",
    "Bites And Chikkis",
    "Sugar Free Sweets",
    "Other Sweets"
  ];

  // Pickles subcategories
  const picklesSubcategories = [
    "Vegetarian Pickles",
    "Non Vegetarian Pickles"
  ];

  const handleMouseEnter = (dropdown) => {
    setOpenDropdown(dropdown);
  };

  const handleMouseLeave = () => {
    setOpenDropdown(null);
  };

  const handleSubcategoryClick = (mainCategory, subcategory) => {
    navigate(`/category/${mainCategory}?subcategory=${encodeURIComponent(subcategory)}`);
    setOpenDropdown(null);
  };

  return (
    <nav className="navbar">
      {/* SWEETS with Dropdown */}
      <div 
        className="nav-item dropdown"
        onMouseEnter={() => handleMouseEnter("sweets")}
        onMouseLeave={handleMouseLeave}
      >
        <span className="nav-link">
          <Link to="/category/sweets" >
              SWEETS <span className="dropdown-arrow">▼</span>
            </Link>
        
        </span>
        {openDropdown === "sweets" && (
          <div className="dropdown-menu">
            
            <div className="dropdown-divider"></div>
            {sweetsSubcategories.map((sub) => (
              <button
                key={sub}
                className="dropdown-item"
                onClick={() => handleSubcategoryClick("sweets", sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* NAMKEEN - No dropdown */}
      <Link to="/category/namkeen" className="nav-link">NAMKEEN</Link>

      {/* PICKLES with Dropdown */}
      <div 
        className="nav-item dropdown"
        onMouseEnter={() => handleMouseEnter("pickles")}
        onMouseLeave={handleMouseLeave}
      >
        <span className="nav-link">
            <Link to="/category/pickles">
              PICKLES <span className="dropdown-arrow">▼</span>
            </Link>
        
        </span>
        {openDropdown === "pickles" && (
          <div className="dropdown-menu">
            
            <div className="dropdown-divider"></div>
            {picklesSubcategories.map((sub) => (
              <button
                key={sub}
                className="dropdown-item"
                onClick={() => handleSubcategoryClick("pickles", sub)}
              >
                {sub}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* DAILY ESSENTIALS - No dropdown */}
      <Link to="/category/daily-essentials" className="nav-link">DAILY ESSENTIALS</Link>

      {/* CHILLI POWDERS - No dropdown */}
      <Link to="/category/chilli-powders" className="nav-link">CHILLI POWDERS</Link>

     
    </nav>
  );
}

export default Navbar;