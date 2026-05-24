// src/components/CartPage.jsx
import { useContext } from "react";
import "./CartPage.css";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import defaultImg from "../assets/images/category-sweets.png";

function CartPage() {
  const { 
    cartItems, 
    cartLoading, 
    subtotal, 
    totalPreview, 
    discountAmount, 
    appliedCoupon,
    updateQuantity, 
    removeFromCart,
    removeCoupon,
    getCartCount
  } = useContext(CartContext);

  if (cartLoading) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-state">Loading your cart...</div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <h1 className="cart-title">YOUR SHOPPING CART</h1>
          <div className="empty-cart">
            <h2>Your cart feels a bit light.</h2>
            <p>Let's add some sweetness to it!</p>
            <Link to="/" className="btn-primary">Continue Shopping</Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="cart-page">
      <div className="container">
        <h1 className="cart-title">YOUR SHOPPING CART ({getCartCount()} items)</h1>

        <div className="cart-container">
          {/* LEFT: Cart Items */}
          <div className="cart-items">
            {cartItems.map((item, index) => (
              <div className="cart-card" key={index}>
                <img src={item.image_url || defaultImg} alt={item.product_name} />
                <div className="cart-info">
                  <h3>{item.product_name}</h3>
                  <p className="cart-weight">{item.weight}</p>
                  <h4 className="cart-price">₹{item.price}</h4>

                  <div className="qty-selector">
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.weight, item.quantity - 1)}
                    >
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button 
                      onClick={() => updateQuantity(item.product_id, item.weight, item.quantity + 1)}
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product_id, item.weight)}
                  >
                    Remove
                  </button>
                </div>
                <div className="item-total">
                  ₹{item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>

          {/* RIGHT: Summary */}
          <div className="cart-summary">
            <h2>Order Summary</h2>
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>
            
            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span>Discount {appliedCoupon && `(${appliedCoupon})`}</span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}
            
            <div className="summary-row">
              <span>Shipping</span>
              <span>Calculated at checkout</span>
            </div>
            
            <hr />
            
            <div className="summary-row total">
              <span>Total</span>
              <span>₹{totalPreview}</span>
            </div>

            {appliedCoupon && (
              <button 
                className="btn-link remove-coupon-btn"
                onClick={removeCoupon}
              >
                Remove Coupon
              </button>
            )}

            <Link to="/checkout">
              <button className="btn-primary checkout-btn">
                PROCEED TO CHECKOUT
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;