// src/components/AllProducts.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import ProductCard from "./ProductCard";
import { fetchActiveProducts } from "../services/api";
import SEO from "./SEO";
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
      // 1. Try to fetch categories with subcategories to get database IDs, names, and subcategories
      const response = await fetch(`/api/categories/with_subcategories`);
      if (response.ok) {
        const result = await response.json();
        const cats = result && Array.isArray(result.data) ? result.data : [];
        if (cats.length > 0) {
          const mapped = cats.map(cat => ({
            id: cat._id || cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-'),
            name: cat.name,
            subcategories: Array.isArray(cat.subcategory) 
              ? cat.subcategory.map(sub => typeof sub === 'string' ? sub : sub?.name || sub?.label || '').filter(Boolean)
              : []
          }));
          setCategories(mapped);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load categories with subcategories:", err);
    }

    // 2. Fallback to /all_Categories/retail
    try {
      const response = await fetch(`/api/categories/all_Categories/retail`);
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          const mapped = data.map(cat => {
            if (typeof cat === 'string') {
              return {
                id: cat.toLowerCase().replace(/\s+/g, '-'),
                name: cat,
                subcategories: []
              };
            }
            return {
              id: cat._id || cat.id || cat.name?.toLowerCase().replace(/\s+/g, '-'),
              name: cat.name || '',
              subcategories: Array.isArray(cat.subcategory)
                ? cat.subcategory.map(sub => typeof sub === 'string' ? sub : sub?.name || '').filter(Boolean)
                : []
            };
          });
          setCategories(mapped);
          return;
        }
      }
    } catch (err) {
      console.error("Failed to load retail categories:", err);
    }

    // 3. Hardcoded fallback if both APIs fail
    setCategories([
      { id: "sweets", name: "Sweets", subcategories: ["Traditional Sweets", "Milk Based Sweets", "Maida Based Pakam", "Dry Fruit Sweets", "Bites And Chikkis", "Sugar Free Sweets", "Other Sweets"] },
      { id: "namkeen", name: "Namkeen", subcategories: [] },
      { id: "pickles", name: "Pickles", subcategories: ["Vegetarian Pickles", "Non Vegetarian Pickles", "Vegatarian Pickles"] },
      { id: "chilli-powders", name: "Chilli Powders", subcategories: [] },
      { id: "daily-essentials", name: "Daily Essentials", subcategories: [] },
      { id: "gift-packs", name: "Gift Packs", subcategories: [] }
    ]);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedCategory === "all") {
      return matchesSearch;
    }
    
    const category = categories.find(c => c.id === selectedCategory);
    if (!category) return false;
    
    const productCategoryId = product.category_id ? String(product.category_id).toLowerCase() : "";
    const selectedCatId = String(category.id).toLowerCase();
    const selectedCatName = category.name.toLowerCase();
    
    const matchesCategory = 
      productCategoryId === selectedCatId ||
      productCategoryId === selectedCatName ||
      productCategoryId === selectedCatName.replace(/\s+/g, '-') ||
      product.category_name?.toLowerCase() === selectedCatName ||
      (product.subcategory && category.subcategories.some(sub => sub.toLowerCase() === product.subcategory.toLowerCase()));
      
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
      <SEO 
        title="All Products | Traditional Sweets & Snacks | Raviteja Home Foods"
        description="Browse our entire collection of authentic traditional Indian sweets, snacks, and homemade foods."
        canonicalUrl="https://ravitejahomefoods.in/all-products"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "itemListElement": products.slice(0, 10).map((p, idx) => ({
            "@type": "ListItem",
            "position": idx + 1,
            "name": p.product_name || p.name
          }))
        }}
      />
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
            <option key={cat.id || idx} value={cat.id}>{cat.name}</option>
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
