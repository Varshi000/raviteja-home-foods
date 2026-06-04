import "./AvailableOn.css";

import amazon from "../assets/images/amazon.png";
import swiggy from "../assets/images/swiggy.png";
import zomato from "../assets/images/Zomato.png";
import instamart from "../assets/images/instamart.png";
import blinkit from "../assets/images/blinkit.png";


function AvailableOn() {
  const platforms = [amazon, swiggy, zomato, instamart, blinkit];

  return (
    <section className="available">
      <h2>ALSO AVAILABLE ON</h2>

      <div className="platforms">
        {platforms.map((logo, index) => (
          <div className="platform-card" key={index}>
            <img src={logo} alt="platform" />
          </div>
        ))}
      </div>
    </section>
  );
}

export default AvailableOn;
