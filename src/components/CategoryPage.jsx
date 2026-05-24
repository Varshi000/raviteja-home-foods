// src/components/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import "./CategoryPage.css";

const BASE_URL = "http://18.61.65.71:5454";

// ── Move these OUTSIDE the component so they're never in a temporal dead zone ──
const SWEETS_SUBCATEGORIES = [
  { label: "Traditional Sweets",   dbValue: "Traditional Sweets" },
  { label: "Milk Based Sweets",    dbValue: "Milk Based Sweets" },
  { label: "Maida Based Pakam",    dbValue: "Maida Based Pakam" },
  { label: "Dry Fruit Sweets",     dbValue: "Dry Fruit Sweets" },
  { label: "Bites And Chikkis",    dbValue: "Bites And Chikkis" },
  { label: "Sugar Free Sweets",    dbValue: "Sugar Free Sweets" },
  { label: "Other Sweets",         dbValue: "Other Sweets" },
];

// NOTE: DB stores "Vegatarian Pickles" (typo — missing 'r').
// label shows the correct spelling to users; dbValue is what the API searches.
const PICKLES_SUBCATEGORIES = [
  { label: "Vegetarian Pickles",     dbValue: "Vegatarian Pickles" },
  { label: "Non Vegetarian Pickles", dbValue: "Non Vegetarian Pickles" },
];

// Map URL type slug → category display name
const CATEGORY_NAMES = {
  sweets: "Sweets",
  namkeen: "Namkeen",
  pickles: "Pickles",
  "daily-essentials": "Daily Essentials",
  "chilli-powders": "Chilli Powders",
  "gift-packs": "Gift Packs",
};

// Map URL type slug → exact category name as stored in DB (used for matching)
const CATEGORY_DB_NAMES = {
  sweets: "sweets",
  namkeen: "namkeen",
  pickles: "pickles",
  "daily-essentials": "daily essentials",
  "chilli-powders": "chilli powders",
  "gift-packs": "gift packs",
};

// Which types have subcategory tabs
const SUBCATEGORY_MAP = {
  sweets: SWEETS_SUBCATEGORIES,
  pickles: PICKLES_SUBCATEGORIES,
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

  const subcategoryParam = searchParams.get("subcategory");
  const categoryName = CATEGORY_NAMES[type] || type?.charAt(0).toUpperCase() + type?.slice(1);
  const subcategories = SUBCATEGORY_MAP[type] || [];

  useEffect(() => {
    window.scrollTo(0, 0);

    if (subcategoryParam) {
      // Use the dedicated subcategory endpoint
      loadProductsBySubcategory(subcategoryParam);
    } else {
      // Load all products for this category using subcategory endpoint
      loadAllProductsForCategory();
    }
  }, [type, subcategoryParam]);

  // Load ALL products for a category.
  // For types with subcategories (sweets, pickles), fetch each subcategory in parallel
  // and merge. For others, fetch all active products and filter by category name.
  const loadAllProductsForCategory = async () => {
    setLoading(true);
    try {
      const subList = SUBCATEGORY_MAP[type];

      if (subList && subList.length > 0) {
        // Fetch all subcategories in parallel using dbValue (exact DB string)
        const results = await Promise.all(
          subList.map((sub) =>
            fetch(
              `${BASE_URL}/categories/all_products_by_subCategory/${encodeURIComponent(sub.dbValue)}`
            )
              .then((r) => r.json())
              .then((d) => d.data || [])
              .catch(() => [])
          )
        );
        // Flatten and deduplicate by product id
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
        // For other categories, fetch active products and match by category_name or subcategory
        const response = await fetch(`${BASE_URL}/products/get_active_products`);
        const allProducts = await response.json();
        const list = Array.isArray(allProducts) ? allProducts : allProducts.data || [];

        const dbName = CATEGORY_DB_NAMES[type] || type;
        const filtered = list.filter((p) => {
          const catName = (p.category_name || "").toLowerCase();
          const sub = (p.subcategory || "").toLowerCase();
          return catName.includes(dbName) || sub.includes(dbName);
        });
        setProducts(filtered);
      }
    } catch (err) {
      console.error("Failed to load products for category:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products for a specific subcategory via API
  const loadProductsBySubcategory = async (subcategory) => {
    setLoading(true);
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
    } finally {
      setLoading(false);
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