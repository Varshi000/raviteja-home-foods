import "./Footer.css";
import { FaTruck, FaStar, FaGift, FaMapMarkerAlt } from 'react-icons/fa';
import { Link } from "react-router-dom";

function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

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
          <Link to="/" onClick={scrollToTop}>
            <img src="/logo.png" alt="Raviteja Home Foods" className="footer-logo" />
          </Link>
          <div className="footer-brand-info">
            <p className="brand-plain-line">RAVITEJA<sup>®</sup> Registered Trademark</p>
            <p className="brand-plain-line">Copyright © Raviteja Home Foods Pvt. Ltd.</p>
            <p className="brand-plain-line">Manufacturer FSSAI License No: 23626032003783</p>
            <p className="brand-plain-line">Marketed &amp; Distributed by MOM Global Exports</p>
            <p className="brand-plain-line">Exporter FSSAI License No: 13626999000388</p>
            <p className="brand-plain-line">GSTIN: XXXXXXX</p>
            <p className="brand-plain-line">Customer Care: <a href="tel:+919000319969" className="brand-contact-link">+91 9000319969</a></p>
            <p className="brand-plain-line">Email: <a href="mailto:Raviteja.HF@gmail.com" className="brand-contact-link">Raviteja.HF@gmail.com</a></p>
          </div>
        </div>

        <div className="footer-col">
          <h3>SHOP</h3>
          <li>
            <Link to="/category/sweets" onClick={scrollToTop}>
              Sweets
            </Link>
          </li>

          <li>
            <Link to="/category/namkeen" onClick={scrollToTop}>
              Namkeen
            </Link>
          </li>

          <li>
            <Link to="/category/pickles" onClick={scrollToTop}>
              Pickles
            </Link>
          </li>

          <li>
            <Link to="/category/chilli-powders" onClick={scrollToTop}>
              Chilli Powders
            </Link>
          </li>

          <li>
            <Link to="/category/essentials" onClick={scrollToTop}>
              Daily Essentials
            </Link>
          </li>

          <li>
            <Link to="/category/gifts" onClick={scrollToTop}>
              Gift Packs
            </Link>
          </li>
        </div>

        <div className="footer-col">
         <Link to="/about" onClick={scrollToTop}>About Us</Link>

          <Link to="/contact" onClick={scrollToTop}>Contact Us</Link>

          <Link to="/report-issue" onClick={scrollToTop}>Report an Issue</Link>

          <Link to="/shipping-policy" onClick={scrollToTop}>
            Shipping Policy
          </Link>

          <Link to="/privacy-policy" onClick={scrollToTop}>
            Privacy Policy
          </Link>

          <Link to="/return-refund-policy" onClick={scrollToTop}>
            Return & Refund Policy
          </Link>

          <Link to="/terms" onClick={scrollToTop}>
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
