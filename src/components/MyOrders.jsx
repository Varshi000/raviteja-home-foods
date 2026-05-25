// src/components/MyOrders.jsx
import { useState, useEffect } from "react";
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
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");
  
  // Review form state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewItem, setReviewItem] = useState(null);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewContent, setReviewContent] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [emailAddress, setEmailAddress] = useState("");
  const [mobileNumber, setMobileNumber] = useState("");
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(null);
  const [reviewError, setReviewError] = useState(null);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }
    loadOrders();
  }, [isAuthenticated, navigate]);

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const guestId = localStorage.getItem("guest_id");
      const ordersData = await getGuestOrders(guestId);
      setOrders(ordersData || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "status-delivered";
      case "confirmed":
      case "processing":
        return "status-processing";
      case "shipped":
        return "status-shipped";
      case "pending":
        return "status-pending";
      case "cancelled":
        return "status-cancelled";
      default:
        return "status-pending";
    }
  };

  const getStatusText = (status) => {
    switch (status?.toLowerCase()) {
      case "confirmed":
        return "Order Confirmed";
      case "processing":
        return "Processing";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Pending";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const handleOpenReviewModal = (item, order) => {
    setReviewItem(item);
    setReviewOrder(order);
    setRating(5);
    setReviewTitle("");
    setReviewContent("");
    setDisplayName(order.shipping_address?.name || user?.name || "");
    setEmailAddress(order.user_email || user?.email || "");
    setMobileNumber(order.shipping_address?.mobile || user?.mobile || "");
    setReviewSuccess(null);
    setReviewError(null);
    setShowReviewModal(true);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!reviewItem) return;

    if (!rating) {
      setReviewError("Please select a rating.");
      return;
    }
    if (!reviewTitle.trim()) {
      setReviewError("Please enter a review title.");
      return;
    }
    if (!reviewContent.trim()) {
      setReviewError("Please write some review content.");
      return;
    }
    if (!displayName.trim()) {
      setReviewError("Please enter your display name.");
      return;
    }
    if (!emailAddress.trim()) {
      setReviewError("Please enter your email address.");
      return;
    }
    if (!mobileNumber.trim()) {
      setReviewError("Please enter your mobile number.");
      return;
    }

    setReviewLoading(true);
    setReviewError(null);
    setReviewSuccess(null);

    try {
      const formData = new FormData();
      const prodId = reviewItem.product_id || reviewItem.id;
      if (!prodId) {
        throw new Error("Product identifier is missing on the order item.");
      }
      formData.append("product_id", prodId);
      formData.append("rating", rating);
      formData.append("review_title", reviewTitle);
      formData.append("review_content", reviewContent);
      formData.append("display_name", displayName);
      formData.append("email_address", emailAddress);
      formData.append("mobile_number", mobileNumber);

      const response = await createReview(formData);
      if (response && response.message) {
        setReviewSuccess("Review submitted successfully! Thank you for your feedback.");
        setTimeout(() => {
          setShowReviewModal(false);
          setReviewItem(null);
          setReviewOrder(null);
        }, 2000);
      } else {
        throw new Error("Invalid response from server.");
      }
    } catch (err) {
      console.error("Failed to submit review:", err);
      setReviewError(err.message || "Failed to submit review. Please try again.");
    } finally {
      setReviewLoading(false);
    }
  };

  const getFilteredOrders = () => {
    if (filter === "all") return orders;
    return orders.filter(order => 
      order.order_status?.toLowerCase() === filter.toLowerCase()
    );
  };

  const filteredOrders = getFilteredOrders();
  const stats = {
    total: orders.length,
    delivered: orders.filter(o => o.order_status?.toLowerCase() === "delivered").length,
    processing: orders.filter(o => 
      ["confirmed", "processing", "shipped"].includes(o.order_status?.toLowerCase())
    ).length,
    cancelled: orders.filter(o => o.order_status?.toLowerCase() === "cancelled").length,
  };

  if (loading) {
    return (
      <div className="my-orders-loading">
        <div className="spinner"></div>
        <p>Loading your orders...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="my-orders-error">
        <span className="error-icon">⚠️</span>
        <h3>Unable to load orders</h3>
        <p>{error}</p>
        <button onClick={loadOrders} className="btn-primary">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="my-orders-page">
      <div className="container">
        <div className="orders-header">
          <h1>My Orders</h1>
          <p>Track and manage your orders</p>
        </div>

        {/* Stats Cards */}
        <div className="orders-stats">
          <div className="stat-card">
            <span className="stat-icon">📦</span>
            <div className="stat-info">
              <h3>{stats.total}</h3>
              <p>Total Orders</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">✅</span>
            <div className="stat-info">
              <h3>{stats.delivered}</h3>
              <p>Delivered</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">🔄</span>
            <div className="stat-info">
              <h3>{stats.processing}</h3>
              <p>In Progress</p>
            </div>
          </div>
          <div className="stat-card">
            <span className="stat-icon">❌</span>
            <div className="stat-info">
              <h3>{stats.cancelled}</h3>
              <p>Cancelled</p>
            </div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="orders-filter">
          <button 
            className={`filter-btn ${filter === "all" ? "active" : ""}`}
            onClick={() => setFilter("all")}
          >
            All Orders
          </button>
          <button 
            className={`filter-btn ${filter === "processing" ? "active" : ""}`}
            onClick={() => setFilter("processing")}
          >
            In Progress
          </button>
          <button 
            className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
            onClick={() => setFilter("delivered")}
          >
            Delivered
          </button>
          <button 
            className={`filter-btn ${filter === "cancelled" ? "active" : ""}`}
            onClick={() => setFilter("cancelled")}
          >
            Cancelled
          </button>
        </div>

        {/* Orders List */}
        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <span className="empty-icon">📭</span>
            <h3>No orders found</h3>
            <p>
              {filter === "all" 
                ? "You haven't placed any orders yet." 
                : `No ${filter} orders found.`}
            </p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Start Shopping
            </button>
          </div>
        ) : (
          <div className="orders-list">
            {filteredOrders.map((order) => (
              <div key={order.id} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <span className="order-id">Order #{order.custom_order_id || order.id?.slice(-8)}</span>
                    <span className="order-date">{formatDate(order.created_at)}</span>
                  </div>
                  <div className="order-status">
                    <span className={`status-badge ${getStatusBadgeClass(order.order_status)}`}>
                      {getStatusText(order.order_status)}
                    </span>
                    <button 
                      className="view-details-btn"
                      onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                    >
                      {selectedOrder?.id === order.id ? "Hide Details" : "View Details"}
                    </button>
                  </div>
                </div>

                <div className="order-summary">
                  <div className="order-items-preview">
                    {order.items?.slice(0, 3).map((item, idx) => (
                      <div key={idx} className="preview-item">
                        <span>{item.product_name}</span>
                        <span>x{item.quantity}</span>
                      </div>
                    ))}
                    {order.items?.length > 3 && (
                      <div className="preview-more">
                        +{order.items.length - 3} more items
                      </div>
                    )}
                  </div>
                  <div className="order-total">
                    <span>Total:</span>
                    <strong>{formatCurrency(order.grand_total)}</strong>
                  </div>
                </div>

                {/* Expanded Order Details */}
                {selectedOrder?.id === order.id && (
                  <div className="order-details-expanded">
                    <div className="details-section">
                      <h4>Order Items</h4>
                      <div className="items-table">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="item-row">
                            <div className="item-image">
                              <img src={item.image_url} alt={item.product_name} />
                            </div>
                            <div className="item-name">
                              {item.product_name}
                              <span className="item-weight">{item.weight}</span>
                            </div>
                            <div className="item-qty">x{item.quantity}</div>
                            <div className="item-price">{formatCurrency(item.price)}</div>
                            <div className="item-total">{formatCurrency(item.price * item.quantity)}</div>
                            <div className="item-action">
                              <button 
                                className="write-review-btn"
                                onClick={() => handleOpenReviewModal(item, order)}
                              >
                                Write Review
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Shipping Address</h4>
                      <div className="address-card">
                        <p><strong>{order.shipping_address?.name}</strong></p>
                        <p>{order.shipping_address?.address_line}</p>
                        <p>{order.shipping_address?.city}, {order.shipping_address?.state}</p>
                        <p>Pincode: {order.shipping_address?.pincode}</p>
                        <p>Mobile: {order.shipping_address?.mobile}</p>
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Payment Summary</h4>
                      <div className="summary-details">
                        <div className="summary-row">
                          <span>Subtotal</span>
                          <span>{formatCurrency(order.subtotal)}</span>
                        </div>
                        {order.discount_amount > 0 && (
                          <div className="summary-row discount">
                            <span>Discount</span>
                            <span>-{formatCurrency(order.discount_amount)}</span>
                          </div>
                        )}
                        <div className="summary-row">
                          <span>Delivery Charges</span>
                          <span>{formatCurrency(order.delivery_charges)}</span>
                        </div>
                        <div className="summary-row total">
                          <span>Grand Total</span>
                          <span>{formatCurrency(order.grand_total)}</span>
                        </div>
                        {order.coupon_code && (
                          <div className="coupon-applied">
                            🎟️ Coupon applied: {order.coupon_code}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="details-section">
                      <h4>Order Timeline</h4>
                      <div className="timeline">
                        <div className="timeline-item completed">
                          <div className="timeline-dot"></div>
                          <div className="timeline-content">
                            <strong>Order Placed</strong>
                            <span>{formatDate(order.created_at)}</span>
                          </div>
                        </div>
                        {order.order_status === "confirmed" && (
                          <div className="timeline-item active">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <strong>Order Confirmed</strong>
                              <span>Your order has been confirmed</span>
                            </div>
                          </div>
                        )}
                        {order.order_status === "shipped" && (
                          <div className="timeline-item active">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <strong>Shipped</strong>
                              <span>Your order is on the way</span>
                            </div>
                          </div>
                        )}
                        {order.order_status === "delivered" && (
                          <div className="timeline-item completed">
                            <div className="timeline-dot"></div>
                            <div className="timeline-content">
                              <strong>Delivered</strong>
                              <span>Order delivered successfully</span>
                            </div>
                          </div>
                        )}
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
      {showReviewModal && reviewItem && (
        <div className="modal-overlay" onClick={() => setShowReviewModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Write a Review</h2>
              <button className="close-modal" onClick={() => setShowReviewModal(false)}>✕</button>
            </div>
            <form onSubmit={handleSubmitReview}>
              <div className="modal-body">
                {reviewSuccess && (
                  <div className="review-message success">
                    {reviewSuccess}
                  </div>
                )}
                {reviewError && (
                  <div className="review-message error">
                    ⚠️ {reviewError}
                  </div>
                )}
                
                <div className="product-review-header">
                  <img src={reviewItem.image_url} alt={reviewItem.product_name} />
                  <div>
                    <h3>{reviewItem.product_name}</h3>
                    <span>Weight: {reviewItem.weight}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label>Overall Rating</label>
                  <div className="star-rating">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        type="button"
                        key={star}
                        className={`star-btn ${star <= rating ? "selected" : ""}`}
                        onClick={() => setRating(star)}
                      >
                        ★
                      </button>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="reviewTitle">Review Title</label>
                  <input
                    type="text"
                    id="reviewTitle"
                    className="form-input"
                    placeholder="e.g. Delicious Taste, Highly Recommend!"
                    value={reviewTitle}
                    onChange={(e) => setReviewTitle(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="reviewContent">Review Details</label>
                  <textarea
                    id="reviewContent"
                    className="form-input"
                    rows="4"
                    placeholder="Tell us what you liked or disliked about this food..."
                    value={reviewContent}
                    onChange={(e) => setReviewContent(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="displayName">Your Name</label>
                  <input
                    type="text"
                    id="displayName"
                    className="form-input"
                    placeholder="e.g. John Doe"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group text-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div>
                    <label htmlFor="emailAddress">Email Address</label>
                    <input
                      type="email"
                      id="emailAddress"
                      className="form-input"
                      placeholder="e.g. john@example.com"
                      value={emailAddress}
                      onChange={(e) => setEmailAddress(e.target.value)}
                      required
                    />
                  </div>
                  <div>
                    <label htmlFor="mobileNumber">Mobile Number</label>
                    <input
                      type="tel"
                      id="mobileNumber"
                      className="form-input"
                      placeholder="e.g. 9876543210"
                      value={mobileNumber}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button 
                  type="button" 
                  className="btn-secondary" 
                  onClick={() => setShowReviewModal(false)}
                  disabled={reviewLoading}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn-primary" 
                  disabled={reviewLoading}
                >
                  {reviewLoading ? "Submitting..." : "Submit Review"}
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