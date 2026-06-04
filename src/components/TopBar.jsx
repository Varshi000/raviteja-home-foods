// src/components/TopBar.jsx
import "./TopBar.css";
import { Truck, Tag } from "lucide-react";

function TopBar() {
  return (
    <div className="top-bar">
      <div className="top-bar-inner">
        <span className="top-bar-item">
          <Truck size={13} /> Free Delivery on Orders Above ₹499
        </span>
        <span className="top-bar-sep">·</span>
        <span className="top-bar-item">
          <Tag size={13} /> Use code WELCOME10 for 10% off your first order!
        </span>
        <span className="top-bar-sep">·</span>
        <span className="top-bar-item">
          <Truck size={13} /> Authentic Home-Made Taste, Delivered Fresh
        </span>
      </div>
    </div>
  );
}

export default TopBar;
