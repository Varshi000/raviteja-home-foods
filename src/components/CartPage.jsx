// src/components/CartPage.jsx
import { useContext, useState } from "react";
import "./CartPage.css";
import { CartContext } from "../context/CartContext";
import { Link } from "react-router-dom";
import defaultImg from "../assets/images/category-sweets.png";
import SEO from "./SEO";
import { estimateShipping } from "../services/api";
import {
  ShoppingCart,
  Trash2,
  Truck,
  ChevronDown,
  ChevronUp,
  Calculator,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Lock,
  Package,
  Tag,
  X,
  ShoppingBag,
  Weight,
} from "lucide-react";

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

  const [showCalc, setShowCalc] = useState(false);
  const [shippingState, setShippingState] = useState("");
  const [shippingPincode, setShippingPincode] = useState("");
  const [shippingCharge, setShippingCharge] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);
  const [calcError, setCalcError] = useState("");

  const calculateCartQuantity = (items) => {
    return items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
    );
  };

  const handleCalculateShipping = async () => {
    setCalcError("");
    if (!shippingState.trim()) {
      setCalcError("State is required");
      return;
    }
    if (!shippingPincode.match(/^[0-9]{6}$/)) {
      setCalcError("Valid 6-digit pincode required");
      return;
    }

    setCalcLoading(true);
    try {
        const cartQuantity =
            calculateCartQuantity(cartItems);

        const res = await estimateShipping(
            "India",
            shippingState,
            shippingPincode,
            cartQuantity,
            totalPreview
        );
      setShippingCharge(res.shipping_charge);
    } catch (err) {
      console.error(err);
      setCalcError(err.message || "Failed to estimate shipping charges");
      setShippingCharge(null);
    } finally {
      setCalcLoading(false);
    }
  };

  if (cartLoading && cartItems.length === 0) {
    return (
      <div className="cart-page">
        <div className="container">
          <div className="loading-state">
            <span className="pay-spinner" style={{ border: "2px solid #ddd", borderTopColor: "#7b1113" }} />
            Loading your cart...
          </div>
        </div>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <section className="cart-page">
        <div className="container">
          <h1 className="cart-title">
            <ShoppingCart size={28} className="cart-title-icon" />
            YOUR SHOPPING CART
          </h1>
          <div className="empty-cart">
            <div className="empty-cart-icon">
              <ShoppingBag size={64} strokeWidth={1.2} />
            </div>
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
      <SEO title="Cart | Raviteja Home Foods" noindex={true} />
      <div className="container">
        <h1 className="cart-title">
          <ShoppingCart size={26} className="cart-title-icon" />
          YOUR SHOPPING CART
          <span style={{ fontSize: "1rem", fontWeight: 600, color: "var(--text-muted)", letterSpacing: 0 }}>
            ({getCartCount()} items)
          </span>
        </h1>

        <div className={`cart-container ${cartLoading ? "loading" : ""}`}>
          {/* LEFT: Cart Items */}
          <div className="cart-items">
            <div className="cart-items-header">
              <Package size={14} /> Product Details
            </div>

            {cartItems.map((item, index) => (
              <div className="cart-card" key={index}>
                <img src={item.image_url || defaultImg} alt={item.product_name} />

                <div className="cart-info">
                  <h3>{item.product_name}</h3>
                  <p className="cart-weight">
                    <Weight size={12} /> {item.weight}
                  </p>
                  <h4 className="cart-price">₹{item.price}</h4>

                  <div className="qty-selector">
                    <button
                      onClick={() => updateQuantity(item.product_id, item.weight, item.quantity - 1)}
                      aria-label="Decrease quantity"
                    >
                      −
                    </button>
                    <span>{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product_id, item.weight, item.quantity + 1)}
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <button
                    className="remove-btn"
                    onClick={() => removeFromCart(item.product_id, item.weight)}
                  >
                    <Trash2 size={13} /> Remove
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
            <h2><ShoppingCart size={18} /> Order Summary</h2>

            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{subtotal}</span>
            </div>

            {discountAmount > 0 && (
              <div className="summary-row discount">
                <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                  <Tag size={13} /> Discount {appliedCoupon && `(${appliedCoupon})`}
                </span>
                <span>- ₹{discountAmount}</span>
              </div>
            )}

            {/* Shipping Calculator */}
            <div className="shipping-calculator">
              <div className="shipping-row">
                <span style={{ display: "flex", alignItems: "center", gap: 6 }}>
                  <Truck size={14} /> Shipping
                </span>
                <span>
                  {shippingCharge !== null ? (
                    <span className="shipping-result">
                      <CheckCircle2 size={13} /> ₹{shippingCharge}
                    </span>
                  ) : (
                    "Calculated at checkout"
                  )}
                </span>
              </div>

              <div
                className="shipping-calc-toggle"
                onClick={() => setShowCalc(!showCalc)}
              >
                <Calculator size={13} />
                {showCalc ? "Hide Calculator" : "Estimate Shipping"}
                {showCalc ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
              </div>

              {showCalc && (
                <div className="shipping-calc-form">
                  <div className="calc-group">
                    <input
                      type="text"
                      placeholder="State (e.g. Telangana)"
                      value={shippingState}
                      onChange={(e) => setShippingState(e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Pincode (e.g. 500081)"
                      value={shippingPincode}
                      onChange={(e) => setShippingPincode(e.target.value)}
                      maxLength="6"
                    />
                  </div>
                  <button
                    type="button"
                    className="btn-calc"
                    onClick={handleCalculateShipping}
                    disabled={calcLoading}
                  >
                    {calcLoading ? (
                      <><span className="calc-spinner" /> Calculating...</>
                    ) : (
                      <><Calculator size={14} /> Calculate</>
                    )}
                  </button>
                  {calcError && (
                    <div className="calc-error">
                      <AlertCircle size={13} /> {calcError}
                    </div>
                  )}
                  {shippingCharge !== null && !calcError && (
                    <div className="shipping-result">
                      <CheckCircle2 size={14} /> Shipping: ₹{shippingCharge}
                    </div>
                  )}
                </div>
              )}
            </div>

            <hr />

            <div className="summary-row total">
              <span>Total</span>
              <span>₹{shippingCharge !== null ? totalPreview + shippingCharge : totalPreview}</span>
            </div>

            {appliedCoupon && (
              <button
                className="btn-link remove-coupon-btn"
                onClick={removeCoupon}
              >
                <X size={13} /> Remove Coupon ({appliedCoupon})
              </button>
            )}

            <Link to="/checkout">
              <button className="btn-primary checkout-btn">
                <Lock size={15} /> PROCEED TO CHECKOUT <ArrowRight size={15} />
              </button>
            </Link>

            <div className="secure-badge">
              <Lock size={11} /> Secure &amp; Encrypted Checkout
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default CartPage;
