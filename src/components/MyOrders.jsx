// src/components/MyOrders.jsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getGuestOrders } from "../services/api";
import "./MyOrders.css";

function MyOrders() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filter, setFilter] = useState("all");

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
    </div>
  );
}

export default MyOrders;