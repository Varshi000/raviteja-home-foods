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
            <p className="brand-legal-line">
              <span className="brand-secret">Trade Secret Protected Formula</span>
            </p>
            <p className="brand-legal-line">
              <span>RAVITEJA<sup>®</sup> Registered Trademark</span>
            </p>
            <p className="brand-legal-line">
              <span>Copyright © Raviteja Home Foods Pvt. Ltd.</span>
            </p>

            {/* FSSAI Badge */}
            <div className="fssai-badge">
              <div className="fssai-logo-wrap">
                <span className="fssai-text">
                  <em className="fssai-f">f</em>ssai
                  <span className="fssai-leaf">🌿</span>
                </span>
                <div className="fssai-bar" />
              </div>
              <p className="fssai-lic">Lic. No. 23626032003783</p>
              <p className="fssai-lic" style={{ marginTop: '4px', fontSize: '0.85em', color: '#888' }}>
                Distributed By MOM GLOBAL EXPORTS <br /> 
                FSSAI Licence no 13626999000388
              </p>
            </div>
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
