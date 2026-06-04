// src/components/ProductSection.jsx
import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchActiveProducts } from "../services/api";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import "./ProductSection.css";

function ProductSection() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchActiveProducts();
      
      // Get the latest 20 products (new arrivals)
      // Assuming products are returned in order of creation
      const latestProducts = allProducts.slice(0, 20);
      setNewArrivals(latestProducts);
    } catch (err) {
      console.error("Failed to load new arrivals:", err);
      setNewArrivals([]);
    } finally {
      setLoading(false);
    }
  };

  const scrollLeft = () => {
    if (scrollRef.current) {
      // scroll left by about one card width (300px) + gap
      scrollRef.current.scrollBy({ left: -330, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({ left: 330, behavior: "smooth" });
    }
  };

  if (loading) {
    return (
      <section className="products">
        <div className="products-container">
          <div className="products-head">
            <h2>NEW ARRIVALS</h2>
            <Link to="/all-products" className="view-all-link">VIEW ALL</Link>
          </div>
          <div className="product-slider loading-grid">
            <div className="loading-spinner"></div>
            <p>Loading new arrivals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (newArrivals.length === 0) {
    return null;
  }

  return (
    <section className="products">
      <div className="products-container">
        {/* HEADER */}
        <div className="products-head">
          <h2>NEW ARRIVALS</h2>
          <Link to="/all-products" className="view-all-link">
            VIEW ALL
          </Link>
        </div>

        {/* SLIDER WRAPPER */}
        <div className="product-slider-wrapper">
          <button className="slider-btn left-btn" onClick={scrollLeft} aria-label="Scroll left">
            <FaChevronLeft />
          </button>
          
          <div className="product-slider" ref={scrollRef}>
            {newArrivals.map((item) => (
              <div className="slider-item" key={item.id || item._id}>
                <ProductCard item={item} />
              </div>
            ))}
          </div>

          <button className="slider-btn right-btn" onClick={scrollRight} aria-label="Scroll right">
            <FaChevronRight />
          </button>
        </div>
      </div>
    </section>
  );
}

export default ProductSection;
