// src/components/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./CategoryPage.css";

const BASE_URL = "http://18.61.65.71:5454";

function CategoryPage() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [currentSubcategory, setCurrentSubcategory] = useState(null);

  const subcategoryParam = searchParams.get("subcategory");

  // Category display names
  const categoryNames = {
    sweets: "Sweets",
    namkeen: "Namkeen",
    pickles: "Pickles",
    "daily-essentials": "Daily Essentials",
    "chilli-powders": "Chilli Powders",
    "gift-packs": "Gift Packs"
  };

  useEffect(() => {
    window.scrollTo(0, 0);
    setCategoryName(categoryNames[type] || type?.charAt(0).toUpperCase() + type?.slice(1));
    setCurrentSubcategory(subcategoryParam);
    
    if (subcategoryParam) {
      loadProductsBySubcategory(subcategoryParam);
    } else {
      loadAllProducts();
    }
  }, [type, subcategoryParam]);

  // Load all products for this category (no filter)
  const loadAllProducts = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/products/get_active_products`);
      const allProducts = await response.json();
      
      // Filter by category based on type
      const filtered = allProducts.filter(product => {
        if (type === "sweets") {
          return product.subcategory && sweetsSubcategories.some(s => 
            product.subcategory.toLowerCase().includes(s.toLowerCase())
          );
        }
        if (type === "pickles") {
          return product.subcategory && picklesSubcategories.some(s => 
            product.subcategory.toLowerCase().includes(s.toLowerCase())
          );
        }
        return product.subcategory?.toLowerCase() === type ||
               product.category_name?.toLowerCase() === type;
      });
      
      setProducts(filtered);
    } catch (err) {
      console.error("Failed to load products:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products by specific subcategory using API
  const loadProductsBySubcategory = async (subcategory) => {
    setLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/categories/all_products_by_subCategory/${encodeURIComponent(subcategory)}`);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error("Failed to load products by subcategory:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const sweetsSubcategories = [
    "Traditional Sweets", "Milk Based Sweets", "Maida Based Pakam",
    "Dry Fruit Sweets", "Bites And Chikkis", "Sugar Free Sweets", "Other Sweets"
  ];

  const picklesSubcategories = ["Vegetarian Pickles", "Non Vegetarian Pickles"];

  const quotes = {
    sweets: "Sweet moments, sweeter memories ❤️",
    namkeen: "Crunch of happiness in every bite ❤️",
    pickles: "Taste that reminds home ❤️",
    "chilli-powders": "Spice of tradition ❤️",
    "daily-essentials": "Everyday purity you trust ❤️",
    "gift-packs": "Packed with love ❤️",
  };

  return (
    <section className={`products-page ${type}`}>
      <div className="title-wrapper">
        <h2 className="category-title">
          {currentSubcategory ? currentSubcategory : categoryName} 
          {currentSubcategory && " COLLECTION"}
        </h2>
        <h5 className="page-subtitle">
          {quotes[type] || "Taste that reminds home ❤️"}
        </h5>
        {currentSubcategory && (
          <button 
            className="back-to-all"
            onClick={() => navigate(`/category/${type}`)}
          >
            ← Back to All {categoryName}
          </button>
        )}
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading {currentSubcategory || categoryName}...</p>
          </div>
        ) : (
          <>
            {products.length > 0 ? (
              <div className="product-grid">
                {products.map((item) => (
                  <ProductCard key={item.id || item._id} item={item} />
                ))}
              </div>
            ) : (
              <div className="no-products">
                <p>No products found in {currentSubcategory || categoryName}</p>
                {currentSubcategory && (
                  <button onClick={() => navigate(`/category/${type}`)} className="btn-primary">
                    View All {categoryName}
                  </button>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export default CategoryPage;