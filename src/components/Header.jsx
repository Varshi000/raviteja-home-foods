// src/components/Header.jsx
import "./Header.css";
import { Link } from "react-router-dom";
import { FaSearch, FaShoppingCart } from "react-icons/fa";
import { useState, useContext } from "react";
import { CartContext } from "../context/CartContext";
import UserMenu from "./UserMenu";

function Header() {
  const { cartItems } = useContext(CartContext);
  const [searchActive, setSearchActive] = useState(false);
  
  const cartItemCount = cartItems?.reduce((total, item) => total + item.quantity, 0) || 0;

  return (
    <header className="main-header">
      <div className="logo-section">
        <Link to="/">
          <img src="/logo.png" alt="Logo" className="site-logo" />
        </Link>
      </div>

      {/* Search Overlay */}
      {searchActive && (
        <div className="search-overlay">
          <input 
            type="text" 
            placeholder="Search for sweets, namkeen, pickles..." 
            className="search-input"
            autoFocus
          />
          <button onClick={() => setSearchActive(false)}>✕</button>
        </div>
      )}

      <div className="header-icons">
        <div className="icon-wrapper search-icon" onClick={() => setSearchActive(true)}>
          <FaSearch />
          <span className="icon-tooltip">Search</span>
        </div>
        
        {/* Replace old login icon with UserMenu */}
        <UserMenu />
        
        <Link to="/cart" className="icon-wrapper cart-link">
          <FaShoppingCart />
          {cartItemCount > 0 && (
            <span className="cart-badge">{cartItemCount}</span>
          )}
          <span className="icon-tooltip">Cart</span>
        </Link>
      </div>
    </header>
  );
}

export default Header;