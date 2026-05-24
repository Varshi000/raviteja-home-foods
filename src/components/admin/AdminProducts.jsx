// src/components/admin/AdminProducts.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import "./AdminProducts.css";

const BASE_URL = "http://18.61.65.71:5454";

function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [uploadingImages, setUploadingImages] = useState(false);
  const { token, user } = useAuth();

  const [formData, setFormData] = useState({
    product_name: "",
    description: "",
    category_id: "",
    pricing: [{ weight: "", price: "", stock: "" }],
    images_url: [],
    is_active: true,
  });

  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return { "Authorization": `Bearer ${authToken}` };
  };

  // Message helpers
  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
    alert(message);
  };

  // Get category name by ID
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category ? category.name : "N/A";
  };

  // Upload images to S3
  const uploadImages = async (files) => {
    setUploadingImages(true);
    const uploadedUrls = [];

    try {
      const authToken = token || localStorage.getItem("access_token");
      
      for (const file of files) {
        const imageFormData = new FormData();
        imageFormData.append("files", file);

        const response = await fetch(`${BASE_URL}/imagesuploads/images`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${authToken}`,
          },
          body: imageFormData,
        });

        if (!response.ok) {
          throw new Error(`Failed to upload ${file.name}`);
        }

        const data = await response.json();
        if (data.image_urls && data.image_urls.length > 0) {
          uploadedUrls.push(...data.image_urls);
        }
      }

      setFormData(prev => ({
        ...prev,
        images_url: [...prev.images_url, ...uploadedUrls]
      }));
      
      showSuccessMessage(`${uploadedUrls.length} image(s) uploaded successfully!`);
    } catch (err) {
      console.error("Upload failed:", err);
      showErrorMessage(err.message || "Failed to upload images");
    } finally {
      setUploadingImages(false);
    }
  };

  // Handle image file selection
  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = files.filter(f => !validTypes.includes(f.type));
    
    if (invalidFiles.length > 0) {
      showErrorMessage("Only JPEG, PNG, JPG, and WEBP images are allowed");
      return;
    }
    
    const largeFiles = files.filter(f => f.size > 5 * 1024 * 1024);
    if (largeFiles.length > 0) {
      showErrorMessage("Each image must be less than 5MB");
      return;
    }
    
    uploadImages(files);
  };

  // Remove image from list
  const removeImage = (indexToRemove) => {
    setFormData(prev => ({
      ...prev,
      images_url: prev.images_url.filter((_, index) => index !== indexToRemove)
    }));
  };

  // Load products
  const loadProducts = async () => {
    setLoading(true);
    try {
      const authToken = token || localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/products/all`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      setProducts(data || []);
    } catch (err) {
      console.error("Failed to load products:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load categories
  const loadCategories = async () => {
    try {
      const authToken = token || localStorage.getItem("access_token");
      const response = await fetch(`${BASE_URL}/categories/all_Categories/retail`, {
        headers: { "Authorization": `Bearer ${authToken}` },
      });
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      
      let categoryList = [];
      if (Array.isArray(data)) {
        categoryList = data.map((catName) => ({
          id: catName.toLowerCase().replace(/\s+/g, '-'),
          name: catName
        }));
      } else {
        categoryList = [
          { id: "sweets", name: "Sweets" },
          { id: "namkeen", name: "Namkeen" },
          { id: "pickles", name: "Pickles" },
          { id: "chilli-powders", name: "Chilli Powders" },
          { id: "daily-essentials", name: "Daily Essentials" },
          { id: "gift-packs", name: "Gift Packs" },
        ];
      }
      setCategories(categoryList);
    } catch (err) {
      console.error("Failed to load categories:", err);
    }
  };

  useEffect(() => {
    if (token) {
      loadProducts();
      loadCategories();
    }
  }, [token]);

  // Create product
  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.product_name.trim()) {
      showErrorMessage("Please enter product name");
      setSubmitting(false);
      return;
    }
    if (!formData.category_id) {
      showErrorMessage("Please select a category");
      setSubmitting(false);
      return;
    }

    const validPricing = formData.pricing.filter(p => p.weight && p.price);
    if (validPricing.length === 0) {
      showErrorMessage("Please add at least one valid pricing option (weight and price)");
      setSubmitting(false);
      return;
    }

    try {
      const authToken = token || localStorage.getItem("access_token");
      const adminId = user?.id || localStorage.getItem("admin_id") || "69e716e0c92ec21200cfe22a";

      const formDataToSend = new FormData();
      formDataToSend.append("product_name", formData.product_name.trim());
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("business_type", "retail");
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("pricing", JSON.stringify(validPricing.map(p => ({
        weight: p.weight,
        price: Number(p.price),
        stock: p.stock ? Number(p.stock) : null
      }))));
      formDataToSend.append("is_active", formData.is_active);
      formDataToSend.append("admin_id", adminId);
      
      if (formData.images_url.length > 0) {
        formDataToSend.append("image_urls", JSON.stringify(formData.images_url));
      }

      const response = await fetch(`${BASE_URL}/products/create_product`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      await loadProducts();
      setShowAddModal(false);
      resetForm();
      showSuccessMessage(`✅ Product "${formData.product_name}" created successfully!`);
    } catch (err) {
      console.error("Failed to create product:", err);
      showErrorMessage(err.message || "Failed to create product");
    } finally {
      setSubmitting(false);
    }
  };

  // Edit product - Open modal with product data
  const handleEditClick = (product) => {
    setSelectedProduct(product);
    
    // Parse pricing data
    let pricingData = product.pricing || [];
    if (pricingData.length === 0) {
      pricingData = [{ weight: "", price: "", stock: "" }];
    }
    
    setFormData({
      product_name: product.product_name || "",
      description: product.description || "",
      category_id: product.category_id || "",
      pricing: pricingData.map(p => ({
        weight: p.weight || "",
        price: p.price || "",
        stock: p.stock || ""
      })),
      images_url: product.images_url || [],
      is_active: product.is_active !== false,
    });
    setShowEditModal(true);
  };

  // Update product - Save changes
  const handleUpdateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!formData.product_name.trim()) {
      showErrorMessage("Please enter product name");
      setSubmitting(false);
      return;
    }

    const validPricing = formData.pricing.filter(p => p.weight && p.price);
    if (validPricing.length === 0) {
      showErrorMessage("Please add at least one valid pricing option");
      setSubmitting(false);
      return;
    }

    try {
      const authToken = token || localStorage.getItem("access_token");
      const productId = selectedProduct.id || selectedProduct._id;

      const formDataToSend = new FormData();
      formDataToSend.append("product_name", formData.product_name.trim());
      formDataToSend.append("description", formData.description || "");
      formDataToSend.append("category_id", formData.category_id);
      formDataToSend.append("pricing", JSON.stringify(validPricing.map(p => ({
        weight: p.weight,
        price: Number(p.price),
        stock: p.stock ? Number(p.stock) : null
      }))));
      formDataToSend.append("is_active", formData.is_active);
      
      if (formData.images_url.length > 0) {
        formDataToSend.append("image_urls", JSON.stringify(formData.images_url));
      }

      const response = await fetch(`${BASE_URL}/products/update_product/${productId}`, {
        method: "PUT",
        headers: { "Authorization": `Bearer ${authToken}` },
        body: formDataToSend,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      await loadProducts();
      setShowEditModal(false);
      resetForm();
      showSuccessMessage(`✅ Product "${formData.product_name}" updated successfully!`);
    } catch (err) {
      console.error("Failed to update product:", err);
      showErrorMessage(err.message || "Failed to update product");
    } finally {
      setSubmitting(false);
    }
  };

  // Delete product
  const handleDeleteProduct = async (product) => {
    if (!window.confirm(`⚠️ Are you sure you want to delete "${product.product_name}"? This action cannot be undone!`)) {
      return;
    }

    setSubmitting(true);
    try {
      const authToken = token || localStorage.getItem("access_token");
      const productId = product.id || product._id;

      const response = await fetch(`${BASE_URL}/products/delete_product/${productId}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${authToken}` },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}`);
      }

      await loadProducts();
      showSuccessMessage(`✅ Product "${product.product_name}" deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete product:", err);
      showErrorMessage(err.message || "Failed to delete product");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setFormData({
      product_name: "",
      description: "",
      category_id: "",
      pricing: [{ weight: "", price: "", stock: "" }],
      images_url: [],
      is_active: true,
    });
    setSelectedProduct(null);
  };

  const addPricingRow = () => {
    setFormData({
      ...formData,
      pricing: [...formData.pricing, { weight: "", price: "", stock: "" }]
    });
  };

  const updatePricing = (index, field, value) => {
    const newPricing = [...formData.pricing];
    newPricing[index][field] = value;
    setFormData({ ...formData, pricing: newPricing });
  };

  const removePricing = (index) => {
    if (formData.pricing.length === 1) {
      showErrorMessage("At least one pricing option is required");
      return;
    }
    const newPricing = formData.pricing.filter((_, i) => i !== index);
    setFormData({ ...formData, pricing: newPricing });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.product_name?.toLowerCase().includes(searchTerm.toLowerCase());
    const productCategory = getCategoryName(product.category_id);
    const matchesCategory = selectedCategory === "all" || productCategory.toLowerCase() === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const stats = {
    total: products.length,
    active: products.filter(p => p.is_active).length,
    inactive: products.filter(p => !p.is_active).length,
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Products" />
        
        <div className="admin-main-content">
          <div className="products-header">
            <div className="header-left">
              <h1>Product Management</h1>
              <p>Manage your product catalog</p>
            </div>
            <button className="add-product-btn" onClick={() => setShowAddModal(true)}>
              + Add New Product
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

          <div className="products-filters">
            <div className="search-box">
              <input
                type="text"
                placeholder="Search products..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
            <select 
              className="category-filter"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="all">All Categories</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.name.toLowerCase()}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="products-stats">
            <div className="stat-box">
              <span className="stat-value">{stats.total}</span>
              <span className="stat-label">Total Products</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.active}</span>
              <span className="stat-label">Active</span>
            </div>
            <div className="stat-box">
              <span className="stat-value">{stats.inactive}</span>
              <span className="stat-label">Inactive</span>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">Loading products...</div>
          ) : (
            <div className="products-table-container">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.map((product) => (
                    <tr key={product.id}>
                      <td>
                        <img 
                          src={product.images_url?.[0] || "/placeholder.png"} 
                          alt={product.product_name}
                          className="product-thumb"
                        />
                      </td>
                      <td className="product-name">{product.product_name}</td>
                      <td className="category-name">{getCategoryName(product.category_id)}</td>
                      <td>{formatCurrency(product.pricing?.[0]?.price || 0)}</td>
                      <td>{product.pricing?.[0]?.stock || "N/A"}</td>
                      <td>
                        <span className={`status-badge ${product.is_active ? "active" : "inactive"}`}>
                          {product.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="actions">
                        <button className="edit-btn" onClick={() => handleEditClick(product)} title="Edit Product">✏️</button>
                        <button className="delete-btn" onClick={() => handleDeleteProduct(product)} title="Delete Product">🗑️</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredProducts.length === 0 && (
                <div className="no-results">No products found</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ADD PRODUCT MODAL */}
      {showAddModal && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>➕ Add New Product</h2>
              <button className="close-modal" onClick={() => setShowAddModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleAddProduct}>
              <div className="modal-body">
                {/* Basic Information */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📝</span>
                    <h3>Basic Information</h3>
                  </div>
                  
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      className="form-input"
                      placeholder="e.g., Gulab Jamun, Kaju Katli"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="form-input"
                      rows="3"
                      placeholder="Describe your product..."
                    />
                  </div>
                </div>

                {/* Product Images */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">🖼️</span>
                    <h3>Product Images</h3>
                  </div>

                  <div className="image-upload-area">
                    <div className="image-upload-input">
                      <label className="upload-btn">
                        📸 Choose Images
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          multiple
                          onChange={handleImageSelect}
                          disabled={uploadingImages}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span className="upload-hint">JPEG, PNG, WEBP (Max 5MB each)</span>
                    </div>
                    
                    {uploadingImages && (
                      <div className="uploading-status">
                        <div className="spinner-small"></div>
                        <span>Uploading images...</span>
                      </div>
                    )}

                    {formData.images_url.length > 0 && (
                      <div className="image-preview-grid">
                        {formData.images_url.map((url, idx) => (
                          <div key={idx} className="image-preview-item">
                            <img src={url} alt={`Product ${idx + 1}`} />
                            <button type="button" className="remove-image" onClick={() => removeImage(idx)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📂</span>
                    <h3>Category</h3>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">💰</span>
                    <h3>Pricing & Stock</h3>
                  </div>

                  {formData.pricing.map((price, idx) => (
                    <div key={idx} className="pricing-row">
                      <input
                        type="text"
                        placeholder="Weight (e.g., 250g, 500g, 1kg)"
                        value={price.weight}
                        onChange={(e) => updatePricing(idx, "weight", e.target.value)}
                        className="pricing-weight"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={price.price}
                        onChange={(e) => updatePricing(idx, "price", e.target.value)}
                        className="pricing-price"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={price.stock}
                        onChange={(e) => updatePricing(idx, "stock", e.target.value)}
                        className="pricing-stock"
                      />
                      <button type="button" className="remove-row" onClick={() => removePricing(idx)}>🗑️</button>
                    </div>
                  ))}

                  <button type="button" className="add-row-btn" onClick={addPricingRow}>
                    + Add Another Weight Option
                  </button>
                </div>

                {/* Status */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">⚙️</span>
                    <h3>Product Status</h3>
                  </div>

                  <div className="status-options">
                    <label className="status-option">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.is_active === true}
                        onChange={() => setFormData({...formData, is_active: true})}
                      />
                      <div className="status-content">
                        <strong>🟢 Active</strong>
                        <span>Product visible to customers</span>
                      </div>
                    </label>
                    <label className="status-option">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.is_active === false}
                        onChange={() => setFormData({...formData, is_active: false})}
                      />
                      <div className="status-content">
                        <strong>🔴 Inactive</strong>
                        <span>Product hidden from customers</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting || uploadingImages}>
                  {submitting ? "Creating..." : (uploadingImages ? "Uploading..." : "✓ Create Product")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT PRODUCT MODAL */}
      {showEditModal && selectedProduct && (
        <div className="modal-overlay">
          <div className="modal-content modal-large">
            <div className="modal-header">
              <h2>✏️ Edit Product</h2>
              <button className="close-modal" onClick={() => setShowEditModal(false)}>✕</button>
            </div>
            
            <form onSubmit={handleUpdateProduct}>
              <div className="modal-body">
                {/* Basic Information */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📝</span>
                    <h3>Basic Information</h3>
                  </div>
                  
                  <div className="form-group">
                    <label>Product Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.product_name}
                      onChange={(e) => setFormData({...formData, product_name: e.target.value})}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label>Description</label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      className="form-input"
                      rows="3"
                    />
                  </div>
                </div>

                {/* Product Images */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">🖼️</span>
                    <h3>Product Images</h3>
                  </div>

                  <div className="image-upload-area">
                    <div className="image-upload-input">
                      <label className="upload-btn">
                        📸 Add More Images
                        <input
                          type="file"
                          accept="image/jpeg,image/png,image/jpg,image/webp"
                          multiple
                          onChange={handleImageSelect}
                          disabled={uploadingImages}
                          style={{ display: 'none' }}
                        />
                      </label>
                      <span className="upload-hint">Add more images to this product</span>
                    </div>
                    
                    {uploadingImages && (
                      <div className="uploading-status">
                        <div className="spinner-small"></div>
                        <span>Uploading images...</span>
                      </div>
                    )}

                    {formData.images_url.length > 0 && (
                      <div className="image-preview-grid">
                        {formData.images_url.map((url, idx) => (
                          <div key={idx} className="image-preview-item">
                            <img src={url} alt={`Product ${idx + 1}`} />
                            <button type="button" className="remove-image" onClick={() => removeImage(idx)}>✕</button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Category */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">📂</span>
                    <h3>Category</h3>
                  </div>

                  <div className="form-group">
                    <label>Category *</label>
                    <select
                      value={formData.category_id}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="form-input"
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Pricing & Stock */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">💰</span>
                    <h3>Pricing & Stock</h3>
                  </div>

                  {formData.pricing.map((price, idx) => (
                    <div key={idx} className="pricing-row">
                      <input
                        type="text"
                        placeholder="Weight (e.g., 250g, 500g, 1kg)"
                        value={price.weight}
                        onChange={(e) => updatePricing(idx, "weight", e.target.value)}
                        className="pricing-weight"
                      />
                      <input
                        type="number"
                        placeholder="Price (₹)"
                        value={price.price}
                        onChange={(e) => updatePricing(idx, "price", e.target.value)}
                        className="pricing-price"
                      />
                      <input
                        type="number"
                        placeholder="Stock"
                        value={price.stock}
                        onChange={(e) => updatePricing(idx, "stock", e.target.value)}
                        className="pricing-stock"
                      />
                      <button type="button" className="remove-row" onClick={() => removePricing(idx)}>🗑️</button>
                    </div>
                  ))}

                  <button type="button" className="add-row-btn" onClick={addPricingRow}>
                    + Add Another Weight Option
                  </button>
                </div>

                {/* Status */}
                <div className="form-section">
                  <div className="section-title">
                    <span className="section-icon">⚙️</span>
                    <h3>Product Status</h3>
                  </div>

                  <div className="status-options">
                    <label className="status-option">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.is_active === true}
                        onChange={() => setFormData({...formData, is_active: true})}
                      />
                      <div className="status-content">
                        <strong>🟢 Active</strong>
                        <span>Product visible to customers</span>
                      </div>
                    </label>
                    <label className="status-option">
                      <input
                        type="radio"
                        name="status"
                        checked={formData.is_active === false}
                        onChange={() => setFormData({...formData, is_active: false})}
                      />
                      <div className="status-content">
                        <strong>🔴 Inactive</strong>
                        <span>Product hidden from customers</span>
                      </div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting || uploadingImages}>
                  {submitting ? "Saving..." : (uploadingImages ? "Uploading..." : "✓ Save Changes")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminProducts;