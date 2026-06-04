// src/components/admin/AdminCoupons.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import { FaPlus, FaTrash, FaEdit, FaTicketAlt, FaClock, FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import "./AdminCoupons.css";

const BASE_URL = "/api";

function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    couponcode: "",
    coupon_type: "percentage",
    value: "",
    maximum_discount: "",
    minimum_bill: "",
    is_active: true,
    expire_date: "",
  });

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return { "Authorization": `Bearer ${authToken}` };
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

  const loadCoupons = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      const response = await fetch(`${BASE_URL}/coupons/by-admin?admin_id=${adminId}`, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setCoupons(data.data || []);
    } catch (err) {
      console.error("Failed to load coupons:", err);
      showErrorMessage("Failed to load coupons. Please refresh the page.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const adminId = user?.id || localStorage.getItem("admin_id");
    if (adminId) {
      loadCoupons();
    }
  }, [user]);

  const handleAddCoupon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const adminId = user?.id || localStorage.getItem("admin_id") || "";
    
    // Validation
    if (!formData.couponcode.trim()) {
      showErrorMessage("Please enter a coupon code");
      setSubmitting(false);
      return;
    }
    if (!formData.value || parseFloat(formData.value) <= 0) {
      showErrorMessage("Value must be greater than 0");
      setSubmitting(false);
      return;
    }

    try {
      const formPayload = new FormData();
      formPayload.append("couponcode", formData.couponcode.trim().toUpperCase());
      formPayload.append("coupon_type", formData.coupon_type);
      formPayload.append("value", formData.value);
      if (formData.maximum_discount) formPayload.append("maximum_discount", formData.maximum_discount);
      if (formData.minimum_bill) formPayload.append("minimum_bill", formData.minimum_bill);
      formPayload.append("is_active", String(formData.is_active));
      if (formData.expire_date) formPayload.append("expire_date", formData.expire_date);
      formPayload.append("admin_id", adminId);

      const response = await fetch(`${BASE_URL}/coupons/`, {
        method: "POST",
        headers: getAuthHeaders(),
        body: formPayload,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to create coupon");
      }

      await loadCoupons();
      setShowAddModal(false);
      resetForm();
      showSuccessMessage("Coupon created successfully!");
    } catch (err) {
      console.error("Failed to create coupon:", err);
      showErrorMessage(err.message || "Failed to create coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (coupon) => {
    setSelectedCoupon(coupon);
    setFormData({
      couponcode: coupon.couponcode || "",
      coupon_type: coupon.coupon_type || "percentage",
      value: coupon.value || "",
      maximum_discount: coupon.maximum_discount || "",
      minimum_bill: coupon.minimum_bill || "",
      is_active: coupon.is_active !== false,
      expire_date: coupon.expire_date ? coupon.expire_date.split("T")[0] : "",
    });
    setShowEditModal(true);
  };

  const handleUpdateCoupon = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const adminId = user?.id || localStorage.getItem("admin_id") || "";

    try {
      const formPayload = new FormData();
      formPayload.append("couponcode", formData.couponcode.trim().toUpperCase());
      formPayload.append("coupon_type", formData.coupon_type);
      formPayload.append("value", formData.value);
      formPayload.append("maximum_discount", formData.maximum_discount || "");
      formPayload.append("minimum_bill", formData.minimum_bill || "");
      formPayload.append("is_active", String(formData.is_active));
      formPayload.append("expire_date", formData.expire_date || "");
      formPayload.append("admin_id", adminId);

      const response = await fetch(`${BASE_URL}/coupons/${selectedCoupon.id || selectedCoupon._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formPayload,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update coupon");
      }

      await loadCoupons();
      setShowEditModal(false);
      resetForm();
      showSuccessMessage("Coupon updated successfully!");
    } catch (err) {
      console.error("Failed to update coupon:", err);
      showErrorMessage(err.message || "Failed to update coupon");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleStatus = async (coupon) => {
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      const formPayload = new FormData();
      formPayload.append("is_active", String(!coupon.is_active));
      formPayload.append("admin_id", adminId);

      const response = await fetch(`${BASE_URL}/coupons/${coupon.id || coupon._id}`, {
        method: "PUT",
        headers: getAuthHeaders(),
        body: formPayload,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to toggle status");
      }

      showSuccessMessage(`Coupon status updated!`);
      loadCoupons();
    } catch (err) {
      console.error("Failed to toggle coupon status:", err);
      showErrorMessage(err.message || "Failed to update coupon status");
    }
  };

  const handleDeleteCoupon = async (coupon) => {
    if (!window.confirm(`Are you sure you want to delete coupon "${coupon.couponcode.toUpperCase()}"?`)) {
      return;
    }

    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      const response = await fetch(`${BASE_URL}/coupons/${coupon.id || coupon._id}?admin_id=${adminId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete coupon");
      }

      showSuccessMessage("Coupon deleted successfully!");
      loadCoupons();
    } catch (err) {
      console.error("Failed to delete coupon:", err);
      showErrorMessage(err.message || "Failed to delete coupon");
    }
  };

  const resetForm = () => {
    setFormData({
      couponcode: "",
      coupon_type: "percentage",
      value: "",
      maximum_discount: "",
      minimum_bill: "",
      is_active: true,
      expire_date: "",
    });
    setSelectedCoupon(null);
  };

  const filteredCoupons = coupons.filter(c =>
    c.couponcode?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Coupons" />
        
        <div className="admin-main-content">
          <div className="coupons-header">
            <div className="header-left">
              <h1>Coupon Management</h1>
              <p>Create and manage promotional discount codes</p>
            </div>
            <button className="add-coupon-btn" onClick={() => { resetForm(); setShowAddModal(true); }}>
              <FaPlus /> Add New Coupon
            </button>
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
              <button onClick={() => setError(null)}>✕</button>
            </div>
          )}

          <div className="coupons-search">
            <input
              type="text"
              placeholder="Search coupons..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading coupons...</p>
            </div>
          ) : (
            <div className="coupons-table-wrapper">
              <table className="coupons-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Discount Value</th>
                    <th>Min Bill</th>
                    <th>Max Discount</th>
                    <th>Expiry Date</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCoupons.length > 0 ? (
                    filteredCoupons.map((coupon) => (
                      <tr key={coupon.id || coupon._id}>
                        <td className="coupon-code-cell">
                          <FaTicketAlt className="ticket-icon" />
                          <span>{coupon.couponcode.toUpperCase()}</span>
                        </td>
                        <td>
                          <span className={`type-badge ${coupon.coupon_type}`}>
                            {coupon.coupon_type}
                          </span>
                        </td>
                        <td>
                          {coupon.coupon_type === "percentage" ? `${coupon.value}%` : `₹${coupon.value}`}
                        </td>
                        <td>{coupon.minimum_bill ? `₹${coupon.minimum_bill}` : "-"}</td>
                        <td>{coupon.maximum_discount ? `₹${coupon.maximum_discount}` : "-"}</td>
                        <td>
                          {coupon.expire_date ? (
                            <span className="expiry-date">
                              <FaClock size={12} /> {new Date(coupon.expire_date).toLocaleDateString()}
                            </span>
                          ) : (
                            <span className="no-expiry">Never Expires</span>
                          )}
                        </td>
                        <td>
                          <button
                            onClick={() => handleToggleStatus(coupon)}
                            className={`status-toggle-btn ${coupon.is_active ? "active" : "inactive"}`}
                            title="Click to toggle status"
                          >
                            {coupon.is_active ? (
                              <><FaCheckCircle /> Active</>
                            ) : (
                              <><FaTimesCircle /> Inactive</>
                            )}
                          </button>
                        </td>
                        <td className="actions-cell">
                          <button className="edit-btn" onClick={() => handleEdit(coupon)} title="Edit">
                            <FaEdit />
                          </button>
                          <button className="delete-btn" onClick={() => handleDeleteCoupon(coupon)} title="Delete">
                            <FaTrash />
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data-cell">
                        No coupons found. Create your first coupon code by clicking "+ Add New Coupon".
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Add/Edit Modal */}
      {(showAddModal || showEditModal) && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{showAddModal ? "Create New Coupon" : "Edit Coupon"}</h2>
              <button className="close-modal" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>✕</button>
            </div>
            <form onSubmit={showAddModal ? handleAddCoupon : handleUpdateCoupon}>
              <div className="form-grid">
                <div className="form-group">
                  <label>Coupon Code *</label>
                  <input
                    type="text"
                    required
                    value={formData.couponcode}
                    onChange={(e) => setFormData({...formData, couponcode: e.target.value.toUpperCase()})}
                    className="form-input"
                    placeholder="e.g., WELCOME50"
                    disabled={showEditModal}
                  />
                </div>

                <div className="form-group">
                  <label>Coupon Type *</label>
                  <select
                    value={formData.coupon_type}
                    onChange={(e) => setFormData({...formData, coupon_type: e.target.value})}
                    className="form-input"
                  >
                    <option value="percentage">Percentage Discount (%)</option>
                    <option value="fixed">Fixed Flat Discount (₹)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Discount Value *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="form-input"
                    placeholder={formData.coupon_type === "percentage" ? "e.g., 10 for 10%" : "e.g., 100 for ₹100"}
                  />
                </div>

                <div className="form-group">
                  <label>Minimum Bill Amount (Optional)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.minimum_bill}
                    onChange={(e) => setFormData({...formData, minimum_bill: e.target.value})}
                    className="form-input"
                    placeholder="e.g., ₹499"
                  />
                </div>

                {formData.coupon_type === "percentage" && (
                  <div className="form-group">
                    <label>Maximum Discount Amount (Optional)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maximum_discount}
                      onChange={(e) => setFormData({...formData, maximum_discount: e.target.value})}
                      className="form-input"
                      placeholder="e.g., Max discount ₹150"
                    />
                  </div>
                )}

                <div className="form-group">
                  <label>Expiry Date (Optional)</label>
                  <input
                    type="date"
                    value={formData.expire_date}
                    onChange={(e) => setFormData({...formData, expire_date: e.target.value})}
                    className="form-input"
                  />
                </div>

                <div className="form-group checkbox-group">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                    />
                    Is Active
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => { setShowAddModal(false); setShowEditModal(false); resetForm(); }}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : (showAddModal ? "Create Coupon" : "Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCoupons;
