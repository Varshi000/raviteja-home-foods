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
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuth();

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

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

  useEffect(() => {
    if (token) {
      loadOrders();
    }
  }, [token]);

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

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.custom_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.shipping_address?.mobile?.includes(searchTerm);
    const matchesStatus = statusFilter === "all" || order.order_status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Orders" />
        
        <div className="admin-main-content">
          <div className="orders-header">
            <div className="header-left">
              <h1>Order Management</h1>
              <p>View and manage customer orders</p>
            </div>
          </div>

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
                        <td className="order-date">{formatDate(order.created_at)}</td>
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
                        </td>
                      </tr>
                      
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
    </div>
  );
}

export default AdminOrders;