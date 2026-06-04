// src/components/ProductCard.jsx
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import { CartContext } from "../context/CartContext";
import defaultImg from "../assets/images/category-sweets.png";

function ProductCard({ item }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(null);
  const [added, setAdded] = useState(false);
  const { addToCart } = useContext(CartContext);

  // Get pricing options from product
  const pricingOptions = item.pricing || [];
  
  // Set default weight if not selected
  const currentWeight = selectedWeight || (pricingOptions[0]?.weight || "500g");
  const currentPrice = pricingOptions.find(p => p.weight === currentWeight)?.price || item.price || 0;

  // src/components/ProductCard.jsx - handleAddToCart function
  const handleAddToCart = async () => {
    const productToAdd = {
      id: item.id || item._id,
      product_name: item.product_name,
      image_url: item.images_url?.[0] || defaultImg,
      selectedWeight: currentWeight,
      price: currentPrice,
    };
    
    const result = await addToCart(productToAdd, quantity);
    
    if (result?.success) {
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } else {
      alert(result?.message || "Failed to add to cart");
    }
  };

  const availableWeights = pricingOptions.map(p => p.weight);

  return (
    <div className="product-card">
      <Link to={`/product/${item.id || item._id}`} className="product-image-link">
        <img 
          src={item.images_url?.[0] || defaultImg} 
          alt={item.product_name} 
        />
      </Link>
      <div className="product-info">
        <Link to={`/product/${item.id || item._id}`} className="product-title-link">
          <h3>{item.product_name}</h3>
        </Link>
        <p className="price">₹{currentPrice}</p>

        {availableWeights.length > 0 && (
          <select
            className="weight-select"
            value={currentWeight}
            onChange={(e) => setSelectedWeight(e.target.value)}
          >
            {availableWeights.map((weight) => (
              <option key={weight} value={weight}>
                {weight} - ₹{pricingOptions.find(p => p.weight === weight)?.price}
              </option>
            ))}
          </select>
        )}

        <div className="cart-row">
          <div className="qty-selector">
            <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
            <span>{quantity}</span>
            <button onClick={() => setQuantity(quantity + 1)}>+</button>
          </div>

          <button
            className={`btn-primary add-cart-btn ${added ? "added" : ""}`}
            onClick={handleAddToCart}
          >
            {added ? "✓ ADDED" : "ADD TO CART"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
