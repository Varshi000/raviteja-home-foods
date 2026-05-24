// src/components/admin/AdminCustomers.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import "./AdminCustomers.css";

const BASE_URL = "http://18.61.65.71:5454";

function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token } = useAuth();

  // Load all customers
  const loadCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("access_token");
      
      // Get all users from backend
      const response = await fetch(`${BASE_URL}/users/all`, {
        headers: {
          "Authorization": `Bearer ${authToken}`,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Customers loaded:", data);
      setCustomers(data.users || data.data || []);
    } catch (err) {
      console.error("Failed to load customers:", err);
      setError(err.message || "Failed to load customers");
    } finally {
      setLoading(false);
    }
  };

  // Get customer orders
  const getCustomerOrders = async (customerEmail) => {
    try {
      const authToken = token || localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/orders/user/${customerEmail}`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (response.ok) {
        const data = await response.json();
        return data.orders || data.data || [];
      }
      return [];
    } catch (err) {
      console.error("Failed to load customer orders:", err);
      return [];
    }
  };

  // View customer details
  const handleViewCustomer = async (customer) => {
    setSelectedCustomer(customer);
    const orders = await getCustomerOrders(customer.email);
    setSelectedCustomer({ ...customer, orders });
    setShowDetailsModal(true);
  };

  // Update customer status (block/unblock)
  const handleUpdateStatus = async (customerId, isActive) => {
    if (!window.confirm(`Are you sure you want to ${isActive ? "activate" : "block"} this customer?`)) return;

    try {
      const authToken = token || localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/users/update-status/${customerId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ is_active: isActive }),
      });

      if (!response.ok) throw new Error("Failed to update status");

      await loadCustomers();
      setSuccess(`Customer ${isActive ? "activated" : "blocked"} successfully!`);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
      setTimeout(() => setError(null), 3000);
    }
  };

  useEffect(() => {
    if (token) {
      loadCustomers();
    }
  }, [token]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.mobile?.includes(searchTerm);
    return matchesSearch;
  });

  const stats = {
    total: customers.length,
    active: customers.filter(c => c.is_active !== false).length,
    inactive: customers.filter(c => c.is_active === false).length,
    totalOrders: customers.reduce((sum, c) => sum + (c.total_orders || 0), 0),
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Customers" />
        
        <div className="admin-main-content">
          {/* Header */}
          <div className="customers-header">
            <div className="header-left">
              <h1>Customer Management</h1>
              <p>View and manage all registered customers</p>
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
          <div className="customers-stats">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Customers</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🟢</div>
              <div className="stat-info">
                <h3>{stats.active}</h3>
                <p>Active</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🔴</div>
              <div className="stat-info">
                <h3>{stats.inactive}</h3>
                <p>Blocked</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📦</div>
              <div className="stat-info">
                <h3>{stats.totalOrders}</h3>
                <p>Total Orders</p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="customers-search">
            <input
              type="text"
              placeholder="Search by name, email, or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {/* Customers Table */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading customers...</p>
            </div>
          ) : (
            <div className="customers-table-container">
              <table className="customers-table">
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Joined</th>
                    <th>Orders</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <div className="customer-info">
                          <div className="customer-avatar">
                            {customer.name?.charAt(0) || "U"}
                          </div>
                          <div className="customer-details">
                            <strong>{customer.name || "N/A"}</strong>
                          </div>
                        </div>
                      </td>
                      <td className="customer-email">{customer.email}</td>
                      <td className="customer-phone">{customer.mobile || "N/A"}</td>
                      <td className="customer-date">{formatDate(customer.created_at)}</td>
                      <td className="customer-orders">{customer.total_orders || 0}</td>
                      <td>
                        <span className={`status-badge ${customer.is_active !== false ? "active" : "inactive"}`}>
                          {customer.is_active !== false ? "Active" : "Blocked"}
                        </span>
                      </td>
                      <td className="actions">
                        <button 
                          className="view-btn" 
                          onClick={() => handleViewCustomer(customer)}
                          title="View Details"
                        >
                          👁️
                        </button>
                        {customer.is_active !== false ? (
                          <button 
                            className="block-btn" 
                            onClick={() => handleUpdateStatus(customer.id, false)}
                            title="Block Customer"
                          >
                            🚫
                          </button>
                        ) : (
                          <button 
                            className="activate-btn" 
                            onClick={() => handleUpdateStatus(customer.id, true)}
                            title="Activate Customer"
                          >
                            ✅
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCustomers.length === 0 && (
                <div className="no-results">
                  {searchTerm ? "No customers match your search" : "No customers found"}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Customer Details Modal */}
      {showDetailsModal && selectedCustomer && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>Customer Details</h2>
              <button className="close-modal" onClick={() => setShowDetailsModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              {/* Customer Info */}
              <div className="details-section">
                <h3>Personal Information</h3>
                <div className="info-grid">
                  <div className="info-item">
                    <label>Name:</label>
                    <span>{selectedCustomer.name || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Email:</label>
                    <span>{selectedCustomer.email}</span>
                  </div>
                  <div className="info-item">
                    <label>Mobile:</label>
                    <span>{selectedCustomer.mobile || "N/A"}</span>
                  </div>
                  <div className="info-item">
                    <label>Joined:</label>
                    <span>{formatDate(selectedCustomer.created_at)}</span>
                  </div>
                  <div className="info-item">
                    <label>Status:</label>
                    <span className={`status-badge ${selectedCustomer.is_active !== false ? "active" : "inactive"}`}>
                      {selectedCustomer.is_active !== false ? "Active" : "Blocked"}
                    </span>
                  </div>
                  <div className="info-item">
                    <label>Total Orders:</label>
                    <span>{selectedCustomer.total_orders || 0}</span>
                  </div>
                </div>
              </div>

              {/* Addresses */}
              {selectedCustomer.addresses && selectedCustomer.addresses.length > 0 && (
                <div className="details-section">
                  <h3>Saved Addresses</h3>
                  <div className="addresses-list">
                    {selectedCustomer.addresses.map((address, idx) => (
                      <div key={idx} className="address-item">
                        <p><strong>{address.name}</strong></p>
                        <p>{address.address_line}</p>
                        <p>{address.city}, {address.state} - {address.pincode}</p>
                        <p>Mobile: {address.mobile}</p>
                        {address.is_default && <span className="default-badge">Default</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Orders */}
              {selectedCustomer.orders && selectedCustomer.orders.length > 0 && (
                <div className="details-section">
                  <h3>Recent Orders</h3>
                  <div className="orders-list">
                    {selectedCustomer.orders.slice(0, 5).map((order, idx) => (
                      <div key={idx} className="order-item">
                        <div className="order-header">
                          <span className="order-id">Order #{order.custom_order_id || order.id?.slice(-8)}</span>
                          <span className={`order-status ${order.order_status}`}>{order.order_status}</span>
                        </div>
                        <div className="order-details">
                          <span>Date: {formatDate(order.created_at)}</span>
                          <span>Amount: ₹{order.grand_total}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCustomers;