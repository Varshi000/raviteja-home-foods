import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import "./AdminOrders.css";
import React, { useState, useEffect } from "react";

const BASE_URL = "http://18.61.65.71:5454";

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedOrderForStatus, setSelectedOrderForStatus] = useState(null);
  const [newStatus, setNewStatus] = useState("");
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuth();

  // Message helpers
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

  // Load all orders from backend
  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("access_token");
      
      const response = await fetch(`${BASE_URL}/orders/admin/all-orders`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Orders loaded:", data);
      setOrders(data.data || []);
    } catch (err) {
      console.error("Failed to load orders:", err);
      showErrorMessage(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  // Update order status
  const handleUpdateStatus = async () => {
    if (!selectedOrderForStatus) return;
    
    setUpdating(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("access_token");
      
      const response = await fetch(`${BASE_URL}/orders/admin/update_status/${selectedOrderForStatus.id}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ order_status: newStatus }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      await loadOrders();
      setShowStatusModal(false);
      setSelectedOrderForStatus(null);
      setNewStatus("");
      showSuccessMessage(`Order status updated to ${getStatusText(newStatus)} successfully!`);
    } catch (err) {
      console.error("Failed to update status:", err);
      showErrorMessage(err.message || "Failed to update order status");
    } finally {
      setUpdating(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

  // Helper functions
  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "status-delivered";
      case "confirmed":
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
        return "Confirmed";
      case "shipped":
        return "Shipped";
      case "delivered":
        return "Delivered";
      case "pending":
        return "Pending";
      case "cancelled":
        return "Cancelled";
      default:
        return status || "Pending";
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  // Filter orders
  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.custom_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.mobile?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Stats
  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.order_status === "pending").length,
    confirmed: orders.filter(o => o.order_status === "confirmed").length,
    shipped: orders.filter(o => o.order_status === "shipped").length,
    delivered: orders.filter(o => o.order_status === "delivered").length,
    cancelled: orders.filter(o => o.order_status === "cancelled").length,
    totalRevenue: orders.reduce((sum, o) => sum + (o.grand_total || 0), 0),
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Orders" />
        
        <div className="admin-main-content">
          {/* Header */}
          <div className="orders-header">
            <div className="header-left">
              <h1>Order Management</h1>
              <p>View and manage customer orders</p>
            </div>
          </div>

          {/* Success & Error Messages */}
          {success && (
            <div className="success-alert">
              <span>✅</span>
              <p>{success}</p>
              <button onClick={() => setSuccess(null)}>✕</button>
            </div>
          )}

          {error && (
            <div className="error-alert">
              <span>⚠️</span>
              <p>{error}</p>
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          {/* Stats Cards */}
          <div className="orders-stats">
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Orders</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">⏳</div>
              <div className="stat-info">
                <h3>{stats.pending}</h3>
                <p>Pending</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚚</div>
              <div className="stat-info">
                <h3>{stats.shipped + stats.confirmed}</h3>
                <p>In Progress</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">✅</div>
              <div className="stat-info">
                <h3>{stats.delivered}</h3>
                <p>Delivered</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💰</div>
              <div className="stat-info">
                <h3>{formatCurrency(stats.totalRevenue)}</h3>
                <p>Total Revenue</p>
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="orders-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search by Order ID, Customer, Email, Phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              className="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <button className="refresh-btn" onClick={loadOrders} disabled={loading}>
              {loading ? "⟳ Loading..." : "⟳ Refresh"}
            </button>
          </div>

          {/* Orders Table */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading orders...</p>
            </div>
          ) : (
            <div className="orders-table-container">
              <table className="orders-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Status</th>
                    <th>Payment</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((order) => (
                    <React.Fragment key={order.id}>
                      <tr>
                        <td className="order-id">{order.custom_order_id || order.id?.slice(-8)}</td>
                        <td>
                          <div className="customer-info">
                            <strong>{order.shipping_address?.name || "N/A"}</strong>
                            <span>{order.user_email || "N/A"}</span>
                            <span className="customer-phone">{order.shipping_address?.mobile || "N/A"}</span>
                          </div>
                        </td>
                        <td>{formatDate(order.created_at)}</td>
                        <td className="amount">{formatCurrency(order.grand_total)}</td>
                        <td>
                          <span className={`status-badge ${getStatusBadgeClass(order.order_status)}`}>
                            {getStatusText(order.order_status)}
                          </span>
                        </td>
                        <td>
                          <span className={`payment-badge ${order.payment_status === "paid" ? "paid" : "unpaid"}`}>
                            {order.payment_status === "paid" ? "Paid" : "Unpaid"}
                          </span>
                        </td>
                        <td className="actions">
                          <button 
                            className="view-btn" 
                            onClick={() => setSelectedOrder(selectedOrder?.id === order.id ? null : order)}
                          >
                            {selectedOrder?.id === order.id ? "Hide" : "View"}
                          </button>
                          <button 
                            className="update-status-btn"
                            onClick={() => {
                              setSelectedOrderForStatus(order);
                              setNewStatus(order.order_status);
                              setShowStatusModal(true);
                            }}
                          >
                            Update Status
                          </button>
                        </td>
                      </tr>
                      
                      {/* Expanded Order Details */}
                      {selectedOrder?.id === order.id && (
                        <tr className="expanded-row">
                          <td colSpan="7">
                            <div className="order-details-expanded">
                              <div className="details-grid">
                                {/* Order Items */}
                                <div className="details-section">
                                  <h4>Order Items</h4>
                                  <div className="items-list">
                                    {(order.items || []).map((item, idx) => (
                                      <div key={idx} className="item-row">
                                        <span className="item-name">{item.product_name}</span>
                                        <span className="item-weight">{item.weight}</span>
                                        <span className="item-qty">x{item.quantity}</span>
                                        <span className="item-price">{formatCurrency(item.price)}</span>
                                        <span className="item-total">{formatCurrency(item.price * item.quantity)}</span>
                                      </div>
                                    ))}
                                  </div>
                                </div>

                                {/* Order Summary */}
                                <div className="details-section">
                                  <h4>Order Summary</h4>
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
                                      <div className="coupon-info">
                                        🎟️ Coupon: {order.coupon_code}
                                      </div>
                                    )}
                                  </div>
                                </div>

                                {/* Shipping Address */}
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

                                {/* Order Information */}
                                <div className="details-section">
                                  <h4>Order Information</h4>
                                  <div className="customer-card">
                                    <p><strong>Order ID:</strong> {order.custom_order_id || order.id}</p>
                                    <p><strong>Payment ID:</strong> {order.razorpay_payment_id || "N/A"}</p>
                                    <p><strong>Order Date:</strong> {formatDate(order.created_at)}</p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  ))}
                </tbody>
              </table>
              
              {filteredOrders.length === 0 && (
                <div className="no-results">
                  {searchTerm || statusFilter !== "all" ? "No matching orders found" : "No orders yet"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Update Status Modal */}
      {showStatusModal && selectedOrderForStatus && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Update Order Status</h2>
              <button className="close-modal" onClick={() => setShowStatusModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Order ID:</strong> {selectedOrderForStatus.custom_order_id || selectedOrderForStatus.id}</p>
              <p><strong>Customer:</strong> {selectedOrderForStatus.shipping_address?.name}</p>
              <p><strong>Current Status:</strong> 
                <span className={`status-badge ${getStatusBadgeClass(selectedOrderForStatus.order_status)}`}>
                  {getStatusText(selectedOrderForStatus.order_status)}
                </span>
              </p>
              <div className="form-group">
                <label>Change Status To:</label>
                <select 
                  value={newStatus} 
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="form-input"
                >
                  <option value="pending">Pending</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="shipped">Shipped</option>
                  <option value="delivered">Delivered</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowStatusModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleUpdateStatus} disabled={updating}>
                {updating ? "Updating..." : "Update Status"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminOrders;