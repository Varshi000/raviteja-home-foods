// src/components/admin/AdminCategories.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import "./AdminCategories.css";

const BASE_URL = "/api";

function AdminCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState(null);
  const [subcategoryMode, setSubcategoryMode] = useState("add");
  const [subcategoryName, setSubcategoryName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    name: "",
    business_type: "retail",
    admin_id: "",
    subcategory: [],
  });

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return { "Authorization": `Bearer ${authToken}` };
  };

  const normalizeSubcategoriesForDisplay = (subcategories) => {
    if (!subcategories || !Array.isArray(subcategories)) return [];
    return subcategories.map(sub => {
      if (typeof sub === 'string') return sub;
      if (sub && typeof sub === 'object' && sub.name) return sub.name;
      return String(sub);
    });
  };

  const normalizeSubcategoriesForApi = (subcategories) => {
    if (!subcategories || !Array.isArray(subcategories)) return [];
    return subcategories.map(sub => {
      if (typeof sub === 'string') return { name: sub };
      if (sub && typeof sub === 'object' && sub.name) return { name: sub.name };
      return { name: String(sub) };
    });
  };

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
    alert(message);
  };

  const loadCategories = async () => {
    setLoading(true);
    setError(null);
    try {
      const authToken = token || localStorage.getItem("access_token");
      
      const response = await fetch(`${BASE_URL}/categories/`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log("Categories API response:", data);
      
      let categoriesArray = [];
      
      if (data.data && Array.isArray(data.data)) {
        categoriesArray = data.data;
      } else if (Array.isArray(data)) {
        categoriesArray = data;
      } else if (data.categories && Array.isArray(data.categories)) {
        categoriesArray = data.categories;
      } else {
        categoriesArray = [];
      }
      
      const normalizedCategories = categoriesArray
        .filter(cat => cat && cat.name)
        .map(cat => ({
          id: cat._id || cat.id,
          name: cat.name,
          business_type: cat.business_type || "retail",
          admin_id: cat.admin_id || "",
          subcategory: normalizeSubcategoriesForDisplay(cat.subcategory || [])
        }));

      console.log("Normalized categories:", normalizedCategories);
      setCategories(normalizedCategories);
      
    } catch (err) {
      console.error("Failed to load categories:", err);
      showErrorMessage("Failed to load categories. Please refresh the page.");
      setCategories([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      loadCategories();
    }
  }, [token]);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.name.trim()) {
      showErrorMessage("Please enter a category name");
      setSubmitting(false);
      return;
    }

    const existingCategory = categories.find(
      cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase()
    );
    if (existingCategory) {
      showErrorMessage(`❌ Category "${formData.name.trim()}" already exists! Please use a different name.`);
      setSubmitting(false);
      return;
    }

    try {
      const authToken = token || localStorage.getItem("access_token");
      const adminId = user?.id || localStorage.getItem("admin_id") || "";

      const payload = {
        name: formData.name.trim(),
        business_type: formData.business_type,
        admin_id: adminId,
        subcategory: [],
      };

      const response = await fetch(`${BASE_URL}/categories/create`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400 || response.status === 409) {
          const errorMsg = errorData.detail || errorData.message || "";
          if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
            showErrorMessage(`❌ Category "${formData.name.trim()}" already exists! Please use a different name.`);
          } else {
            showErrorMessage(errorMsg || `Failed to create category.`);
          }
        } else {
          showErrorMessage(errorData.detail || `Failed to create category. Please try again.`);
        }
        setSubmitting(false);
        return;
      }

      await loadCategories();
      setShowAddModal(false);
      resetForm();
      showSuccessMessage(`✅ Category "${formData.name.trim()}" created successfully!`);
    } catch (err) {
      console.error("Failed to create category:", err);
      showErrorMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateCategory = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.name.trim()) {
      showErrorMessage("Please enter a category name");
      setSubmitting(false);
      return;
    }

    if (formData.name.trim().toLowerCase() !== selectedCategory.name.toLowerCase()) {
      const existingCategory = categories.find(
        cat => cat.name.toLowerCase() === formData.name.trim().toLowerCase() && cat.id !== selectedCategory.id
      );
      if (existingCategory) {
        showErrorMessage(`❌ Category "${formData.name.trim()}" already exists! Please use a different name.`);
        setSubmitting(false);
        return;
      }
    }

    try {
      const authToken = token || localStorage.getItem("access_token");
      const categoryId = selectedCategory.id || selectedCategory._id;
      
      const currentSubcategories = normalizeSubcategoriesForApi(selectedCategory.subcategory || []);
      
      const payload = {
        name: formData.name.trim(),
        business_type: formData.business_type,
        subcategory: currentSubcategories,
      };

      const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 400 || response.status === 409) {
          const errorMsg = errorData.detail || errorData.message || "";
          if (errorMsg.toLowerCase().includes("already exists") || errorMsg.toLowerCase().includes("duplicate")) {
            showErrorMessage(`❌ Category "${formData.name.trim()}" already exists! Please use a different name.`);
          } else {
            showErrorMessage(errorMsg || `Failed to update category.`);
          }
        } else {
          showErrorMessage(errorData.detail || `Failed to update category. Please try again.`);
        }
        setSubmitting(false);
        return;
      }

      await loadCategories();
      setShowEditModal(false);
      resetForm();
      showSuccessMessage(`✅ Category updated successfully!`);
    } catch (err) {
      console.error("Failed to update category:", err);
      showErrorMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCategory = async (category) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete "${category.name}"?\n\nThis will also delete all products in this category. This action cannot be undone!`)) {
      return;
    }

    setSubmitting(true);
    try {
      const authToken = token || localStorage.getItem("access_token");
      const categoryId = category.id || category._id;
      
      const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showErrorMessage(errorData.detail || `Failed to delete category. Please try again.`);
        setSubmitting(false);
        return;
      }

      await loadCategories();
      showSuccessMessage(`✅ Category "${category.name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete category:", err);
      showErrorMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddSubcategory = async () => {
    if (!subcategoryName.trim()) {
      showErrorMessage("Please enter a subcategory name");
      return;
    }

    const existingSubs = selectedCategory.subcategory || [];
    if (existingSubs.some(sub => sub.toLowerCase() === subcategoryName.trim().toLowerCase())) {
      showErrorMessage(`❌ Subcategory "${subcategoryName.trim()}" already exists in this category!`);
      return;
    }

    setSubmitting(true);
    try {
      const categoryId = selectedCategory.id || selectedCategory._id;
      const currentDisplaySubs = selectedCategory.subcategory || [];
      const updatedDisplaySubs = [...currentDisplaySubs, subcategoryName.trim()];
      const updatedApiSubs = normalizeSubcategoriesForApi(updatedDisplaySubs);
      
      const authToken = token || localStorage.getItem("access_token");
      const payload = {
        name: selectedCategory.name,
        business_type: selectedCategory.business_type,
        subcategory: updatedApiSubs,
      };

      const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showErrorMessage(errorData.detail || `Failed to add subcategory. Please try again.`);
        setSubmitting(false);
        return;
      }

      await loadCategories();
      setShowSubcategoryModal(false);
      setSubcategoryName("");
      showSuccessMessage(`✅ Subcategory "${subcategoryName.trim()}" added successfully!`);
    } catch (err) {
      console.error("Failed to add subcategory:", err);
      showErrorMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditSubcategory = async () => {
    if (!subcategoryName.trim()) {
      showErrorMessage("Please enter a subcategory name");
      return;
    }

    if (subcategoryName.trim().toLowerCase() !== selectedSubcategory.toLowerCase()) {
      const existingSubs = selectedCategory.subcategory || [];
      if (existingSubs.some(sub => sub.toLowerCase() === subcategoryName.trim().toLowerCase())) {
        showErrorMessage(`❌ Subcategory "${subcategoryName.trim()}" already exists in this category!`);
        return;
      }
    }

    setSubmitting(true);
    try {
      const categoryId = selectedCategory.id || selectedCategory._id;
      const currentDisplaySubs = selectedCategory.subcategory || [];
      const updatedDisplaySubs = currentDisplaySubs.map(sub =>
        sub === selectedSubcategory ? subcategoryName.trim() : sub
      );
      const updatedApiSubs = normalizeSubcategoriesForApi(updatedDisplaySubs);
      
      const authToken = token || localStorage.getItem("access_token");
      const payload = {
        name: selectedCategory.name,
        business_type: selectedCategory.business_type,
        subcategory: updatedApiSubs,
      };

      const response = await fetch(`${BASE_URL}/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${authToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        showErrorMessage(errorData.detail || `Failed to update subcategory. Please try again.`);
        setSubmitting(false);
        return;
      }

      await loadCategories();
      setShowSubcategoryModal(false);
      setSubcategoryName("");
      setSelectedSubcategory(null);
      showSuccessMessage(`✅ Subcategory updated successfully!`);
    } catch (err) {
      console.error("Failed to update subcategory:", err);
      showErrorMessage("❌ Network error. Please check your connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      business_type: "retail",
      admin_id: "",
      subcategory: [],
    });
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      business_type: category.business_type,
      admin_id: category.admin_id,
      subcategory: category.subcategory || [],
    });
    setShowEditModal(true);
  };

  const openAddSubcategory = (category) => {
    setSelectedCategory(category);
    setSubcategoryMode("add");
    setSubcategoryName("");
    setShowSubcategoryModal(true);
  };

  const openEditSubcategory = (category, subcategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(subcategory);
    setSubcategoryMode("edit");
    setSubcategoryName(subcategory);
    setShowSubcategoryModal(true);
  };

  const filteredCategories = categories.filter(cat =>
    cat.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const stats = {
    total: categories.length,
    withSubcategories: categories.filter(c => c.subcategory?.length > 0).length,
    totalSubcategories: categories.reduce((sum, cat) => sum + (cat.subcategory?.length || 0), 0),
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Categories" />
        
        <div className="admin-main-content">
          <div className="categories-header">
            <div className="header-left">
              <h1>Category Management</h1>
              <p>Manage your product categories and subcategories</p>
            </div>
            <button className="add-category-btn" onClick={() => setShowAddModal(true)}>
              + Add New Category
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
              <button onClick={() => setError(null)}>Dismiss</button>
            </div>
          )}

          <div className="categories-stats">
            <div className="stat-card">
              <div className="stat-icon">📁</div>
              <div className="stat-info">
                <h3>{stats.total}</h3>
                <p>Total Categories</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📂</div>
              <div className="stat-info">
                <h3>{stats.withSubcategories}</h3>
                <p>With Subcategories</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏷️</div>
              <div className="stat-info">
                <h3>{stats.totalSubcategories}</h3>
                <p>Total Subcategories</p>
              </div>
            </div>
          </div>

          <div className="categories-search">
            <input
              type="text"
              placeholder="Search categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : (
            <div className="categories-table-container">
              <table className="categories-table">
                <thead>
                  <tr>
                    <th>S.No</th>
                    <th>Category Name</th>
                    <th>Business Type</th>
                    <th>Subcategories</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map((category, index) => (
                    <tr key={category.id}>
                      <td className="serial-no">{index + 1}</td>
                      <td className="category-name">{category.name}</td>
                      <td className="business-type">
                        <span className={`business-type-badge ${category.business_type || "retail"}`}>
                          {category.business_type || "retail"}
                        </span>
                      </td>
                      <td className="subcategories-list">
                        <div className="subcategory-tags">
                          {category.subcategory && category.subcategory.length > 0 ? (
                            <>
                              {category.subcategory.map((sub, idx) => (
                                <span key={idx} className="subcategory-tag">
                                  {sub}
                                </span>
                              ))}
                              <button 
                                className="add-sub-tag"
                                onClick={() => openAddSubcategory(category)}
                              >
                                + Add
                              </button>
                            </>
                          ) : (
                            <button 
                              className="add-subcategory-btn-table"
                              onClick={() => openAddSubcategory(category)}
                            >
                              + Add Subcategory
                            </button>
                          )}
                        </div>
                      </td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEdit(category)} title="Edit Category">✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteCategory(category)} title="Delete Category">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredCategories.length === 0 && (
                <div className="no-results">No categories found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Add Category Modal */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Category</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            <form onSubmit={handleAddCategory}>
              <div className="form-group">
                <label>Category Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                  placeholder="e.g., Sweets, Namkeen, Pickles"
                />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                  className="form-input"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Creating..." : "Create Category"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditModal && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Category</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            <form onSubmit={handleUpdateCategory}>
              <div className="form-group">
                <label>Category Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Business Type</label>
                <select
                  value={formData.business_type}
                  onChange={(e) => setFormData({...formData, business_type: e.target.value})}
                  className="form-input"
                >
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                </select>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Subcategory Modal */}
      {showSubcategoryModal && selectedCategory && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>{subcategoryMode === "add" ? "Add Subcategory" : "Edit Subcategory"}</h2>
              <button className="close-modal" onClick={() => setShowSubcategoryModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <p><strong>Category:</strong> {selectedCategory.name}</p>
              <div className="form-group">
                <label>Subcategory Name</label>
                <input
                  type="text"
                  required
                  value={subcategoryName}
                  onChange={(e) => setSubcategoryName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., Gulab Jamun, Kaju Katli"
                  autoFocus
                />
              </div>
            </div>
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSubcategoryModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={subcategoryMode === "add" ? handleAddSubcategory : handleEditSubcategory} disabled={submitting}>
                {submitting ? "Saving..." : (subcategoryMode === "add" ? "Add Subcategory" : "Save Changes")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCategories;
