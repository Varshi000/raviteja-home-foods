// src/components/CheckoutPage.jsx
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./CheckoutPage.css";
import { useNavigate } from "react-router-dom";

const BASE_URL = "http://18.61.65.71:5454";

function CheckoutPage() {
  const { cartItems, totalPreview, guestId, clearCart, refreshCart } = useContext(CartContext);
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(totalPreview);
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    mobile: "",
    address_line: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });
  const [billingSameAsShipping, setBillingSameAsShipping] = useState(true);
  const [billingAddress, setBillingAddress] = useState({
    name: "",
    mobile: "",
    address_line: "",
    city: "",
    state: "",
    country: "India",
    pincode: "",
  });
  const [errors, setErrors] = useState({});

  // Get auth headers
  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return authToken ? { "Authorization": `Bearer ${authToken}` } : {};
  };

  useEffect(() => {
    setGrandTotal(totalPreview + deliveryCharge);
  }, [totalPreview, deliveryCharge]);

  const validateForm = () => {
    const newErrors = {};
    
    if (!shippingAddress.name.trim()) newErrors.name = "Name is required";
    if (!shippingAddress.mobile.match(/^[0-9]{10}$/)) newErrors.mobile = "Valid 10-digit mobile number required";
    if (!shippingAddress.address_line.trim()) newErrors.address_line = "Address is required";
    if (!shippingAddress.city.trim()) newErrors.city = "City is required";
    if (!shippingAddress.state.trim()) newErrors.state = "State is required";
    if (!shippingAddress.pincode.match(/^[0-9]{6}$/)) newErrors.pincode = "Valid 6-digit pincode required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Estimate delivery charge
  const estimateDeliveryCharge = async () => {
    if (!shippingAddress.pincode || shippingAddress.pincode.length !== 6) return;
    
    setShippingLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/orders/delivery-estimate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        body: JSON.stringify({
          country: shippingAddress.country,
          state: shippingAddress.state,
          pincode: shippingAddress.pincode,
          guest_id: guestId,
        }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        console.error("Delivery estimate error:", error);
        setDeliveryCharge(0);
      } else {
        const data = await response.json();
        setDeliveryCharge(data.shipping_charge || 0);
      }
    } catch (err) {
      console.error("Delivery estimation failed:", err);
      setDeliveryCharge(0);
    } finally {
      setShippingLoading(false);
    }
  };

  useEffect(() => {
    if (shippingAddress.pincode.length === 6 && shippingAddress.state && cartItems.length > 0) {
      const timer = setTimeout(() => {
        estimateDeliveryCharge();
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [shippingAddress.pincode, shippingAddress.state]);

  // Place order
  const placeOrder = async () => {
    const orderData = {
      email: user?.email || "guest@example.com",
      shipping_address: shippingAddress,
      billing_address: billingSameAsShipping ? shippingAddress : billingAddress,
      guest_id: guestId,
    };
    
    const response = await fetch(`${BASE_URL}/orders/place`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Failed to create order");
    }
    
    return response.json();
  };

  // Verify payment
  const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature) => {
    const response = await fetch(`${BASE_URL}/orders/verify-payment`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      body: JSON.stringify({
        razorpay_order_id: razorpayOrderId,
        razorpay_payment_id: razorpayPaymentId,
        razorpay_signature: razorpaySignature,
        guest_id: guestId,
      }),
    });
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.detail || "Payment verification failed");
    }
    
    return response.json();
  };

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    
    if (cartItems.length === 0) {
      alert("Your cart is empty!");
      navigate("/cart");
      return;
    }
    
    setLoading(true);
    
    try {
      // Step 1: Place order via backend
      const order = await placeOrder();
      console.log("Order placed:", order);
      
      // Step 2: Load Razorpay script
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        throw new Error("Failed to load payment gateway");
      }
      
      // Step 3: Open Razorpay checkout
      const options = {
        key: order.razorpay_key,
        amount: order.amount || Math.round(grandTotal * 100),
        currency: "INR",
        name: "Raviteja Home Foods",
        description: `Order ${order.razorpay_order_id}`,
        order_id: order.razorpay_order_id,
        prefill: {
          name: shippingAddress.name,
          email: user?.email || "",
          contact: shippingAddress.mobile,
        },
        notes: {
          shipping_address: shippingAddress.address_line,
        },
        theme: {
          color: "#7b1113",
        },
        handler: async (response) => {
          try {
            const verifyResult = await verifyPayment(
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
            
            if (verifyResult.status === "success") {
              await clearCart();
              navigate("/order-success", { 
                state: { orderId: verifyResult.order_id || order.razorpay_order_id } 
              });
            } else {
              alert("Payment verification failed. Please contact support.");
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      };
      
      const razorpay = new window.Razorpay(options);
      razorpay.open();
      
    } catch (err) {
      console.error("Order placement error:", err);
      alert(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  if (cartItems.length === 0) {
    return (
      <div className="checkout-page empty">
        <div className="container">
          <h2>Your cart is empty.</h2>
          <p>Please add items to your cart before checkout.</p>
          <button onClick={() => navigate("/")} className="btn-primary">
            Continue Shopping
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="checkout-page">
      <div className="container">
        <div className="checkout-container">
          {/* LEFT: Shipping Form */}
          <div className="checkout-form-section">
            <h2>Shipping Information</h2>
            
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name *</label>
                  <input
                    type="text"
                    name="name"
                    value={shippingAddress.name}
                    onChange={handleShippingChange}
                    placeholder="John Doe"
                    className={`form-input ${errors.name ? "error" : ""}`}
                  />
                  {errors.name && <span className="error-text">{errors.name}</span>}
                </div>
                
                <div className="form-group">
                  <label>Phone Number *</label>
                  <input
                    type="tel"
                    name="mobile"
                    value={shippingAddress.mobile}
                    onChange={handleShippingChange}
                    placeholder="9876543210"
                    className={`form-input ${errors.mobile ? "error" : ""}`}
                  />
                  {errors.mobile && <span className="error-text">{errors.mobile}</span>}
                </div>
              </div>

              <div className="form-group">
                <label>Address *</label>
                <textarea
                  name="address_line"
                  value={shippingAddress.address_line}
                  onChange={handleShippingChange}
                  placeholder="House No, Street, Landmark"
                  className={`form-input ${errors.address_line ? "error" : ""}`}
                  rows="2"
                />
                {errors.address_line && <span className="error-text">{errors.address_line}</span>}
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input
                    type="text"
                    name="city"
                    value={shippingAddress.city}
                    onChange={handleShippingChange}
                    placeholder="Hyderabad"
                    className={`form-input ${errors.city ? "error" : ""}`}
                  />
                  {errors.city && <span className="error-text">{errors.city}</span>}
                </div>
                
                <div className="form-group">
                  <label>State *</label>
                  <input
                    type="text"
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    placeholder="Telangana"
                    className={`form-input ${errors.state ? "error" : ""}`}
                  />
                  {errors.state && <span className="error-text">{errors.state}</span>}
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Pincode *</label>
                  <input
                    type="text"
                    name="pincode"
                    value={shippingAddress.pincode}
                    onChange={handleShippingChange}
                    placeholder="500001"
                    maxLength="6"
                    className={`form-input ${errors.pincode ? "error" : ""}`}
                  />
                  {errors.pincode && <span className="error-text">{errors.pincode}</span>}
                </div>
                
                <div className="form-group">
                  <label>Country</label>
                  <input
                    type="text"
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    placeholder="India"
                    className="form-input"
                    disabled
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={billingSameAsShipping}
                    onChange={(e) => setBillingSameAsShipping(e.target.checked)}
                  />
                  Billing address same as shipping address
                </label>
              </div>

              <button type="submit" className="btn-primary pay-btn" disabled={loading}>
                {loading ? "Processing..." : `Pay ₹${grandTotal}`}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="checkout-summary-section">
            <h2>Order Summary</h2>
            
            <div className="summary-items">
              {cartItems.map((item, index) => (
                <div className="summary-item" key={index}>
                  <div className="item-details">
                    <h4>{item.product_name}</h4>
                    <p>{item.weight} x {item.quantity}</p>
                  </div>
                  <div className="item-price">
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>
            
            <hr />
            
            <div className="summary-row">
              <span>Subtotal</span>
              <span>₹{totalPreview}</span>
            </div>
            
            <div className="summary-row">
              <span>Delivery Charges</span>
              <span>{shippingLoading ? "Calculating..." : `₹${deliveryCharge}`}</span>
            </div>
            
            <hr />
            
            <div className="summary-total">
              <span>Total to Pay:</span>
              <span>₹{grandTotal}</span>
            </div>
            
            <p className="shipping-note">
              * Free delivery on orders above ₹499
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;