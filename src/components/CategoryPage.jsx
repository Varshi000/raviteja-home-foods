// src/components/CategoryPage.jsx
import { useState, useEffect } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { fetchActiveProducts, fetchCategoriesWithSubcategories, fetchProductsByCategory } from "../services/api";
import SEO from "./SEO";
import "./CategoryPage.css";

const BASE_URL = "/api";

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

  const resolveCategoryId = (category) => {
    if (!category) return "";
    return category._id || category.id || category.category_id || category.name?.toLowerCase().trim().replace(/\s+/g, "-") || "";
  };

  const loadData = async () => {
    setLoading(true);
    console.log("[CategoryPage] Loading data for type:", type);
    try {
      // Fetch dynamic category information first
      const catsResponse = await fetchCategoriesWithSubcategories();
      const cats = catsResponse && Array.isArray(catsResponse.data) ? catsResponse.data : [];
      console.log("[CategoryPage] Fetched categories:", cats.map(c => c.name));
      
      const matchedCategory = cats.find(
        (c) => {
          const apiCategorySlug = c.name.toLowerCase().trim().replace(/\s+/g, "-");
          // Handle typos: "PICKELS" → "pickles", etc.
          const normalizedApiSlug = apiCategorySlug.replace(/els$/, "les");
          return normalizedApiSlug === type || apiCategorySlug === type;
        }
      );
      console.log("[CategoryPage] Matched category:", matchedCategory?.name);

      if (matchedCategory) {
        setCategoryName(matchedCategory.name);
        
        const rawSubcategories = matchedCategory.subcategory || matchedCategory.subcategories;
        const apiSubcategories = Array.isArray(rawSubcategories) && rawSubcategories.length > 0
          ? rawSubcategories
              .map((sub) => {
                const value = typeof sub === "string"
                  ? sub
                  : sub?.name || sub?.label || "";
                return { label: value, dbValue: value };
              })
              .filter((sub) => sub.label)
          : [];
        console.log("[CategoryPage] API Subcategories:", apiSubcategories.map(s => s.label));
        setSubcategories(apiSubcategories);

        const categoryId = resolveCategoryId(matchedCategory);
        console.log("[CategoryPage] Resolved category ID:", categoryId);

        // Fetch products
        if (subcategoryParam) {
          console.log("[CategoryPage] Loading products for subcategory:", subcategoryParam);
          await loadProductsBySubcategory(subcategoryParam);
        } else {
          if (apiSubcategories.length > 0) {
            console.log("[CategoryPage] Fetching products for all subcategories...");
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
            console.log("[CategoryPage] Merged subcategory products count:", merged.length);
            const seen = new Set();
            const unique = merged.filter((p) => {
              const id = p.id || p._id;
              if (seen.has(id)) return false;
              seen.add(id);
              return true;
            });

            if (unique.length > 0) {
              console.log("[CategoryPage] Using subcategory products:", unique.length);
              setProducts(unique);
            } else {
              console.log("[CategoryPage] Subcategory products empty, falling back to category fetch");
              const catProducts = await fetchProductsByCategory(categoryId);
              console.log("[CategoryPage] Category fallback products:", catProducts.length);
              setProducts(catProducts);
            }
          } else {
            console.log("[CategoryPage] No subcategories, fetching by category ID");
            // No subcategories, fetch all products for this category using category_id
            const catProducts = await fetchProductsByCategory(categoryId);
            console.log("[CategoryPage] Category products:", catProducts.length);
            setProducts(catProducts);
          }
        }
      } else {
        console.log("[CategoryPage] Category not found in API, using local fallback");
        // Fallback for static category names if not matching dynamic API
        const fallbackName = CATEGORY_NAMES[type] || type?.charAt(0).toUpperCase() + type?.slice(1);
        setCategoryName(fallbackName);
        setSubcategories([]);

        const allProducts = await fetchActiveProducts();
        console.log("[CategoryPage] All local products:", allProducts.length);
        const fallbackProducts = allProducts.filter((product) => {
          const productCategoryId = String(product.category_id || "").toLowerCase();
          const productCategoryName = String(product.category_name || "").toLowerCase();
          const slug = String(type || "").toLowerCase();
          
          // Normalize for typos: "pickels" → "pickles"
          const normalizedProductId = productCategoryId.replace(/els$/, "les");
          const normalizedProductName = productCategoryName.replace(/els$/, "les");
          const normalizedSlug = slug.replace(/els$/, "les");
          
          return (
            normalizedProductId === normalizedSlug ||
            normalizedProductName === normalizedSlug ||
            normalizedProductName.replace(/\s+/g, "-") === normalizedSlug
          );
        });
        console.log("[CategoryPage] Fallback filtered products:", fallbackProducts.length);

        setProducts(fallbackProducts);
      }
    } catch (err) {
      console.error("[CategoryPage] Failed to load category data:", err);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  // Load products for a specific subcategory via API
  const loadProductsBySubcategory = async (subcategory) => {
    try {
      console.log("[CategoryPage] Fetching products for subcategory:", subcategory);
      const response = await fetch(
        `${BASE_URL}/categories/all_products_by_subCategory/${encodeURIComponent(subcategory)}`
      );
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      const products = data.data || [];
      console.log("[CategoryPage] Subcategory API returned:", products.length, "products");
      
      if (products.length > 0) {
        setProducts(products);
      } else {
        console.log("[CategoryPage] Subcategory returned empty, falling back to local");
        const allProducts = await fetchActiveProducts();
        const localSubcatProducts = allProducts.filter((p) => 
          p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase()
        );
        console.log("[CategoryPage] Local subcategory products:", localSubcatProducts.length);
        setProducts(localSubcatProducts);
      }
    } catch (err) {
      console.error("[CategoryPage] Failed to load products by subcategory:", err);
      console.log("[CategoryPage] Falling back to local products for subcategory");
      
      try {
        const allProducts = await fetchActiveProducts();
        const localSubcatProducts = allProducts.filter((p) => 
          p.subcategory && p.subcategory.toLowerCase() === subcategory.toLowerCase()
        );
        console.log("[CategoryPage] Local fallback subcategory products:", localSubcatProducts.length);
        setProducts(localSubcatProducts);
      } catch (localErr) {
        console.error("[CategoryPage] Local fallback also failed:", localErr);
        setProducts([]);
      }
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
      <SEO 
        title={`${subcategoryLabel || categoryName} | Raviteja Home Foods`}
        description={`Browse our collection of authentic ${subcategoryLabel || categoryName} from Raviteja Home Foods.`}
        canonicalUrl={`https://ravitejahomefoods.in/category/${type}${subcategoryParam ? `?subcategory=${subcategoryParam}` : ''}`}
      />
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
