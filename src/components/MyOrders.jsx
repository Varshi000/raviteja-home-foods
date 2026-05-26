// src/components/MyOrders.jsx
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGuestOrders, createReview } from "../services/api";
import "./MyOrders.css";

function MyOrders() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState(null);
  const [activeFilter, setActiveFilter] = useState("all");
  
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [reviewerName, setReviewerName] = useState("");
  const [reviewerEmail, setReviewerEmail] = useState("");
  const [reviewerPhone, setReviewerPhone] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewMessage, setReviewMessage] = useState({ type: "", text: "" });

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = localStorage.getItem("guest_id");
      const data = await getGuestOrders(guestId);
      setOrders(data || []);
    } catch (err) {
      setError("Unable to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate, loadOrders]);

  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatPrice = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

  const getStatusLabel = (status) => {
    const labels = {
      delivered: "Delivered",
      confirmed: "Confirmed",
      processing: "Processing",
      shipped: "Shipped",
      pending: "Pending",
      cancelled: "Cancelled",
    };
    return labels[status?.toLowerCase()] || "Pending";
  };

  const getStatusClass = (status) => {
    const classes = {
      delivered: "status-delivered",
      confirmed: "status-confirmed",
      processing: "status-processing",
      shipped: "status-shipped",
      pending: "status-pending",
      cancelled: "status-cancelled",
    };
    return classes[status?.toLowerCase()] || "status-pending";
  };

  const filteredOrders = orders.filter(order => {
    if (activeFilter === "all") return true;
    if (activeFilter === "processing") {
      return ["confirmed", "processing", "shipped"].includes(order.order_status?.toLowerCase());
    }
    return order.order_status?.toLowerCase() === activeFilter;
  });

  const handleOpenReview = (product, order) => {
    setSelectedProduct({ ...product, orderId: order.id });
    setRating(5);
    setReviewTitle("");
    setReviewContent("");
    setReviewerName(order.shipping_address?.name || user?.name || "");
    setReviewerEmail(order.user_email || user?.email || "");
    setReviewerPhone(order.shipping_address?.mobile || "");
    setReviewMessage({ type: "", text: "" });
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    
    if (!rating || !reviewTitle.trim() || !reviewContent.trim() || !reviewerName.trim()) {
      setReviewMessage({ type: "error", text: "Please fill in all required fields." });
      return;
    }

    setReviewSubmitting(true);
    setReviewMessage({ type: "", text: "" });

    try {
      const formData = new FormData();
      formData.append("product_id", selectedProduct.product_id || selectedProduct.id);
      formData.append("rating", rating);
      formData.append("review_title", reviewTitle.trim());
      formData.append("review_content", reviewContent.trim());
      formData.append("display_name", reviewerName.trim());
      formData.append("email_address", reviewerEmail.trim());
      formData.append("mobile_number", reviewerPhone.trim());

      await createReview(formData);
      setReviewMessage({ type: "success", text: "Thank you! Your review has been submitted." });
      setTimeout(() => {
        setShowReviewModal(false);
        setSelectedProduct(null);
      }, 2000);
    } catch (err) {
      setReviewMessage({ type: "error", text: "Failed to submit review. Please try again." });
    } finally {
      setReviewSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="orders-loading">
        <div className="loading-spinner"></div>
        <span>Loading orders...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="orders-error">
        <p>{error}</p>
        <button onClick={loadOrders} className="retry-btn">Try Again</button>
      </div>
    );
  }

  return (
    <div className="orders-page">
      <div className="orders-container">
        {/* Header */}
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>{orders.length} order{orders.length !== 1 ? 's' : ''} total</p>
        </div>

        {/* Filters */}
        <div className="orders-filters">
          <button 
            className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
            onClick={() => setActiveFilter("all")}
          >
            All
          </button>
          <button 
            className={`filter-btn ${activeFilter === "processing" ? "active" : ""}`}
            onClick={() => setActiveFilter("processing")}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${activeFilter === "delivered" ? "active" : ""}`}
            onClick={() => setActiveFilter("delivered")}
          >
            Delivered
          </button>
          <button 
            className={`filter-btn ${activeFilter === "cancelled" ? "active" : ""}`}
            onClick={() => setActiveFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="empty-orders">
            <p>No orders found.</p>
            <button onClick={() => navigate("/")} className="shop-link">
              Continue Shopping →
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-item">
                {/* Order Header Row */}
                <div className="order-row">
                  <div className="order-meta">
                    <span className="order-number">
                      #{order.custom_order_id || order.id?.slice(-8)}
                    </span>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-right">
                    <span className={`order-status ${getStatusClass(order.order_status)}`}>
                      {getStatusLabel(order.order_status)}
                    </span>
                    <span className="order-total">{formatPrice(order.grand_total)}</span>
                    <button 
                      className="expand-btn"
                      onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                    >
                      {expandedOrderId === order.id ? "Hide" : "Details"}
                    </button>
                  </div>
                </div>

                {/* Order Items Preview */}
                <div className="order-items-preview">
                  {order.items?.slice(0, 3).map((item, idx) => (
                    <div key={idx} className="preview-item">
                      <img src={item.image_url || "/placeholder.png"} alt={item.product_name} />
                      <div>
                        <span className="preview-name">{item.product_name}</span>
                        <span className="preview-qty">Qty: {item.quantity}</span>
                      </div>
                    </div>
                  ))}
                  {order.items?.length > 3 && (
                    <div className="preview-more">+{order.items.length - 3} more</div>
                  )}
                </div>

                {/* Expanded Details */}
                {expandedOrderId === order.id && (
                  <div className="order-expanded">
                    {/* Items Table */}
                    <div className="expanded-section">
                      <h4>Items</h4>
                      <table className="items-table">
                        <thead>
                          <tr>
                            <th>Product</th>
                            <th>Weight</th>
                            <th>Qty</th>
                            <th>Price</th>
                            <th>Total</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {order.items?.map((item, idx) => (
                            <tr key={idx}>
                              <td>
                                <div className="product-cell">
                                  <img src={item.image_url || "/placeholder.png"} alt={item.product_name} />
                                  <span>{item.product_name}</span>
                                </div>
                              </td>
                              <td>{item.weight}</td>
                              <td>{item.quantity}</td>
                              <td>{formatPrice(item.price)}</td>
                              <td>{formatPrice(item.price * item.quantity)}</td>
                              <td>
                                {order.order_status?.toLowerCase() === "delivered" && (
                                  <button 
                                    className="review-link"
                                    onClick={() => handleOpenReview(item, order)}
                                  >
                                    Write review
                                  </button>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Shipping & Payment */}
                    <div className="expanded-grid">
                      <div className="expanded-section">
                        <h4>Shipping Address</h4>
                        <address>
                          <p>{order.shipping_address?.name}</p>
                          <p>{order.shipping_address?.address_line}</p>
                          <p>{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                          <p>{order.shipping_address?.pincode}</p>
                          <p>📞 {order.shipping_address?.mobile}</p>
                        </address>
                      </div>

                      <div className="expanded-section">
                        <h4>Payment Summary</h4>
                        <div className="payment-summary">
                          <div className="summary-row">
                            <span>Subtotal</span>
                            <span>{formatPrice(order.subtotal)}</span>
                          </div>
                          {order.discount_amount > 0 && (
                            <div className="summary-row">
                              <span>Discount</span>
                              <span>-{formatPrice(order.discount_amount)}</span>
                            </div>
                          )}
                          <div className="summary-row">
                            <span>Delivery</span>
                            <span>{formatPrice(order.delivery_charges)}</span>
                          </div>
                          <div className="summary-row total">
                            <span>Total</span>
                            <span>{formatPrice(order.grand_total)}</span>
                          </div>
                          {order.coupon_code && (
                            <div className="coupon-note">🎟️ {order.coupon_code}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Review Modal */}
      {showReviewModal && selectedProduct && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Write a Review</h3>
              <button className="modal-close" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleSubmitReview} className="modal-body">
              {reviewMessage.text && (
                <div className={`review-message ${reviewMessage.type}`}>
                  {reviewMessage.text}
                </div>
              )}
              
              <div className="review-product">
                <img src={selectedProduct.image_url} alt={selectedProduct.product_name} />
                <div>
                  <strong>{selectedProduct.product_name}</strong>
                  <span>{selectedProduct.weight}</span>
                </div>
              </div>

              <div className="form-field">
                <label>Rating *</label>
                <div className="stars">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      className={`star ${star <= rating ? "active" : ""}`}
                      onClick={() => setRating(star)}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-field">
                <label>Review Title *</label>
                <input
                  type="text"
                  className="field-input"
                  placeholder="Summarize your experience"
                  value={reviewTitle}
                  onChange={(e) => setReviewTitle(e.target.value)}
                  required
                />
              </div>

              <div className="form-field">
                <label>Your Review *</label>
                <textarea
                  className="field-input"
                  rows="4"
                  placeholder="Share your experience with this product"
                  value={reviewContent}
                  onChange={(e) => setReviewContent(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Your Name *</label>
                  <input
                    type="text"
                    className="field-input"
                    value={reviewerName}
                    onChange={(e) => setReviewerName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Email *</label>
                  <input
                    type="email"
                    className="field-input"
                    value={reviewerEmail}
                    onChange={(e) => setReviewerEmail(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="form-field">
                <label>Mobile Number *</label>
                <input
                  type="tel"
                  className="field-input"
                  placeholder="10-digit mobile number"
                  value={reviewerPhone}
                  onChange={(e) => setReviewerPhone(e.target.value)}
                  required
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-link" onClick={() => setShowReviewModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn-submit" disabled={reviewSubmitting}>
                  {reviewSubmitting ? "Submitting..." : "Submit Review"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;