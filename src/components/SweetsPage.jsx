import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { fetchActiveProducts } from "../services/api";
import SEO from "./SEO";
import "./SweetsPage.css";

function SweetsPage() {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    fetchActiveProducts()
      .then((allProducts) => {
        const sweetsProducts = allProducts.filter(
          (item) =>
            item.category_name?.toLowerCase() === "sweets" ||
            item.category_id?.toLowerCase() === "sweets"
        );
        setSweets(sweetsProducts);
      })
      .catch(() => setSweets([]));
  }, []);

  return (
    <section className="products-page">
      <SEO 
        title="Sweets Collection | Raviteja Home Foods"
        description="Taste the tradition crafted with love. Authentic handmade Indian sweets."
        canonicalUrl="https://ravitejahomefoods.in/sweets"
        schema={{
          "@context": "https://schema.org",
          "@type": "ItemList",
          "name": "Sweets Collection"
        }}
      />
      <div className="title-wrapper">
        <h2 className="category-title">SWEETS COLLECTION</h2>
        <h5 className="page-subtitle">Taste the tradition crafted with love ❤️</h5>
      </div>
      <div className="container">
        <div className="product-grid">
          {sweets.map((item) => (
            <ProductCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default SweetsPage;
