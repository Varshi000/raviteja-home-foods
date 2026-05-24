// src/components/ProductSection.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchActiveProducts } from "../services/api";
import "./ProductSection.css";

function ProductSection() {
  const [newArrivals, setNewArrivals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNewArrivals();
  }, []);

  const loadNewArrivals = async () => {
    setLoading(true);
    try {
      const allProducts = await fetchActiveProducts();
      console.log("All products for new arrivals:", allProducts);
      
      // Get the latest 4 products (new arrivals)
      // Assuming products are returned in order of creation
      // You can also sort by created_at if available
      const latestProducts = allProducts.slice(0, 4);
      setNewArrivals(latestProducts);
    } catch (err) {
      console.error("Failed to load new arrivals:", err);
      setNewArrivals([]);
    } finally {
      setLoading(false);
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
          <div className="product-grid loading-grid">
            <div className="loading-spinner"></div>
            <p>Loading new arrivals...</p>
          </div>
        </div>
      </section>
    );
  }

  if (newArrivals.length === 0) {
    return null; // Don't show section if no products
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

        {/* PRODUCTS GRID */}
        <div className="product-grid">
          {newArrivals.map((item) => (
            <ProductCard
              key={item.id || item._id}
              item={item}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProductSection;