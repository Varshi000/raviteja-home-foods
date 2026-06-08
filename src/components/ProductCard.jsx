// src/components/ProductCard.jsx
import { useState, useContext } from "react";
import { Link } from "react-router-dom";
import "./ProductCard.css";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import defaultImg from "../assets/images/category-sweets.png";

function ProductCard({ item }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedWeight, setSelectedWeight] = useState(null);
  // guestAdded: temporary 2-second flash used only for guest users
  const [guestAdded, setGuestAdded] = useState(false);

  const { addToCart, getItemQuantity } = useContext(CartContext);
  const { isAuthenticated } = useAuth();

  // Get pricing options from product
  const pricingOptions = item.pricing || [];

  // Set default weight if not selected
  const currentWeight = selectedWeight || (pricingOptions[0]?.weight || "500g");
  const currentPrice = pricingOptions.find(p => p.weight === currentWeight)?.price || item.price || 0;

  // For logged-in users: derive persistent "in cart" state from live cart data
  const productId = String(item.id || item._id);
  const qtyInCart = isAuthenticated ? getItemQuantity(productId, currentWeight) : 0;
  const isInCart = isAuthenticated && qtyInCart > 0;

  const handleAddToCart = async () => {
    const productToAdd = {
      id: productId,
      product_name: item.product_name,
      image_url: item.images_url?.[0] || defaultImg,
      selectedWeight: currentWeight,
      price: currentPrice,
      business_type: item.business_type,
    };

    const result = await addToCart(productToAdd, quantity);

    if (result?.success) {
      if (!isAuthenticated) {
        // Guest: show 2-second flash, then reset
        setGuestAdded(true);
        setTimeout(() => setGuestAdded(false), 2000);
      }
      // Logged-in: isInCart becomes true automatically via live cartItems — no timeout needed
    } else {
      alert(result?.message || "Failed to add to cart");
    }
  };

  const availableWeights = pricingOptions.map(p => p.weight);

  // Resolve button appearance
  const btnInCartState = isInCart || guestAdded;
  const btnLabel = isInCart
    ? "✓ Added to Cart"
    : guestAdded
    ? "✓ ADDED"
    : "ADD TO CART";

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
            className={`btn-primary add-cart-btn${btnInCartState ? " added" : ""}`}
            onClick={handleAddToCart}
          >
            {btnLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
