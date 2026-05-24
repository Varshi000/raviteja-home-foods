import { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import productData from "../data/productData.json";
import "./SweetsPage.css";

function SweetsPage() {
  const [sweets, setSweets] = useState([]);

  useEffect(() => {
    const sweetsProducts = productData.filter(
      (item) => item.category === "Sweets"
    );
    setSweets(sweetsProducts);
  }, []);

  return (
    <section className="products-page">
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