// src/components/admin/AdminIssues.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import {
  FaExclamationCircle,
  FaCheckCircle,
  FaClock,
  FaFilter,
  FaSync,
  FaEye,
  FaTimes,
  FaImage,
  FaEnvelope,
  FaPhone,
  FaShoppingCart,
  FaCreditCard,
  FaTrash,
} from "react-icons/fa";
import "./AdminIssues.css";

const BASE_URL = "/api";

function AdminIssues() {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All"); // "All" | "Pending" | "Solved"
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [updatingId, setUpdatingId] = useState(null);
  const { token } = useAuth();

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return { Authorization: `Bearer ${authToken}` };
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

  // --- Fetch Issues ---
  // A 404 means "no issues found" — treat it as an empty list, not an error.
  const safeFetch = async (url) => {
    try {
      const res = await fetch(url, { headers: getAuthHeaders() });
      if (res.status === 404) return []; // empty — not an error
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (Array.isArray(json)) return json;
      if (json && Array.isArray(json.data)) return json.data;
      return [];
    } catch (err) {
      console.warn("safeFetch failed:", url, err.message);
      return null; // null signals a real network/server error
    }
  };

  const loadIssues = async (statusFilter = "All") => {
    setLoading(true);
    setError(null);

    try {
      let data = [];

      if (statusFilter === "Pending") {
        const result = await safeFetch(`${BASE_URL}/issues/pending`);
        if (result === null) throw new Error("Network error");
        data = result;
      } else if (statusFilter === "Solved") {
        const result = await safeFetch(`${BASE_URL}/issues/by_status/Solved`);
        if (result === null) throw new Error("Network error");
        data = result;
      } else {
        // "All" — fetch both and merge; treat each null as empty
        const [pending, solved] = await Promise.all([
          safeFetch(`${BASE_URL}/issues/pending`),
          safeFetch(`${BASE_URL}/issues/by_status/Solved`),
        ]);
        data = [...(pending || []), ...(solved || [])];
      }

      // Sort: Pending always at top
      data.sort((a, b) => {
        if (a.status === "Pending" && b.status !== "Pending") return -1;
        if (a.status !== "Pending" && b.status === "Pending") return 1;
        return 0;
      });

      setIssues(data);
    } catch (err) {
      console.error("Failed to load issues:", err);
      showErrorMessage("Failed to load issues. Please try again.");
      setIssues([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadIssues(filter);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  // --- View Issue Details ---
  const handleViewIssue = async (issue) => {
    // Open the modal immediately with the summary data to avoid UI delay
    setSelectedIssue(issue);
    
    const issueId = issue.issue_id || issue._id || issue.id;
    try {
      const response = await fetch(`${BASE_URL}/issues/${issueId}`, {
        headers: getAuthHeaders(),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch full issue details");
      }
      const fullIssue = await response.json();
      // Update the modal with the complete data
      setSelectedIssue((prev) => {
        // If the user hasn't closed the modal yet, update it
        if (prev && (prev.issue_id || prev._id || prev.id) === issueId) {
          return fullIssue;
        }
        return prev;
      });
    } catch (err) {
      console.error("Failed to load full issue details:", err);
      // We don't show a huge error because they at least see the summary data
    }
  };

  // --- Update Status ---
  const handleUpdateStatus = async (issue, newStatus) => {
    const issueId = issue.issue_id || issue._id || issue.id;
    setUpdatingId(issueId);
    try {
      const response = await fetch(
        `${BASE_URL}/issues/update_status/${issueId}?status=${newStatus}`,
        {
          method: "PATCH",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to update status");
      }

      showSuccessMessage(`Issue marked as "${newStatus}" successfully!`);
      // Optimistic update locally
      setIssues((prev) =>
        prev
          .map((iss) => {
            const id = iss.issue_id || iss._id || iss.id;
            return id === issueId ? { ...iss, status: newStatus } : iss;
          })
          .sort((a, b) => {
            if (a.status === "Pending" && b.status !== "Pending") return -1;
            if (a.status !== "Pending" && b.status === "Pending") return 1;
            return 0;
          })
      );

      if (selectedIssue) {
        const selId =
          selectedIssue.issue_id || selectedIssue._id || selectedIssue.id;
        if (selId === issueId) {
          setSelectedIssue((prev) => ({ ...prev, status: newStatus }));
        }
      }
    } catch (err) {
      console.error("Status update failed:", err);
      showErrorMessage(err.message || "Failed to update issue status");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Delete Issue ---
  const handleDeleteIssue = async (issueId) => {
    if (!window.confirm("Are you sure you want to delete this issue? This action cannot be undone.")) {
      return;
    }

    setUpdatingId(issueId);
    try {
      const response = await fetch(`${BASE_URL}/issues/${issueId}`, {
        method: "DELETE",
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Failed to delete issue");
      }

      showSuccessMessage("Issue successfully deleted.");
      
      // Update local state by removing the deleted issue
      setIssues((prev) => prev.filter((iss) => (iss.issue_id || iss._id || iss.id) !== issueId));
      
      // If the deleted issue was open in the modal, close it
      if (selectedIssue && (selectedIssue.issue_id || selectedIssue._id || selectedIssue.id) === issueId) {
        setSelectedIssue(null);
      }
    } catch (err) {
      console.error("Delete issue failed:", err);
      showErrorMessage(err.message || "Failed to delete issue");
    } finally {
      setUpdatingId(null);
    }
  };

  // --- Counts ---
  const pendingCount = issues.filter((i) => i.status === "Pending").length;
  const solvedCount = issues.filter((i) => i.status === "Solved").length;

  const issuesToShow =
    filter === "All"
      ? issues
      : issues.filter((i) => i.status === filter);

  const getIssueTypeBadgeClass = (type) => {
    if (type === "Refund/Return") return "badge-refund";
    if (type === "Cancel Order") return "badge-cancel";
    if (type === "Replace Order") return "badge-replace";
    return "";
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Issues" />

        <div className="admin-main-content">
          {/* Header */}
          <div className="issues-page-header">
            <div className="issues-header-left">
              <h1>
                <FaExclamationCircle className="header-icon" />
                Issues Management
              </h1>
              <p>View and manage customer-reported issues</p>
            </div>
            <button
              className="refresh-btn"
              onClick={() => loadIssues(filter)}
              title="Refresh issues"
            >
              <FaSync />
              Refresh
            </button>
          </div>

          {/* Stats Cards */}
          <div className="issues-stats-row">
            <div className="stat-card stat-all">
              <div className="stat-icon-wrap">
                <FaExclamationCircle />
              </div>
              <div>
                <p className="stat-label">Total Issues</p>
                <p className="stat-value">{issues.length}</p>
              </div>
            </div>
            <div className="stat-card stat-pending">
              <div className="stat-icon-wrap">
                <FaClock />
              </div>
              <div>
                <p className="stat-label">Pending</p>
                <p className="stat-value">{pendingCount}</p>
              </div>
            </div>
            <div className="stat-card stat-solved">
              <div className="stat-icon-wrap">
                <FaCheckCircle />
              </div>
              <div>
                <p className="stat-label">Solved</p>
                <p className="stat-value">{solvedCount}</p>
              </div>
            </div>
          </div>

          {/* Alerts */}
          {success && (
            <div className="issues-success-alert">
              <FaCheckCircle />
              <p>{success}</p>
              <button onClick={() => setSuccess(null)}>
                <FaTimes />
              </button>
            </div>
          )}
          {error && (
            <div className="issues-error-alert">
              <FaExclamationCircle />
              <p>{error}</p>
              <button onClick={() => setError(null)}>
                <FaTimes />
              </button>
            </div>
          )}

          {/* Filter Tabs */}
          <div className="issues-filter-bar">
            <div className="filter-label">
              <FaFilter />
              Filter:
            </div>
            <div className="filter-tabs">
              {["All", "Pending", "Solved"].map((tab) => (
                <button
                  key={tab}
                  className={`filter-tab ${filter === tab ? "active" : ""} filter-tab-${tab.toLowerCase()}`}
                  onClick={() => setFilter(tab)}
                >
                  {tab === "Pending" && <FaClock />}
                  {tab === "Solved" && <FaCheckCircle />}
                  {tab}
                  {tab === "Pending" && pendingCount > 0 && (
                    <span className="filter-badge">{pendingCount}</span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          {loading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Loading issues...</p>
            </div>
          ) : (
            <div className="issues-table-wrapper">
              {issuesToShow.length === 0 ? (
                <div className="issues-empty-state">
                  <FaExclamationCircle className="empty-icon" />
                  <h3>No {filter !== "All" ? filter : ""} Issues Found</h3>
                  <p>
                    {filter === "Pending"
                      ? "Great! No pending issues at the moment."
                      : filter === "Solved"
                      ? "No solved issues yet."
                      : "No issues have been submitted yet."}
                  </p>
                </div>
              ) : (
                <table className="issues-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Issue Type</th>
                      <th>Email</th>
                      <th>Order ID</th>
                      <th>Mobile</th>
                      <th>Status</th>
                      <th>Update Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {issuesToShow.map((issue, index) => {
                      const issueId =
                        issue.issue_id || issue._id || issue.id || `#${index + 1}`;
                      const isPending = issue.status === "Pending";
                      const isUpdating = updatingId === issueId;

                      return (
                        <tr
                          key={issueId}
                          className={`issues-row ${isPending ? "row-pending" : "row-solved"}`}
                        >
                          <td className="issue-num">
                            {isPending && (
                              <span className="pending-dot" title="Pending" />
                            )}
                            {index + 1}
                          </td>
                          <td>
                            <span
                              className={`issue-type-badge ${getIssueTypeBadgeClass(
                                issue.issue_type
                              )}`}
                            >
                              {issue.issue_type}
                            </span>
                          </td>
                          <td className="issue-email">{issue.email}</td>
                          <td className="issue-orderid">
                            <code>{issue.order_id}</code>
                          </td>
                          <td>{issue.mobile || "—"}</td>
                          <td>
                            <span
                              className={`status-pill ${
                                isPending ? "status-pending" : "status-solved"
                              }`}
                            >
                              {isPending ? <FaClock /> : <FaCheckCircle />}
                              {issue.status}
                            </span>
                          </td>
                          <td>
                            {isPending ? (
                              <button
                                className="mark-solved-btn"
                                onClick={() =>
                                  handleUpdateStatus(issue, "Solved")
                                }
                                disabled={isUpdating}
                                title="Mark as Solved"
                              >
                                {isUpdating ? (
                                  <span className="btn-spinner" />
                                ) : (
                                  <FaCheckCircle />
                                )}
                                {isUpdating ? "Updating..." : "Mark Solved"}
                              </button>
                            ) : (
                              <button
                                className="mark-pending-btn"
                                onClick={() =>
                                  handleUpdateStatus(issue, "Pending")
                                }
                                disabled={isUpdating}
                                title="Reopen as Pending"
                              >
                                {isUpdating ? (
                                  <span className="btn-spinner" />
                                ) : (
                                  <FaClock />
                                )}
                                {isUpdating ? "Updating..." : "Reopen"}
                              </button>
                            )}
                          </td>
                          <td>
                            <button
                              className="view-issue-btn"
                              onClick={() => handleViewIssue(issue)}
                              title="View Details"
                            >
                              <FaEye />
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedIssue && (
        <div
          className="issues-modal-overlay"
          onClick={() => setSelectedIssue(null)}
        >
          <div
            className="issues-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="issues-modal-header">
              <div>
                <h2>Issue Details</h2>
                <span
                  className={`status-pill ${
                    selectedIssue.status === "Pending"
                      ? "status-pending"
                      : "status-solved"
                  }`}
                >
                  {selectedIssue.status === "Pending" ? (
                    <FaClock />
                  ) : (
                    <FaCheckCircle />
                  )}
                  {selectedIssue.status}
                </span>
              </div>
              <button
                className="modal-close-btn"
                onClick={() => setSelectedIssue(null)}
              >
                <FaTimes />
              </button>
            </div>

            <div className="issues-modal-body">
              {/* Issue Type */}
              <div className="modal-section">
                <span
                  className={`issue-type-badge large ${getIssueTypeBadgeClass(
                    selectedIssue.issue_type
                  )}`}
                >
                  {selectedIssue.issue_type}
                </span>
              </div>

              {/* Contact Info */}
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <FaEnvelope className="info-icon" />
                  <div>
                    <p className="info-label">Email</p>
                    <p className="info-value">{selectedIssue.email}</p>
                  </div>
                </div>
                <div className="modal-info-item">
                  <FaPhone className="info-icon" />
                  <div>
                    <p className="info-label">Mobile</p>
                    <p className="info-value">{selectedIssue.mobile || "—"}</p>
                  </div>
                </div>
                <div className="modal-info-item">
                  <FaShoppingCart className="info-icon" />
                  <div>
                    <p className="info-label">Order ID</p>
                    <p className="info-value mono">{selectedIssue.order_id}</p>
                  </div>
                </div>
                <div className="modal-info-item">
                  <FaCreditCard className="info-icon" />
                  <div>
                    <p className="info-label">Payment ID</p>
                    <p className="info-value mono">
                      {selectedIssue.payment_id || "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              <div className="modal-reason-box">
                <p className="reason-label">Detailed Reason</p>
                <p className="reason-text">{selectedIssue.detailed_reason}</p>
              </div>

              {/* Images */}
              {selectedIssue.image_urls &&
                selectedIssue.image_urls.length > 0 && (
                  <div className="modal-images-section">
                    <p className="images-label">
                      <FaImage /> Attached Images (
                      {selectedIssue.image_urls.length})
                    </p>
                    <div className="images-grid">
                      {selectedIssue.image_urls.map((url, i) => (
                        <a
                          href={url}
                          target="_blank"
                          rel="noopener noreferrer"
                          key={i}
                          className="image-thumb-link"
                        >
                          <img
                            src={url}
                            alt={`Issue image ${i + 1}`}
                            className="issue-image-thumb"
                          />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

              {/* Actions */}
              <div className="modal-actions-row">
                {selectedIssue.status === "Pending" ? (
                  <button
                    className="mark-solved-btn large"
                    onClick={() =>
                      handleUpdateStatus(selectedIssue, "Solved")
                    }
                    disabled={
                      updatingId ===
                      (selectedIssue.issue_id ||
                        selectedIssue._id ||
                        selectedIssue.id)
                    }
                  >
                    <FaCheckCircle />
                    Mark as Solved
                  </button>
                ) : (
                  <button
                    className="mark-pending-btn large"
                    onClick={() =>
                      handleUpdateStatus(selectedIssue, "Pending")
                    }
                    disabled={
                      updatingId ===
                      (selectedIssue.issue_id ||
                        selectedIssue._id ||
                        selectedIssue.id)
                    }
                  >
                    <FaClock />
                    Reopen as Pending
                  </button>
                )}
                
                <button
                  className="delete-issue-btn large"
                  onClick={() =>
                    handleDeleteIssue(
                      selectedIssue.issue_id ||
                      selectedIssue._id ||
                      selectedIssue.id
                    )
                  }
                  disabled={
                    updatingId ===
                    (selectedIssue.issue_id ||
                      selectedIssue._id ||
                      selectedIssue.id)
                  }
                  style={{ backgroundColor: '#dc2626', color: 'white', border: 'none', display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 20px', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}
                >
                  <FaTrash />
                  Delete Issue
                </button>

                <button
                  className="modal-cancel-btn"
                  onClick={() => setSelectedIssue(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminIssues;
