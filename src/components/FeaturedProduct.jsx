// src/components/FeaturedProduct.jsx - Advanced version with sales data
import { useState, useEffect } from "react";
import "./FeaturedProduct.css";
import { Link } from "react-router-dom";
import { fetchActiveProducts } from "../services/api";
import defaultImg from "../assets/images/category-sweets.png";

const BASE_URL = "http://18.61.65.71:5454";

function FeaturedProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadBestSellers();
  }, []);

  const loadBestSellers = async () => {
    setLoading(true);
    try {
      // First, try to get top selling products from dashboard
      const authToken = localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/dashboard/overview`, {
        headers: authToken ? { "Authorization": `Bearer ${authToken}` } : {},
      });
      
      let topProductIds = [];
      
      if (response.ok) {
        const dashboardData = await response.json();
        // Extract top product IDs from dashboard data
        topProductIds = dashboardData.top_products?.map(p => p.product_id) || [];
        console.log("Top products from dashboard:", topProductIds);
      }
      
      // Get all products
      const allProducts = await fetchActiveProducts();
      
      let bestSellers = [];
      
      if (topProductIds.length > 0) {
        // Show top selling products first
        bestSellers = topProductIds
          .map(id => allProducts.find(p => (p.id || p._id) === id))
          .filter(p => p);
        
        // Fill remaining with random products
        const remaining = allProducts.filter(p => !bestSellers.includes(p));
        const randomRemaining = remaining.sort(() => 0.5 - Math.random()).slice(0, 4 - bestSellers.length);
        bestSellers = [...bestSellers, ...randomRemaining];
      } else {
        // Fallback: random 4 products
        bestSellers = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 4);
      }
      
      setProducts(bestSellers.slice(0, 4));
    } catch (err) {
      console.error("Failed to load best sellers:", err);
      // Fallback: random products
      try {
        const allProducts = await fetchActiveProducts();
        const randomProducts = [...allProducts].sort(() => 0.5 - Math.random()).slice(0, 4);
        setProducts(randomProducts);
      } catch {
        setProducts([]);
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="featured">
        <div className="featured-head">
          <p>BEST SELLERS</p>
          <h2>Taste Loved By Every Family</h2>
        </div>
        <div className="loading-grid">
          <div className="loading-spinner"></div>
          <p>Loading best sellers...</p>
        </div>
      </section>
    );
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <section className="featured">
      <div className="featured-head">
        <p>BEST SELLERS</p>
        <h2>Taste Loved By Every Family</h2>
      </div>

      <div className="product-grid">
        {products.map((item) => {
          const imgUrl = item.images_url?.[0] || defaultImg;
          
          return (
            <div className="product-card" key={item.id || item._id}>
              <img src={imgUrl} alt={item.product_name} />
              <div className="product-info">
                <h3>{item.product_name}</h3>
                <p className="price">₹{item.pricing?.[0]?.price || 0}</p>
                <Link to={`/product/${item.id || item._id}`}>
                  <button className="btn-secondary">View Details</button>
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default FeaturedProducts;