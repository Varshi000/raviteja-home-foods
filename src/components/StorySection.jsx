import React from "react";
import "./StorySection.css";
import storyFood from "../assets/images/story-food.png";
import { Link } from "react-router-dom";



function StorySection() {
    
  return (
    
    <section className="story-wrapper">
      <div className="story-overlay"></div>

      <div className="story-content">

        <div className="story-left">
          <p className="story-tag">ROOTED IN TRADITION</p>

          <h2 className="story-heading">
            Our Story of <span>Pure Taste</span>
          </h2>

          <p className="story-para">
            Raviteja Home Foods was born from a simple promise —
            preserving homemade flavors for modern families.
          </p>

          <p className="story-para">
            Every sweet, pickle, namkeen and snack is made with love,
            purity and timeless tradition.
          </p>

   <Link
  to="/about"
  className="discover-btn"
>
  The Journey Begins
</Link>
        </div>

        <div className="story-right">
          <img src={storyFood} alt="Raviteja Food" />
        </div>

      </div>
    </section>
  );
}

export default StorySection;
