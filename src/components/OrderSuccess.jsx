// src/components/OrderSuccess.jsx
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./OrderSuccess.css";
import SEO from "./SEO";

function OrderSuccess() {
  const navigate = useNavigate();
  const location = useLocation();
  const [orderId, setOrderId] = useState(null);
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    // Get order ID from location state or localStorage
    const id = location.state?.orderId || localStorage.getItem("last_order_id");
    if (id) {
      setOrderId(id);
      localStorage.removeItem("last_order_id");
    }

    // Countdown redirect
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          navigate("/");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate, location]);

  const handleContinueShopping = () => {
    navigate("/");
  };

  const handleViewOrders = () => {
    navigate("/my-orders");
  };

  return (
    <div className="order-success-page">
      <SEO title="Order Success | Raviteja Home Foods" noindex={true} />
      <div className="container">
        <div className="success-card">
          <div className="success-icon">
            <span className="checkmark">✓</span>
          </div>
          
          <h1>Order Confirmed! 🎉</h1>
          
          <p className="success-message">
            Thank you for shopping with Raviteja Home Foods.
            Your order has been successfully placed.
          </p>

          {orderId && (
            <div className="order-details">
              <span className="order-label">Order ID:</span>
              <strong className="order-id">{orderId}</strong>
            </div>
          )}

          <div className="order-info">
            <div className="info-row">
              <span>📧</span>
              <span>A confirmation email has been sent to your registered email address</span>
            </div>
            <div className="info-row">
              <span>📱</span>
              <span>You will receive SMS updates about your order status</span>
            </div>
            <div className="info-row">
              <span>🚚</span>
              <span>Estimated delivery: 3-5 business days</span>
            </div>
          </div>

          <div className="action-buttons">
            <button className="btn-primary" onClick={handleContinueShopping}>
              Continue Shopping
            </button>
            <button className="btn-secondary" onClick={handleViewOrders}>
              View My Orders
            </button>
          </div>

          <div className="redirect-message">
            Redirecting to home page in {countdown} seconds...
          </div>
        </div>

        {/* Social Share Section */}
        <div className="share-section">
          <h3>Share your happiness ❤️</h3>
          <p>Tag us @ravitejafoods on social media</p>
          <div className="social-icons">
            <button className="social-icon instagram">📷</button>
            <button className="social-icon facebook">📘</button>
            <button className="social-icon twitter">🐦</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderSuccess;
