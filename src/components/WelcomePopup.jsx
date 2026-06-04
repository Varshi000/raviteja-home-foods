import { useEffect, useState } from "react";
import "./WelcomePopup.css";

import popupImg from "/src/assets/about/family.png";

function WelcomePopup() {

  const [showPopup, setShowPopup] =
    useState(false);

  useEffect(() => {

    const alreadyShown =
      sessionStorage.getItem("popupShown");

    if (!alreadyShown) {

      setTimeout(() => {

        setShowPopup(true);

        sessionStorage.setItem(
          "popupShown",
          "true"
        );

      }, 1200);

    }

  }, []);

  if (!showPopup) return null;

  return (

    <div className="popup-overlay">

      <div className="popup-container">

        {/* CLOSE BUTTON */}

        <button
          className="popup-close"
          onClick={() => setShowPopup(false)}
        >
          ✕
        </button>

        {/* IMAGE */}

        <div className="popup-image">

          <img
            src={popupImg}
            alt="Popup"
          />

        </div>

        {/* CONTENT */}

        <div className="popup-content">

          <span>
            RAVITEJA HOME FOODS
          </span>

          <h1>
            Taste The Warmth
            <br />
            Of Tradition ❤️
          </h1>

          <p>
            Homemade Telugu flavors,
            sweets, pickles,
            namkeen, and festive happiness
            crafted with love.
          </p>

          <button
            className="popup-btn"
            onClick={() => setShowPopup(false)}
          >
            Explore Our World →
          </button>

        </div>

      </div>

    </div>

  );
}

export default WelcomePopup;
