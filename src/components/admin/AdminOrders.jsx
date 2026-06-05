import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import { updateOrderStatus, getOrderById } from "../../services/api";
import "./AdminOrders.css";
import React, { useState, useEffect } from "react";

const BASE_URL = "/api";

// Strict status transition map: key = current status, value = allowed next statuses
const VALID_TRANSITIONS = {
  pending: ["confirmed"],
  confirmed: ["shipped"],
  shipped: ["delivered"],
  delivered: [], // terminal — no further changes allowed
};

const TRANSITION_LABELS = {
  confirmed: "✓ Confirm Order",
  shipped: "📦 Mark as Shipped",
  delivered: "✅ Mark as Delivered",
};

const downloadOrderPDF = (order) => {
  const fmt = (amount) => {
    if (!amount && amount !== 0) return "₹0";
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", minimumFractionDigits: 0 }).format(amount);
  };
  const fmtDate = (d) => {
    if (!d) return "N/A";
    try {
      return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric", month: "short", year: "numeric",
        hour: "2-digit", minute: "2-digit", timeZone: "Asia/Kolkata",
      });
    } catch { return d; }
  };

  const addr = (a) => {
    if (!a) return "N/A";
    return [a.name, a.address_line, `${a.city}${a.state ? ", " + a.state : ""}`, a.country, `Pincode: ${a.pincode}`, `Mobile: ${a.mobile}`]
      .filter(Boolean).join("<br/>");
  };

  const itemsRows = (order.items || []).map((item) => `
    <tr>
      <td>${item.product_name || ""}</td>
      <td style="text-align:center">${item.weight || ""}</td>
      <td style="text-align:center">${item.quantity}</td>
      <td style="text-align:right">${fmt(item.price)}</td>
      <td style="text-align:right;font-weight:700;color:#7b1113">${fmt(item.price * item.quantity)}</td>
    </tr>`).join("");

  const statusColor = { pending: "#d32f2f", confirmed: "#ff9800", shipped: "#1976d2", delivered: "#2e7d32" }[order.order_status?.toLowerCase()] || "#6c757d";

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${order.custom_order_id || order.id}</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #222; background: #fff; padding: 32px; font-size: 13px; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 3px solid #7b1113; }
    .brand { color: #7b1113; }
    .brand h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
    .brand p { font-size: 12px; color: #888; margin-top: 2px; }
    .invoice-meta { text-align: right; }
    .invoice-meta h2 { font-size: 20px; font-weight: 700; color: #1a1a2e; }
    .invoice-meta p { font-size: 12px; color: #666; margin-top: 3px; }
    .status-chip { display: inline-block; padding: 4px 14px; border-radius: 20px; font-size: 12px; font-weight: 700; background: ${statusColor}22; color: ${statusColor}; margin-top: 6px; text-transform: capitalize; }
    .section { margin-bottom: 22px; }
    .section-title { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #7b1113; margin-bottom: 8px; padding-bottom: 4px; border-bottom: 1px solid #eee; }
    .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin-bottom: 22px; }
    .info-box { background: #fafbfc; border: 1px solid #eee; border-radius: 8px; padding: 14px; }
    .info-box p { margin-bottom: 4px; font-size: 12px; color: #555; line-height: 1.5; }
    .info-box strong { color: #1a1a2e; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 0; }
    thead tr { background: #7b1113; color: white; }
    thead th { padding: 10px 12px; text-align: left; font-size: 12px; font-weight: 600; }
    tbody tr { border-bottom: 1px solid #f0f0f0; }
    tbody tr:last-child { border-bottom: none; }
    tbody td { padding: 9px 12px; font-size: 12px; vertical-align: middle; }
    tbody tr:nth-child(even) { background: #fafbfc; }
    .totals { margin-left: auto; width: 260px; margin-top: 16px; }
    .total-row { display: flex; justify-content: space-between; padding: 5px 0; font-size: 13px; color: #555; }
    .total-row.discount { color: #2e7d32; }
    .total-row.grand { font-weight: 800; font-size: 15px; color: #7b1113; border-top: 2px solid #7b1113; padding-top: 10px; margin-top: 4px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; text-align: center; font-size: 11px; color: #aaa; }
    .payment-box { display: inline-block; padding: 3px 10px; border-radius: 20px; font-size: 11px; font-weight: 700; background: ${order.payment_status === "paid" ? "#e8f5e9" : "#fff3e0"}; color: ${order.payment_status === "paid" ? "#2e7d32" : "#f57c00"}; }
    @media print {
      body { padding: 16px; }
      @page { margin: 12mm; size: A4; }
    }
  </style>
</head>
<body>
  <div class="header">
    <div class="brand">
      <h1>Raviteja Home Foods Pvt Ltd</h1>
      <p>Authentic Home-Made Delicacies</p>
    </div>
    <div class="invoice-meta">
      <h2>ORDER INVOICE</h2>
      <p><strong>${order.custom_order_id || order.id}</strong></p>
      <p>Placed: ${fmtDate(order.created_at)}</p>
      <div class="status-chip">${order.order_status || "pending"}</div>
    </div>
  </div>

  <div class="grid-2">
    <div class="info-box">
      <p class="section-title" style="margin-bottom:8px">Customer Details</p>
      <p><strong>${order.shipping_address?.name || "N/A"}</strong></p>
      <p>📧 ${order.user_email || "N/A"}</p>
      <p>📱 ${order.shipping_address?.mobile || "N/A"}</p>
    </div>
    <div class="info-box">
      <p class="section-title" style="margin-bottom:8px">Payment</p>
      <p>Status: <span class="payment-box">${order.payment_status === "paid" ? "✅ Paid" : "⏳ Pending"}</span></p>
      <p style="margin-top:6px">Razorpay Order: <strong>${order.razorpay_order_id || "N/A"}</strong></p>
      <p>Payment ID: <strong>${order.razorpay_payment_id || "N/A"}</strong></p>
    </div>
  </div>

  <div class="grid-2">
    <div class="info-box">
      <p class="section-title" style="margin-bottom:8px">Shipping Address</p>
      <p>${addr(order.shipping_address)}</p>
    </div>
    <div class="info-box">
      <p class="section-title" style="margin-bottom:8px">Billing Address</p>
      <p>${order.billing_address ? addr(order.billing_address) : addr(order.shipping_address)}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Order Items</div>
    <table>
      <thead>
        <tr>
          <th>Product</th>
          <th style="text-align:center">Weight</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Unit Price</th>
          <th style="text-align:right">Total</th>
        </tr>
      </thead>
      <tbody>${itemsRows}</tbody>
    </table>
    <div class="totals">
      <div class="total-row"><span>Subtotal</span><span>${fmt(order.subtotal)}</span></div>
      ${order.discount_amount > 0 ? `<div class="total-row discount"><span>Discount${order.coupon_code ? " (" + order.coupon_code + ")" : ""}</span><span>-${fmt(order.discount_amount)}</span></div>` : ""}
      ${order.gst_amount > 0 ? `<div class="total-row"><span>GST</span><span>${fmt(order.gst_amount)}</span></div>` : ""}
      <div class="total-row"><span>Delivery Charges</span><span>${order.delivery_charges > 0 ? fmt(order.delivery_charges) : "Free"}</span></div>
      <div class="total-row grand"><span>Grand Total</span><span>${fmt(order.grand_total)}</span></div>
    </div>
  </div>

  <div class="footer">
    <p>Thank you for your order! | Raviteja Home Foods | Generated on ${fmtDate(new Date().toISOString())}</p>
  </div>

  <script>window.onload = () => { window.print(); window.onafterprint = () => window.close(); };<\/script>
</body>
</html>`;

  const win = window.open("", `_blank`);
  if (win) {
    win.document.write(html);
    win.document.close();
    win.document.title = order.custom_order_id || order.id;
  }
};

function OrderDetailModal({ order, onClose, onStatusUpdate, statusUpdating }) {
  if (!order) return null;

  const currentStatus = order.order_status?.toLowerCase();
  const nextStatuses = VALID_TRANSITIONS[currentStatus] || [];
  const isTerminal = currentStatus === "delivered";

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
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

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "status-delivered";
      case "confirmed": return "status-processing";
      case "shipped": return "status-shipped";
      case "pending": return "status-pending";
      case "cancelled": return "status-cancelled";
      default: return "status-pending";
    }
  };

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div
        className="modal-content"
        style={{
          maxWidth: "780px",
          width: "95%",
          maxHeight: "90vh",
          overflowY: "auto",
          borderRadius: "20px",
        }}
      >
        {/* Header */}
        <div className="modal-header" style={{ position: "sticky", top: 0, background: "white", zIndex: 10 }}>
          <div>
            <h2 style={{ margin: 0, fontSize: "18px", color: "#1a1a2e" }}>
              Order Details
            </h2>
            <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#6c757d" }}>
              {order.custom_order_id || order.id}
            </p>
          </div>
          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button
              className="btn-download-pdf"
              onClick={() => downloadOrderPDF(order)}
              title="Download order as PDF"
            >
              ⬇ Download PDF
            </button>
            <button className="close-modal" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="modal-body" style={{ padding: "20px 24px" }}>
          {/* Status + Update */}
          <div
            className="details-section status-update-section"
            style={{ marginBottom: "20px" }}
          >
            <h4>Order Status</h4>
            <div className="status-update-controls">
              <div className="current-status">
                <span className="label">Current:</span>
                <span className={`status-badge ${getStatusBadgeClass(order.order_status)}`}>
                  {order.order_status?.charAt(0).toUpperCase() + order.order_status?.slice(1) || "Pending"}
                </span>
                {isTerminal && (
                  <span style={{ fontSize: "12px", color: "#9e9e9e", marginLeft: "8px" }}>
                    🔒 Terminal state — no further updates
                  </span>
                )}
              </div>

              {/* Status flow indicator */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6c757d", flexWrap: "wrap" }}>
                {["pending", "confirmed", "shipped", "delivered"].map((step, i, arr) => (
                  <React.Fragment key={step}>
                    <span
                      style={{
                        padding: "3px 10px",
                        borderRadius: "12px",
                        fontWeight: currentStatus === step ? "700" : "500",
                        background: currentStatus === step ? "#7b1113" : "#f0f2f5",
                        color: currentStatus === step ? "white" : "#6c757d",
                        fontSize: "11px",
                        textTransform: "capitalize",
                      }}
                    >
                      {step}
                    </span>
                    {i < arr.length - 1 && <span>→</span>}
                  </React.Fragment>
                ))}
              </div>

              {!isTerminal && (
                <div className="status-selector">
                  <label>Update Status To:</label>
                  <select
                    className="status-dropdown"
                    defaultValue=""
                    disabled={statusUpdating}
                    onChange={(e) => {
                      if (e.target.value) {
                        onStatusUpdate(order.id, e.target.value);
                      }
                    }}
                  >
                    <option value="">-- Select Next Status --</option>
                    {nextStatuses.map((s) => (
                      <option key={s} value={s}>
                        {TRANSITION_LABELS[s] || s}
                      </option>
                    ))}
                  </select>
                  {statusUpdating && (
                    <p style={{ fontSize: "12px", color: "#7b1113", margin: "4px 0 0" }}>
                      ⏳ Updating status…
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* 2-column detail grid */}
          <div className="details-grid" style={{ gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            {/* Order Items */}
            <div className="details-section" style={{ gridColumn: "1 / -1" }}>
              <h4>Order Items</h4>
              <div className="items-list">
                {(order.items || []).map((item, idx) => (
                  <div key={idx} className="item-row" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    {item.image_url && (
                      <img
                        src={item.image_url}
                        alt={item.product_name}
                        style={{ width: "42px", height: "42px", objectFit: "cover", borderRadius: "8px", flexShrink: 0 }}
                        onError={(e) => { e.target.style.display = "none"; }}
                      />
                    )}
                    <span className="item-name" style={{ flex: 2 }}>{item.product_name}</span>
                    <span className="item-weight" style={{ flex: 1, textAlign: "center" }}>{item.weight}</span>
                    <span className="item-qty" style={{ flex: "0 0 40px", textAlign: "center" }}>×{item.quantity}</span>
                    <span className="item-price" style={{ flex: 1, textAlign: "right" }}>{formatCurrency(item.price)}</span>
                    <span className="item-total" style={{ flex: 1, textAlign: "right", fontWeight: 700, color: "#7b1113" }}>
                      {formatCurrency(item.price * item.quantity)}
                    </span>
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
                    <span>Discount {order.coupon_code ? `(${order.coupon_code})` : ""}</span>
                    <span>-{formatCurrency(order.discount_amount)}</span>
                  </div>
                )}
                {order.gst_amount > 0 && (
                  <div className="summary-row">
                    <span>GST</span>
                    <span>{formatCurrency(order.gst_amount)}</span>
                  </div>
                )}
                <div className="summary-row">
                  <span>Delivery Charges</span>
                  <span>{order.delivery_charges > 0 ? formatCurrency(order.delivery_charges) : "Free"}</span>
                </div>
                <div className="summary-row total">
                  <span>Grand Total</span>
                  <span>{formatCurrency(order.grand_total)}</span>
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="details-section">
              <h4>Shipping Address</h4>
              <div className="address-card">
                <p><strong>{order.shipping_address?.name}</strong></p>
                <p>{order.shipping_address?.address_line}</p>
                <p>
                  {order.shipping_address?.city}
                  {order.shipping_address?.state ? `, ${order.shipping_address.state}` : ""}
                </p>
                {order.shipping_address?.country && <p>{order.shipping_address.country}</p>}
                <p>Pincode: {order.shipping_address?.pincode}</p>
                <p>📱 {order.shipping_address?.mobile}</p>
              </div>
            </div>

            {/* Billing Address */}
            {order.billing_address && (
              <div className="details-section">
                <h4>Billing Address</h4>
                <div className="address-card">
                  <p><strong>{order.billing_address?.name}</strong></p>
                  <p>{order.billing_address?.address_line}</p>
                  <p>
                    {order.billing_address?.city}
                    {order.billing_address?.state ? `, ${order.billing_address.state}` : ""}
                  </p>
                  {order.billing_address?.country && <p>{order.billing_address.country}</p>}
                  <p>Pincode: {order.billing_address?.pincode}</p>
                  <p>📱 {order.billing_address?.mobile}</p>
                </div>
              </div>
            )}

            {/* Payment & Order Info */}
            <div className="details-section">
              <h4>Payment Information</h4>
              <div className="customer-card">
                <p>
                  <strong>Payment Status:</strong>{" "}
                  <span className={`payment-status ${order.payment_status}`}>
                    {order.payment_status === "paid" ? "✅ Paid" : "⏳ Pending"}
                  </span>
                </p>
                <p>
                  <strong>Razorpay Order ID:</strong>{" "}
                  <span className={order.razorpay_order_id ? "order-id-value" : "payment-na"}>
                    {order.razorpay_order_id || "N/A"}
                  </span>
                </p>
                <p>
                  <strong>Payment ID:</strong>{" "}
                  <span className={order.razorpay_payment_id ? "payment-id-value" : "payment-na"}>
                    {order.razorpay_payment_id || "Not yet processed"}
                  </span>
                </p>
              </div>
            </div>

            {/* Order Metadata */}
            <div className="details-section">
              <h4>Order Information</h4>
              <div className="customer-card">
                <p>
                  <strong>Custom Order ID:</strong>{" "}
                  <span className="order-id-value">{order.custom_order_id || "N/A"}</span>
                </p>
                <p>
                  <strong>MongoDB ID:</strong>{" "}
                  <span style={{ fontSize: "11px", color: "#6c757d", fontFamily: "monospace" }}>{order.id}</span>
                </p>
                <p><strong>Customer Email:</strong> {order.user_email || "N/A"}</p>
                <p><strong>Placed On:</strong> {formatDate(order.created_at)}</p>
                <p><strong>Last Updated:</strong> {formatDate(order.updated_at)}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="modal-actions">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
}

function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Modal state
  const [modalOrder, setModalOrder] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);

  const { token } = useAuth();

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 5000);
  };

  const loadOrders = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/orders/admin/all-orders`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setOrders(data.data || []);
    } catch (err) {
      showErrorMessage(err.message || "Failed to load orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) loadOrders();
  }, [token]);

  // Open modal and fetch full order details from GET /orders/order/{id}
  const handleViewOrder = async (orderId) => {
    setModalLoading(true);
    setModalOrder(null);
    try {
      const data = await getOrderById(orderId);
      setModalOrder(data.order || data);
    } catch (err) {
      showErrorMessage(err.message || "Failed to fetch order details");
    } finally {
      setModalLoading(false);
    }
  };

  // PATCH /orders/admin/update-status/{order_id}?new_status=...
  const handleStatusUpdate = async (orderId, newStatus) => {
    setStatusUpdating(true);
    try {
      const result = await updateOrderStatus(orderId, newStatus);
      showSuccessMessage(result?.message || `Order status updated to ${newStatus}!`);
      // Refresh the modal order to reflect the new status
      const refreshed = await getOrderById(orderId);
      setModalOrder(refreshed.order || refreshed);
      // Also refresh the orders list
      await loadOrders();
    } catch (err) {
      showErrorMessage(err.message || "Failed to update order status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case "delivered": return "status-delivered";
      case "confirmed": return "status-processing";
      case "shipped": return "status-shipped";
      case "pending": return "status-pending";
      case "cancelled": return "status-cancelled";
      default: return "status-pending";
    }
  };

  const getStatusText = (status) => {
    if (!status) return "Pending";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      return new Date(dateString).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        timeZone: "Asia/Kolkata",
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

  const STATUS_PRIORITY = { pending: 0, confirmed: 1, shipped: 2, delivered: 3 };

  const filteredOrders = orders
    .filter((order) => {
      const matchesSearch =
        order.custom_order_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.user_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.shipping_address?.mobile?.includes(searchTerm);
      const matchesStatus =
        statusFilter === "all" || order.order_status === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((a, b) => {
      const pa = STATUS_PRIORITY[a.order_status?.toLowerCase()] ?? 99;
      const pb = STATUS_PRIORITY[b.order_status?.toLowerCase()] ?? 99;
      if (pa !== pb) return pa - pb;
      // Within the same status group — newest order first
      const da = new Date(a.created_at || 0).getTime();
      const db = new Date(b.created_at || 0).getTime();
      return db - da;
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
                    <tr key={order.id}>
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
                          onClick={() => handleViewOrder(order.id)}
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {filteredOrders.length === 0 && (
                <div className="no-results">
                  {searchTerm || statusFilter !== "all"
                    ? "No matching orders found"
                    : "No orders yet"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Loading overlay while fetching order details */}
      {modalLoading && (
        <div className="modal-overlay">
          <div style={{ background: "white", borderRadius: "20px", padding: "40px 60px", textAlign: "center" }}>
            <div className="spinner" style={{ margin: "0 auto 16px" }}></div>
            <p style={{ color: "#6c757d", margin: 0 }}>Fetching order details…</p>
          </div>
        </div>
      )}

      {/* Order Detail Modal */}
      {modalOrder && !modalLoading && (
        <OrderDetailModal
          order={modalOrder}
          onClose={() => setModalOrder(null)}
          onStatusUpdate={handleStatusUpdate}
          statusUpdating={statusUpdating}
        />
      )}
    </div>
  );
}

export default AdminOrders;
