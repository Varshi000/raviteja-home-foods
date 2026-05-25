// src/components/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchCategoriesWithSubcategories, fetchProductsByCategory } from "../services/api";
import "./CategoryPage.css";

const BASE_URL = "http://18.61.65.71:5454";

// Map URL type slug → category display name
const CATEGORY_NAMES = {
  sweets: "Sweets",
  namkeen: "Namkeen",
  pickles: "Pickles",
  "daily-essentials": "Daily Essentials",
  "chilli-powders": "Chilli Powders",
  "gift-packs": "Gift Packs",
};

const QUOTES = {
  sweets: "Sweet moments, sweeter memories ❤️",
  namkeen: "Crunch of happiness in every bite ❤️",
  pickles: "Taste that reminds home ❤️",
  "chilli-powders": "Spice of tradition ❤️",
  "daily-essentials": "Everyday purity you trust ❤️",
  "gift-packs": "Packed with love ❤️",
};

function CategoryPage() {
  const { type } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categoryName, setCategoryName] = useState("");
  const [subcategories, setSubcategories] = useState([]);

  const subcategoryParam = searchParams.get("subcategory");

  useEffect(() => {
    window.scrollTo(0, 0);
    loadData();
  }, [type, subcategoryParam]);

  const loadData = async () => {
    setLoading(true);
    try {
      // Fetch dynamic category information first
      const catsResponse = await fetchCategoriesWithSubcategories();
      const cats = catsResponse && Array.isArray(catsResponse.data) ? catsResponse.data : [];
      
      const matchedCategory = cats.find(
        (c) => c.name.toLowerCase().trim().replace(/\s+/g, "-") === type
      );

      if (matchedCategory) {
        setCategoryName(matchedCategory.name);
        
        const apiSubcategories = matchedCategory.subcategory && matchedCategory.subcategory.length > 0
          ? matchedCategory.subcategory.map((sub) => ({
              label: sub.name,
              dbValue: sub.name,
            }))
          : [];
        setSubcategories(apiSubcategories);

        // Fetch products
        if (subcategoryParam) {
          await loadProductsBySubcategory(subcategoryParam);
        } else {
          if (apiSubcategories.length > 0) {
            // Fetch all subcategories in parallel
            const results = await Promise.all(
              apiSubcategories.map((sub) =>
                fetch(
                  `${BASE_URL}/categories/all_products_by_subCategory/${encodeURIComponent(sub.dbValue)}`
                )
                  .then((r) => r.json())
                  .then((d) => d.data || [])
                  .catch(() => [])
              )
            );
            const merged = results.flat();
            const seen = new Set();
            const unique = merged.filter((p) => {
              const id = p.id || p._id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });
            setProducts(unique);
          } else {
            // No subcategories, fetch all products for this category using category_id
            const catProducts = await fetchProductsByCategory(matchedCategory.id);
            setProducts(catProducts);
          }
        }
      } else {
        // Fallback for static category names if not matching dynamic API
        const fallbackName = CATEGORY_NAMES[type] || type?.charAt(0).toUpperCase() + type?.slice(1);
        setCategoryName(fallbackName);
        setSubcategories([]);
        setProducts([]);
      }
    } catch (err) {
      console.error("Failed to load category data:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products for a specific subcategory via API
  const loadProductsBySubcategory = async (subcategory) => {
    try {
      const response = await fetch(
        `${BASE_URL}/categories/all_products_by_subCategory/${encodeURIComponent(subcategory)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(data.data || []);
    } catch (err) {
      console.error("Failed to load products by subcategory:", err);
      setProducts([]);
    }
  };

  // sub is a {label, dbValue} object
  const handleSubcategoryClick = (sub) => {
    // Pass dbValue in URL so the API fetch uses the exact DB string
    navigate(`/category/${type}?subcategory=${encodeURIComponent(sub.dbValue)}&label=${encodeURIComponent(sub.label)}`);
  };

  const handleBackToAll = () => {
    navigate(`/category/${type}`);
  };

  // Resolve the display label for the current subcategory page
  const subcategoryLabel = subcategoryParam
    ? (searchParams.get("label") || subcategoryParam)
    : null;

  return (
    <section className={`products-page ${type}`}>
      <div className="title-wrapper">
        <h2 className="category-title">
          {subcategoryLabel ? `${subcategoryLabel} COLLECTION` : categoryName}
        </h2>
        <h5 className="page-subtitle">{QUOTES[type] || "Taste that reminds home ❤️"}</h5>

        {/* Subcategory Tabs — shown only when viewing "all" of a type with subtypes */}
        {!subcategoryParam && subcategories.length > 0 && (
          <div className="subcategory-tabs">
            {subcategories.map((sub) => (
              <button
                key={sub.dbValue}
                className="subcategory-tab"
                onClick={() => handleSubcategoryClick(sub)}
              >
                {sub.label}
              </button>
            ))}
          </div>
        )}

        {/* Back button when viewing a subcategory */}
        {subcategoryParam && (
          <button className="back-to-all" onClick={handleBackToAll}>
            ← Back to All {categoryName}
          </button>
        )}
      </div>

      <div className="container">
        {loading ? (
          <div className="loading-state">
            <div className="spinner"></div>
            <p>Loading {subcategoryLabel || categoryName}...</p>
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
                <p>No products found in {subcategoryLabel || categoryName}</p>
                {subcategoryParam && (
                  <button onClick={handleBackToAll} className="btn-primary">
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