import React, { useState, useEffect } from "react";
import "./HeroSlider.css";

import banner1 from "../assets/images/banner1.png";
import banner2 from "../assets/images/banner2.png";
import banner3 from "../assets/images/banner3.png";
import banner4 from "../assets/images/banner4.png";

function HeroSlider() {
  // Using imported assets if available, fallback to placeholders for a premium look
  const images = [banner1, banner2, banner3, banner4];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const slide = setInterval(() => {
      setCurrent((prev) => (prev + 1) % images.length);
    }, 4000);

    return () => clearInterval(slide);
  }, [images.length]);

  return (
    <div className="hero-slider">
      {images.map((img, index) => (
        <div
          key={index}
          className={`hero-slide ${index === current ? "active" : ""}`}
          style={{ backgroundImage: `url(${img})` }}
        >

        </div>
      ))}

      <button
        className="nav-btn prev-btn"
        onClick={() => setCurrent(current === 0 ? images.length - 1 : current - 1)}
      >
        ❮
      </button>

      <button
        className="nav-btn next-btn"
        onClick={() => setCurrent((current + 1) % images.length)}
      >
        ❯
      </button>
      
      <div className="dots-container">
        {images.map((_, index) => (
          <span 
            key={index} 
            className={`dot ${index === current ? "active" : ""}`}
            onClick={() => setCurrent(index)}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;
