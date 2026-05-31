// src/components/admin/AdminShipping.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { useAuth } from "../../context/AuthContext";
import { 
  getShippingRules, 
  createShippingRules, 
  addShippingState, 
  addShippingZone,
  updateShippingZone,
  deleteShippingZone,
  deleteShippingState,
  deleteShippingCountry
} from "../../services/api";
import "./AdminShipping.css";

function AdminShipping() {
  const [shippingConfigs, setShippingConfigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  
  // Modal toggle states
  const [activeModal, setActiveModal] = useState(null); // 'addCountry' | 'addState' | 'addZone' | 'editZone'
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedState, setSelectedState] = useState("");
  const [selectedZone, setSelectedZone] = useState(null);

  // Form states
  const [newCountryName, setNewCountryName] = useState("");
  const [newStateName, setNewStateName] = useState("");
  const [zoneFormData, setZoneFormData] = useState({
    startZipcode: "",
    endZipcode: "",
    chargePerKg: "",
    freeDeliveryMinOrderValue: ""
  });

  // Accordion state
  const [expandedStates, setExpandedStates] = useState({});

  const { user } = useAuth();

  const showSuccessMessage = (message) => {
    setSuccess(message);
    setTimeout(() => setSuccess(null), 3000);
  };

  const showErrorMessage = (message) => {
    setError(message);
    setTimeout(() => setError(null), 4000);
  };

  const loadShippingRules = async () => {
    setLoading(true);
    setError(null);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      if (!adminId) {
        throw new Error("Admin ID not found. Please log in again.");
      }
      const data = await getShippingRules(adminId);
      setShippingConfigs(data || []);
    } catch (err) {
      console.error("Failed to load shipping rules:", err);
      showErrorMessage(err.message || "Failed to load shipping configurations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShippingRules();
  }, []);

  const handleAddCountry = async (e) => {
    e.preventDefault();
    if (!newCountryName.trim()) {
      showErrorMessage("Country name is required");
      return;
    }

    // Check duplicate
    const exists = shippingConfigs.some(
      (c) => c.country.toLowerCase() === newCountryName.trim().toLowerCase()
    );
    if (exists) {
      showErrorMessage(`Shipping rules for "${newCountryName}" are already configured.`);
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await createShippingRules(adminId, newCountryName.trim());
      await loadShippingRules();
      setActiveModal(null);
      setNewCountryName("");
      showSuccessMessage("Country configuration created successfully!");
    } catch (err) {
      console.error("Failed to create shipping rules:", err);
      showErrorMessage(err.message || "Failed to configure country.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddState = async (e) => {
    e.preventDefault();
    if (!newStateName.trim()) {
      showErrorMessage("State name is required");
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await addShippingState(adminId, selectedCountry, newStateName.trim());
      await loadShippingRules();
      setActiveModal(null);
      setNewStateName("");
      showSuccessMessage(`State "${newStateName.trim()}" added successfully!`);
    } catch (err) {
      console.error("Failed to add state:", err);
      showErrorMessage(err.message || "Failed to add state. It may already exist.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleAddZone = async (e) => {
    e.preventDefault();
    const { startZipcode, endZipcode, chargePerKg, freeDeliveryMinOrderValue } = zoneFormData;

    if (!startZipcode || !endZipcode || !chargePerKg) {
      showErrorMessage("Start Pincode, End Pincode, and Charge per KG are required");
      return;
    }

    if (parseInt(startZipcode) > parseInt(endZipcode)) {
      showErrorMessage("Start Pincode must be less than or equal to End Pincode");
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await addShippingZone(adminId, selectedCountry, selectedState, zoneFormData);
      await loadShippingRules();
      setActiveModal(null);
      setZoneFormData({
        startZipcode: "",
        endZipcode: "",
        chargePerKg: "",
        freeDeliveryMinOrderValue: ""
      });
      showSuccessMessage("Zipcode delivery zone added successfully!");
    } catch (err) {
      console.error("Failed to add zone:", err);
      showErrorMessage(err.message || "Failed to add zone. Check for overlapping pincode ranges.");
    } finally {
      setSubmitting(false);
    }
  };

  const toggleStateAccordion = (country, stateName) => {
    const key = `${country}-${stateName}`;
    setExpandedStates((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const openAddStateModal = (countryName) => {
    setSelectedCountry(countryName);
    setNewStateName("");
    setActiveModal("addState");
  };

  const openAddZoneModal = (countryName, stateName) => {
    setSelectedCountry(countryName);
    setSelectedState(stateName);
    setSelectedZone(null);
    setZoneFormData({
      startZipcode: "",
      endZipcode: "",
      chargePerKg: "",
      freeDeliveryMinOrderValue: ""
    });
    setActiveModal("addZone");
  };

  const openEditZoneModal = (countryName, stateName, zone) => {
    setSelectedCountry(countryName);
    setSelectedState(stateName);
    setSelectedZone(zone);
    setZoneFormData({
      startZipcode: zone.start_zipcode.toString(),
      endZipcode: zone.end_zipcode.toString(),
      chargePerKg: zone.charge_per_kg.toString(),
      freeDeliveryMinOrderValue: zone.free_delivery_min_order_value.toString()
    });
    setActiveModal("editZone");
  };

  const handleEditZone = async (e) => {
    e.preventDefault();
    const { startZipcode, endZipcode, chargePerKg, freeDeliveryMinOrderValue } = zoneFormData;

    if (!chargePerKg && !freeDeliveryMinOrderValue) {
      showErrorMessage("Please update at least one field (charge or free delivery threshold)");
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await updateShippingZone(
        adminId, 
        selectedCountry, 
        selectedState, 
        selectedZone.start_zipcode,
        selectedZone.end_zipcode,
        chargePerKg || undefined,
        freeDeliveryMinOrderValue || undefined
      );
      await loadShippingRules();
      setActiveModal(null);
      setZoneFormData({
        startZipcode: "",
        endZipcode: "",
        chargePerKg: "",
        freeDeliveryMinOrderValue: ""
      });
      showSuccessMessage("Delivery zone updated successfully!");
    } catch (err) {
      console.error("Failed to update zone:", err);
      showErrorMessage(err.message || "Failed to update zone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteZone = async (countryName, stateName, zone) => {
    if (!confirm(`Are you sure you want to delete the zone for pincodes ${zone.start_zipcode} - ${zone.end_zipcode}?`)) {
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await deleteShippingZone(adminId, countryName, stateName, zone.start_zipcode, zone.end_zipcode);
      await loadShippingRules();
      showSuccessMessage("Delivery zone deleted successfully!");
    } catch (err) {
      console.error("Failed to delete zone:", err);
      showErrorMessage(err.message || "Failed to delete zone.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteState = async (countryName, stateName) => {
    if (!confirm(`Are you sure you want to delete the state "${stateName}" and all its delivery zones? This action cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await deleteShippingState(adminId, countryName, stateName);
      await loadShippingRules();
      showSuccessMessage(`State "${stateName}" and all its zones deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete state:", err);
      showErrorMessage(err.message || "Failed to delete state.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteCountry = async (countryName) => {
    if (!confirm(`Are you sure you want to delete the entire country "${countryName}" and all its states and zones? This action cannot be undone.`)) {
      return;
    }

    setSubmitting(true);
    try {
      const adminId = user?.id || localStorage.getItem("admin_id") || "";
      await deleteShippingCountry(adminId, countryName);
      await loadShippingRules();
      showSuccessMessage(`Country "${countryName}" and all its configuration deleted successfully!`);
    } catch (err) {
      console.error("Failed to delete country:", err);
      showErrorMessage(err.message || "Failed to delete country.");
    } finally {
      setSubmitting(false);
    }
  };

  // Helper stats calculations
  const totalCountries = shippingConfigs.length;
  const totalStates = shippingConfigs.reduce((acc, curr) => acc + (curr.states?.length || 0), 0);
  const totalZones = shippingConfigs.reduce((acc, country) => {
    return acc + (country.states?.reduce((stateAcc, state) => stateAcc + (state.zones?.length || 0), 0) || 0);
  }, 0);

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Shipping Rules" />
        
        <div className="admin-main-content">
          <div className="shipping-header">
            <div className="header-left">
              <h1>Shipping Management</h1>
              <p>Configure shipping zones, rates, and free delivery thresholds</p>
            </div>
            <button className="add-country-btn" onClick={() => setActiveModal("addCountry")}>
              + Configure New Country
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

          {/* Stats Overview */}
          <div className="shipping-stats">
            <div className="stat-card">
              <div className="stat-icon">🌍</div>
              <div className="stat-info">
                <h3>{totalCountries}</h3>
                <p>Countries Configured</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏛️</div>
              <div className="stat-info">
                <h3>{totalStates}</h3>
                <p>States Added</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📮</div>
              <div className="stat-info">
                <h3>{totalZones}</h3>
                <p>Delivery Zipcode Zones</p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="loading-state">
              <div className="spinner"></div>
              <p>Loading shipping rules...</p>
            </div>
          ) : shippingConfigs.length === 0 ? (
            <div className="empty-shipping-state">
              <span>✈️</span>
              <h3>No Shipping Rules Configured</h3>
              <p>Start by configuring shipping charges for your business's target country.</p>
              <button onClick={() => setActiveModal("addCountry")} className="btn-primary">
                Add First Country
              </button>
            </div>
          ) : (
            <div className="shipping-grid">
              {shippingConfigs.map((config) => (
                <div key={config.id || config.country} className="country-config-card">
                  <div className="country-card-header">
                    <div className="country-info">
                      <h2>{config.country}</h2>
                      <span className="state-count">{config.states?.length || 0} states configured</span>
                    </div>
                    <div className="country-actions">
                      <button 
                        className="add-state-btn"
                        onClick={() => openAddStateModal(config.country)}
                      >
                        + Add State
                      </button>
                      <button 
                        className="delete-country-btn"
                        onClick={() => handleDeleteCountry(config.country)}
                        title="Delete entire country and all states"
                        disabled={submitting}
                      >
                        🗑 Delete Country
                      </button>
                    </div>
                  </div>

                  <div className="states-list-section">
                    {config.states && config.states.length > 0 ? (
                      config.states.map((state) => {
                        const isExpanded = !!expandedStates[`${config.country}-${state.state_name}`];
                        return (
                          <div key={state.state_name} className="state-accordion-item">
                            <div 
                              className="state-accordion-header"
                              onClick={() => toggleStateAccordion(config.country, state.state_name)}
                            >
                              <div className="state-details">
                                <span className="accordion-arrow">{isExpanded ? "▼" : "▶"}</span>
                                <h4>{state.state_name}</h4>
                                <span className="zone-count-badge">{state.zones?.length || 0} zones</span>
                              </div>
                              <div className="state-actions">
                                <button 
                                  className="add-zone-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    openAddZoneModal(config.country, state.state_name);
                                  }}
                                >
                                  + Add Zone
                                </button>
                                <button 
                                  className="delete-state-btn"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteState(config.country, state.state_name);
                                  }}
                                  title="Delete state and all zones"
                                  disabled={submitting}
                                >
                                  🗑 Delete State
                                </button>
                              </div>
                            </div>

                            {isExpanded && (
                              <div className="state-accordion-body">
                                {state.zones && state.zones.length > 0 ? (
                                  <div className="zones-table-wrapper">
                                    <table className="zones-table">
                                      <thead>
                                        <tr>
                                          <th>Start Pincode</th>
                                          <th>End Pincode</th>
                                          <th>Rate (₹ per KG)</th>
                                          <th>Min Bill for Free Delivery</th>
                                          <th>Actions</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {state.zones.map((zone, idx) => (
                                          <tr key={idx}>
                                            <td className="pincode-cell">{zone.start_zipcode}</td>
                                            <td className="pincode-cell">{zone.end_zipcode}</td>
                                            <td className="charge-cell">₹{zone.charge_per_kg}</td>
                                            <td className="free-limit-cell">
                                              {zone.free_delivery_min_order_value > 0 ? `₹${zone.free_delivery_min_order_value}` : "N/A (Paid only)"}
                                            </td>
                                            <td className="actions-cell">
                                              <button 
                                                className="btn-action btn-edit"
                                                onClick={() => openEditZoneModal(config.country, state.state_name, zone)}
                                                title="Edit zone"
                                              >
                                                ✎ Edit
                                              </button>
                                              <button 
                                                className="btn-action btn-delete"
                                                onClick={() => handleDeleteZone(config.country, state.state_name, zone)}
                                                title="Delete zone"
                                                disabled={submitting}
                                              >
                                                🗑 Delete
                                              </button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  </div>
                                ) : (
                                  <div className="empty-zones-prompt">
                                    <p>No shipping charge zones added for this state yet.</p>
                                    <button 
                                      onClick={() => openAddZoneModal(config.country, state.state_name)}
                                      className="btn-text"
                                    >
                                      Add delivery range zone
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div className="empty-states-prompt">
                        <p>No states added for {config.country} yet.</p>
                        <button 
                          onClick={() => openAddStateModal(config.country)}
                          className="btn-text"
                        >
                          Add first state
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Add Country Modal */}
      {activeModal === "addCountry" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Configure Country Shipping</h2>
              <button className="close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddCountry}>
              <div className="form-group">
                <label>Country Name *</label>
                <input
                  type="text"
                  required
                  value={newCountryName}
                  onChange={(e) => setNewCountryName(e.target.value)}
                  className="form-input"
                  placeholder="e.g., India, United States"
                  autoFocus
                />
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Configuring..." : "Configure Country"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add State Modal */}
      {activeModal === "addState" && (
        <div className="modal-overlay">
          <div className="modal-content modal-small">
            <div className="modal-header">
              <h2>Add State</h2>
              <button className="close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddState}>
              <div className="modal-body">
                <p><strong>Country:</strong> {selectedCountry}</p>
                <div className="form-group">
                  <label>State Name *</label>
                  <input
                    type="text"
                    required
                    value={newStateName}
                    onChange={(e) => setNewStateName(e.target.value)}
                    className="form-input"
                    placeholder="e.g., Telangana, Karnataka, Andhra Pradesh"
                    autoFocus
                  />
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Adding..." : "Add State"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Zone Modal */}
      {activeModal === "addZone" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add Zipcode delivery zone</h2>
              <button className="close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleAddZone}>
              <div className="modal-body">
                <p><strong>Target:</strong> {selectedCountry} › {selectedState}</p>
                
                <div className="form-row-group">
                  <div className="form-group">
                    <label>Start Zipcode (Pincode) *</label>
                    <input
                      type="number"
                      required
                      value={zoneFormData.startZipcode}
                      onChange={(e) => setZoneFormData({...zoneFormData, startZipcode: e.target.value})}
                      className="form-input"
                      placeholder="e.g. 500001"
                      min="1"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Zipcode (Pincode) *</label>
                    <input
                      type="number"
                      required
                      value={zoneFormData.endZipcode}
                      onChange={(e) => setZoneFormData({...zoneFormData, endZipcode: e.target.value})}
                      className="form-input"
                      placeholder="e.g. 500100"
                      min="1"
                    />
                  </div>
                </div>

                <div className="form-row-group">
                  <div className="form-group">
                    <label>Charge per KG (INR) *</label>
                    <input
                      type="number"
                      required
                      value={zoneFormData.chargePerKg}
                      onChange={(e) => setZoneFormData({...zoneFormData, chargePerKg: e.target.value})}
                      className="form-input"
                      placeholder="e.g. 30"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Bill for Free Delivery (INR)</label>
                    <input
                      type="number"
                      value={zoneFormData.freeDeliveryMinOrderValue}
                      onChange={(e) => setZoneFormData({...zoneFormData, freeDeliveryMinOrderValue: e.target.value})}
                      className="form-input"
                      placeholder="e.g. 500 (Set 0 to disable free delivery - Optional)"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Adding..." : "Add Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Zone Modal */}
      {activeModal === "editZone" && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Zipcode delivery zone</h2>
              <button className="close-modal" onClick={() => setActiveModal(null)}>✕</button>
            </div>
            <form onSubmit={handleEditZone}>
              <div className="modal-body">
                <p><strong>Target:</strong> {selectedCountry} › {selectedState}</p>
                
                <div className="form-row-group">
                  <div className="form-group">
                    <label>Start Zipcode (Pincode)</label>
                    <input
                      type="number"
                      disabled
                      value={zoneFormData.startZipcode}
                      className="form-input"
                      placeholder="e.g. 500001"
                    />
                  </div>
                  <div className="form-group">
                    <label>End Zipcode (Pincode)</label>
                    <input
                      type="number"
                      disabled
                      value={zoneFormData.endZipcode}
                      className="form-input"
                      placeholder="e.g. 500100"
                    />
                  </div>
                </div>

                <div className="form-row-group">
                  <div className="form-group">
                    <label>Charge per KG (INR) - Optional</label>
                    <input
                      type="number"
                      value={zoneFormData.chargePerKg}
                      onChange={(e) => setZoneFormData({...zoneFormData, chargePerKg: e.target.value})}
                      className="form-input"
                      placeholder="Leave empty to keep current value"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div className="form-group">
                    <label>Min Bill for Free Delivery (INR) - Optional</label>
                    <input
                      type="number"
                      value={zoneFormData.freeDeliveryMinOrderValue}
                      onChange={(e) => setZoneFormData({...zoneFormData, freeDeliveryMinOrderValue: e.target.value})}
                      className="form-input"
                      placeholder="Leave empty to keep current value"
                      min="0"
                      step="0.01"
                    />
                  </div>
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setActiveModal(null)}>Cancel</button>
                <button type="submit" className="btn-primary" disabled={submitting}>
                  {submitting ? "Updating..." : "Update Zone"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminShipping;
