// src/components/AllProducts.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchActiveProducts } from "../services/api";
import "./AllProducts.css";

function AllProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const data = await fetchActiveProducts();
      console.log("All products from DB:", data);
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch(`http://18.61.65.71:5454/categories/all_Categories/retail`);
      const data = await response.json();
      setCategories(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === "all" || 
      product.subcategory?.toLowerCase() === selectedCategory.toLowerCase() ||
      product.category_name?.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <section className="all-products">
        <h2>All Products</h2>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading products...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="all-products">
      <h2>All Products</h2>
      
      {/* Search and Filter */}
      <div className="all-products-filters">
        <input
          type="text"
          placeholder="Search products..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="all">All Categories</option>
          {categories.map((cat, idx) => (
            <option key={idx} value={cat.toLowerCase()}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Products Grid */}
      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>No products found. Try adjusting your search.</p>
          <button onClick={() => { setSearchTerm(""); setSelectedCategory("all"); }} className="btn-primary">
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="all-product-grid">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id || product._id} item={product} />
          ))}
        </div>
      )}
      
      <Link to="/" className="back-link">Back to Home</Link>
    </section>
  );
}

export default AllProducts;