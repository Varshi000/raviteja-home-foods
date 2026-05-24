import "./Footer.css";
import { FaTruck, FaStar, FaGift, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="footer">

      <div className="footer-top">
  <div className="footer-item">
    <FaTruck className="icon" />
    <span>WORLDWIDE DELIVERY</span>
  </div>
  <div className="footer-item">
    <FaStar className="icon" />
    <span>FRESHLY MADE</span>
  </div>
  <div className="footer-item">
    <FaGift className="icon" />
    <span>PREMIUM GIFTING</span>
  </div>
  <div className="footer-item">
    <FaMapMarkerAlt className="icon" />
    <span>Find A Store</span>
  </div>
</div>

      <div className="footer-main">

        <div className="footer-col brand-col">
          <Link to="/">
            <img src="/logo.png" alt="Raviteja Home Foods" className="footer-logo" />
          </Link>
          <p>
            More than food — it’s the happiness of family gatherings, the comfort of home, and the taste of traditions passed down with love.
          </p>
        </div>

        <div className="footer-col">
          <h3>SHOP</h3>
          <li>
  <Link to="/category/sweets">
    Sweets
  </Link>
</li>

<li>
  <Link to="/category/namkeen">
    Namkeen
  </Link>
</li>

<li>
  <Link to="/category/pickles">
    Pickles
  </Link>
</li>

<li>
  <Link to="/category/chilli-powders">
    Chilli Powders
  </Link>
</li>

<li>
  <Link to="/category/essentials">
    Daily Essentials
  </Link>
</li>

<li>
  <Link to="/category/gifts">
    Gift Packs
  </Link>
</li>
        </div>

        <div className="footer-col">
         <Link to="/about">About Us</Link>

<Link to="/contact">Contact Us</Link>

<Link to="/shipping-policy">
  Shipping Policy
</Link>

<Link to="/privacy-policy">
  Privacy Policy
</Link>

<Link to="/terms">
  Terms & Conditions
</Link>
        </div>

        <div className="footer-col">
          <h3>NEWSLETTER</h3>
          <p>
            Sign up for exclusive offers, festive launches and family flavours.
          </p>

          <input type="email" placeholder="Enter your email" />
          <button>SUBSCRIBE</button>
        </div>

      </div>

      <div className="footer-bottom">
        © 2026 Raviteja Home Foods. All Rights Reserved.
      </div>

    </footer>
  );
}

export default Footer;