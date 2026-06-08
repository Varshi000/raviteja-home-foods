// src/components/CheckoutPage.jsx
import { useContext, useState, useEffect } from "react";
import { CartContext } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import "./CheckoutPage.css";
import { useNavigate } from "react-router-dom";
import { fetchCountries, fetchStates } from "../services/api";
import SEO from "./SEO";
import {
  Package,
  ShoppingCart,
  Lock,
  AlertTriangle,
  Tag,
  CreditCard,
  MapPin,
  Truck,
  BadgePercent,
  X,
} from "lucide-react";

const BASE_URL = "/api";

function CheckoutPage() {
  const { cartItems, subtotal, totalPreview, discountAmount, appliedCoupon, guestId, clearCart, refreshCart, applyCoupon, removeCoupon } = useContext(CartContext);
  const { user, isAuthenticated, token } = useAuth();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(false);
  const [shippingLoading, setShippingLoading] = useState(false);
  const [deliveryCharge, setDeliveryCharge] = useState(0);
  const [grandTotal, setGrandTotal] = useState(totalPreview);
  const [email, setEmail] = useState(user?.email || "");
  const [formError, setFormError] = useState("");
  
  const [shippingAddress, setShippingAddress] = useState({
    name: user?.name || "",
    mobile: user?.mobile || "",
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
  const [couponInput, setCouponInput] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState("");
  const [couponSuccess, setCouponSuccess] = useState("");
  const [countries, setCountries] = useState(["India"]);
  const [shippingStates, setShippingStates] = useState([]);
  const [billingStates, setBillingStates] = useState([]);
  const [shippingStatesLoading, setShippingStatesLoading] = useState(false);
  const [billingStatesLoading, setBillingStatesLoading] = useState(false);

  // Load countries on mount
  useEffect(() => {
    const getCountries = async () => {
      try {
        const countryList = await fetchCountries();
        if (countryList && countryList.length > 0) {
          setCountries(countryList);
        }
      } catch (err) {
        console.error("Failed to fetch countries:", err);
      }
    };
    getCountries();
  }, []);

  // Load states when shipping country changes
  useEffect(() => {
    const getShippingStates = async () => {
      if (!shippingAddress.country) {
        setShippingStates([]);
        return;
      }
      setShippingStatesLoading(true);
      try {
        const stateList = await fetchStates(shippingAddress.country);
        setShippingStates(stateList);
        // Reset state field if the current selected state is not valid for this country
        if (stateList.length > 0) {
          if (!stateList.includes(shippingAddress.state)) {
            setShippingAddress(prev => ({ ...prev, state: "" }));
          }
        } else {
          setShippingAddress(prev => ({ ...prev, state: "" }));
        }
      } catch (err) {
        console.error("Failed to fetch states for country:", shippingAddress.country, err);
        setShippingStates([]);
      } finally {
        setShippingStatesLoading(false);
      }
    };
    getShippingStates();
  }, [shippingAddress.country]);

  // Load states when billing country changes
  useEffect(() => {
    const getBillingStates = async () => {
      if (billingSameAsShipping || !billingAddress.country) {
        setBillingStates([]);
        return;
      }
      setBillingStatesLoading(true);
      try {
        const stateList = await fetchStates(billingAddress.country);
        setBillingStates(stateList);
        // Reset state field if the current selected state is not valid for this country
        if (stateList.length > 0) {
          if (!stateList.includes(billingAddress.state)) {
            setBillingAddress(prev => ({ ...prev, state: "" }));
          }
        } else {
          setBillingAddress(prev => ({ ...prev, state: "" }));
        }
      } catch (err) {
        console.error("Failed to fetch states for country:", billingAddress.country, err);
        setBillingStates([]);
      } finally {
        setBillingStatesLoading(false);
      }
    };
    getBillingStates();
  }, [billingAddress.country, billingSameAsShipping]);

  // Sync user details if authenticated
  useEffect(() => {
    if (user) {
      setEmail(prev => prev || user.email || "");
      setShippingAddress(prev => ({
        ...prev,
        name: prev.name || user.name || "",
        mobile: prev.mobile || user.mobile || "",
      }));
    }
  }, [user]);

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
    
    if (!email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = "Valid email is required";
    }
    
    if (!shippingAddress.name.trim()) newErrors.name = "Full name is required";
    if (!shippingAddress.mobile.match(/^[0-9]{10}$/)) newErrors.mobile = "Valid 10-digit mobile number required";
    if (!shippingAddress.country.trim()) newErrors.country = "Country is required";
    if (!shippingAddress.state.trim()) newErrors.state = "State is required";
    if (!shippingAddress.address_line.trim()) newErrors.address_line = "Address is required";
    if (!shippingAddress.city.trim()) newErrors.city = "City is required";
    if (!shippingAddress.pincode.match(/^[0-9]{6}$/)) newErrors.pincode = "Valid 6-digit pincode required";
    
    if (!billingSameAsShipping) {
      if (!billingAddress.name.trim()) newErrors.billing_name = "Full name is required";
      if (!billingAddress.mobile.match(/^[0-9]{10}$/)) newErrors.billing_mobile = "Valid 10-digit mobile number required";
      if (!billingAddress.country.trim()) newErrors.billing_country = "Country is required";
      if (!billingAddress.state.trim()) newErrors.billing_state = "State is required";
      if (!billingAddress.address_line.trim()) newErrors.billing_address_line = "Address is required";
      if (!billingAddress.city.trim()) newErrors.billing_city = "City is required";
      if (!billingAddress.pincode.match(/^[0-9]{6}$/)) newErrors.billing_pincode = "Valid 6-digit pincode required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Estimate delivery charge
const estimateDeliveryCharge = async () => {
  if (
    !shippingAddress.pincode ||
    shippingAddress.pincode.length !== 6
  ) {
    return;
  }

  setShippingLoading(true);

  try {
    const cartQuantity = cartItems.reduce(
      (total, item) => total + (item.quantity || 0),
      0
    );

    const response = await fetch(
      `${BASE_URL}/orders/delivery-estimate`,
      {
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

          // NEW FIELD
          cart_quantity: cartQuantity,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();

      console.error(
        "Delivery estimate error:",
        error
      );

      setDeliveryCharge(0);
    } else {
      const data = await response.json();

      setDeliveryCharge(
        data.shipping_charge || 0
      );
    }
  } catch (err) {
    console.error(
      "Delivery estimation failed:",
      err
    );

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
      email: email,
      shipping_address: shippingAddress,
      billing_address: billingSameAsShipping ? shippingAddress : billingAddress,
      coupon_code: appliedCoupon || null,
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
    setFormError("");
    
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
        image: window.location.origin + "/logo.png",
        order_id: order.razorpay_order_id,
        prefill: {
          name: shippingAddress.name,
          email: email,
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
                state: { orderId: verifyResult.custom_order_id || verifyResult.order_id || order.razorpay_order_id } 
              });
            } else {
              setFormError("Payment verification failed. Please contact support.");
              setLoading(false);
            }
          } catch (err) {
            console.error("Payment verification error:", err);
            setFormError(err.message || "Payment verification failed. Please contact support.");
            setLoading(false);
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
      setFormError(err.message || "Failed to place order. Please try again.");
      setLoading(false);
    }
  };

  const handleShippingChange = (e) => {
    const { name, value } = e.target;
    setShippingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleBillingChange = (e) => {
    const { name, value } = e.target;
    setBillingAddress(prev => ({ ...prev, [name]: value }));
    if (errors[`billing_${name}`]) setErrors(prev => ({ ...prev, [`billing_${name}`]: "" }));
  };

  const handleApplyCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    if (!couponInput.trim()) {
      setCouponError("Please enter a coupon code");
      return;
    }
    
    setCouponLoading(true);
    try {
      const result = await applyCoupon(couponInput.trim());
      if (result && result.success) {
        setCouponSuccess(result.message || "Coupon applied successfully!");
        setCouponInput("");
      } else {
        setCouponError(result?.message || "Invalid coupon code");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Failed to apply coupon");
    } finally {
      setCouponLoading(false);
    }
  };

  const handleRemoveCoupon = async () => {
    setCouponError("");
    setCouponSuccess("");
    try {
      const result = await removeCoupon();
      if (result && result.success) {
        setCouponSuccess("Coupon removed");
      } else {
        setCouponError(result?.message || "Failed to remove coupon");
      }
    } catch (err) {
      console.error(err);
      setCouponError("Failed to remove coupon");
    }
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
      <SEO title="Checkout | Raviteja Home Foods" noindex={true} />
      <div className="container">
        <div className="checkout-container">
          {/* LEFT: Shipping Form */}
          <div className="checkout-form-section">
            <h2><Package size={20} /> Shipping Information</h2>
            
            <form onSubmit={handlePayment} className="checkout-form">
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors(prev => ({ ...prev, email: "" }));
                  }}
                  placeholder="john.doe@example.com"
                  className={`form-input ${errors.email ? "error" : ""}`}
                />
                {errors.email && <span className="error-text">{errors.email}</span>}
              </div>

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

              <div className="form-row" style={{ contentVisibility: "auto" }}>
                <div className="form-group">
                  <label>Country *</label>
                  <select
                    name="country"
                    value={shippingAddress.country}
                    onChange={handleShippingChange}
                    className={`form-input ${errors.country ? "error" : ""}`}
                  >
                    <option value="">Select Country</option>
                    {countries.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  {errors.country && <span className="error-text">{errors.country}</span>}
                </div>

                <div className="form-group">
                  <label>State *</label>
                  <select
                    name="state"
                    value={shippingAddress.state}
                    onChange={handleShippingChange}
                    className={`form-input ${errors.state ? "error" : ""}`}
                    disabled={shippingStatesLoading || shippingStates.length === 0}
                  >
                    <option value="">{shippingStatesLoading ? "Loading States..." : "Select State"}</option>
                    {shippingStates.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  {errors.state && <span className="error-text">{errors.state}</span>}
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

              {!billingSameAsShipping && (
                <div className="billing-section" style={{ contentVisibility: "auto" }}>
                  <h3>Billing Information</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Full Name *</label>
                      <input
                        type="text"
                        name="name"
                        value={billingAddress.name}
                        onChange={handleBillingChange}
                        placeholder="John Doe"
                        className={`form-input ${errors.billing_name ? "error" : ""}`}
                      />
                      {errors.billing_name && <span className="error-text">{errors.billing_name}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>Phone Number *</label>
                      <input
                        type="tel"
                        name="mobile"
                        value={billingAddress.mobile}
                        onChange={handleBillingChange}
                        placeholder="9876543210"
                        className={`form-input ${errors.billing_mobile ? "error" : ""}`}
                      />
                      {errors.billing_mobile && <span className="error-text">{errors.billing_mobile}</span>}
                    </div>
                  </div>

                  <div className="form-row" style={{ contentVisibility: "auto" }}>
                    <div className="form-group">
                      <label>Country *</label>
                      <select
                        name="country"
                        value={billingAddress.country}
                        onChange={handleBillingChange}
                        className={`form-input ${errors.billing_country ? "error" : ""}`}
                      >
                        <option value="">Select Country</option>
                        {countries.map(c => (
                          <option key={c} value={c}>{c}</option>
                        ))}
                      </select>
                      {errors.billing_country && <span className="error-text">{errors.billing_country}</span>}
                    </div>

                    <div className="form-group">
                      <label>State *</label>
                      <select
                        name="state"
                        value={billingAddress.state}
                        onChange={handleBillingChange}
                        className={`form-input ${errors.billing_state ? "error" : ""}`}
                        disabled={billingStatesLoading || billingStates.length === 0}
                      >
                        <option value="">{billingStatesLoading ? "Loading States..." : "Select State"}</option>
                        {billingStates.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                      {errors.billing_state && <span className="error-text">{errors.billing_state}</span>}
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address *</label>
                    <textarea
                      name="address_line"
                      value={billingAddress.address_line}
                      onChange={handleBillingChange}
                      placeholder="House No, Street, Landmark"
                      className={`form-input ${errors.billing_address_line ? "error" : ""}`}
                      rows="2"
                    />
                    {errors.billing_address_line && <span className="error-text">{errors.billing_address_line}</span>}
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>City *</label>
                      <input
                        type="text"
                        name="city"
                        value={billingAddress.city}
                        onChange={handleBillingChange}
                        placeholder="Hyderabad"
                        className={`form-input ${errors.billing_city ? "error" : ""}`}
                      />
                      {errors.billing_city && <span className="error-text">{errors.billing_city}</span>}
                    </div>
                    
                    <div className="form-group">
                      <label>Pincode *</label>
                      <input
                        type="text"
                        name="pincode"
                        value={billingAddress.pincode}
                        onChange={handleBillingChange}
                        placeholder="500001"
                        maxLength="6"
                        className={`form-input ${errors.billing_pincode ? "error" : ""}`}
                      />
                      {errors.billing_pincode && <span className="error-text">{errors.billing_pincode}</span>}
                    </div>
                  </div>
                </div>
              )}

              {formError && (
                <div className="form-error-banner">
                  <span className="error-icon"><AlertTriangle size={18} /></span>
                  <span className="error-message-text">{formError}</span>
                </div>
              )}

              <button type="submit" className="btn-primary pay-btn" disabled={loading}>
                {loading ? (
                  <><span className="pay-spinner" /> Processing...</>
                ) : (
                  <><Lock size={16} /> Pay ₹{grandTotal} Securely</>
                )}
              </button>
            </form>
          </div>

          {/* RIGHT: Order Summary */}
          <div className="checkout-summary-section">
            <h2><ShoppingCart size={20} /> Order Summary</h2>
            
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
            
            {/* Coupon Code Block */}
            <div className="checkout-coupon-section" style={{ contentVisibility: "auto" }}>
              {appliedCoupon ? (
                <div className="applied-coupon-info">
                  <span className="coupon-tag"><Tag size={14} /> {appliedCoupon.toUpperCase()}</span>
                  <button 
                    type="button" 
                    className="btn-remove-coupon" 
                    onClick={handleRemoveCoupon}
                  >
                    <X size={13} /> Remove
                  </button>
                </div>
              ) : (
                <div className="coupon-input-group">
                  <input 
                    type="text" 
                    placeholder="Enter Coupon Code" 
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="form-input coupon-input"
                  />
                  <button 
                    type="button" 
                    className="btn-apply-coupon" 
                    onClick={handleApplyCoupon}
                    disabled={couponLoading}
                  >
                    {couponLoading ? "Applying..." : "Apply"}
                  </button>
                </div>
              )}
              {couponError && <span className="coupon-error-text">{couponError}</span>}
              {couponSuccess && <span className="coupon-success-text">{couponSuccess}</span>}
            </div>

            <hr />
            
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
              <span className="summary-row-icon"><Truck size={14} /> Delivery Charges</span>
              <span>{shippingLoading ? "Calculating..." : `₹${deliveryCharge}`}</span>
            </div>
            
            <hr />
            
            <div className="summary-total">
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span>Total to Pay:</span>
                <span className="tax-inclusive-text" style={{ fontSize: '12px', fontWeight: '400', color: 'var(--text-muted)', marginTop: '2px', textTransform: 'none' }}>
                  (Including all taxes)
                </span>
              </div>
              <span>₹{totalPreview + deliveryCharge}</span>
            </div>
            
            <p className="shipping-note">
              <Truck size={13} /> Free delivery on orders above ₹499
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CheckoutPage;
