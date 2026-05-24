// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { getDashboardStats } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import "./AdminDashboard.css";

function AdminDashboard() {
  const [stats, setStats] = useState({
    total: { sales: 0, revenue: 0 },
    daily: { sales: 0, revenue: 0 },
    weekly: { sales: 0, revenue: 0 },
    monthly: { sales: 0, revenue: 0 },
    topProducts: [],
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);
  const { token } = useAuth();

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await getDashboardStats();
      
      if (response) {
        setStats({
          total: response.total || { sales: 0, revenue: 0 },
          daily: response.daily || { sales: 0, revenue: 0 },
          weekly: response.weekly || { sales: 0, revenue: 0 },
          monthly: response.monthly || { sales: 0, revenue: 0 },
          topProducts: response.top_products || [],
        });
        setLastUpdated(response.as_of || new Date().toISOString());
      }
    } catch (err) {
      console.error("Failed to fetch dashboard stats:", err);
      setError(err.message || "Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const statsCards = [
    { 
      label: "Total Sales", 
      value: stats.total.sales, 
      icon: "📦", 
      color: "var(--primary-color)",
      subtitle: "All time orders"
    },
    { 
      label: "Total Revenue", 
      value: formatCurrency(stats.total.revenue), 
      icon: "💰", 
      color: "var(--secondary-color)",
      subtitle: "Lifetime earnings"
    },
    { 
      label: "Today's Orders", 
      value: stats.daily.sales, 
      icon: "📅", 
      color: "#2e7d32",
      subtitle: "Last 24 hours"
    },
    { 
      label: "Today's Revenue", 
      value: formatCurrency(stats.daily.revenue), 
      icon: "💵", 
      color: "#ff9800",
      subtitle: "Today's earnings"
    },
  ];

  const periodCards = [
    { label: "This Week", sales: stats.weekly.sales, revenue: stats.weekly.revenue, icon: "📆" },
    { label: "This Month", sales: stats.monthly.sales, revenue: stats.monthly.revenue, icon: "📅" },
  ];

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-container">
          <AdminNavbar title="Dashboard" />
          <div className="admin-loading">
            <div className="loading-spinner"></div>
            <p>Loading dashboard data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="admin-layout">
        <AdminSidebar />
        <div className="admin-main-container">
          <AdminNavbar title="Dashboard" />
          <div className="admin-error-state">
            <span className="error-icon">⚠️</span>
            <h3>Unable to load dashboard</h3>
            <p>{error}</p>
            <button onClick={fetchDashboardStats} className="retry-btn">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminSidebar />
      <div className="admin-main-container">
        <AdminNavbar title="Dashboard" />
        
        <div className="admin-main-content">
          {/* Last Updated Timestamp */}
          <div className="last-updated">
            <span className="update-icon">🔄</span>
            Last updated: {formatDate(lastUpdated)}
            <button onClick={fetchDashboardStats} className="refresh-btn" title="Refresh">
              ↻
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statsCards.map((stat, index) => (
              <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                <div className="stat-icon">{stat.icon}</div>
                <div className="stat-info">
                  <h3>{stat.value}</h3>
                  <p>{stat.label}</p>
                  <span className="stat-subtitle">{stat.subtitle}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Period Stats */}
          <div className="period-stats">
            {periodCards.map((period, index) => (
              <div key={index} className="period-card">
                <div className="period-header">
                  <span className="period-icon">{period.icon}</span>
                  <h3>{period.label}</h3>
                </div>
                <div className="period-details">
                  <div className="period-item">
                    <span className="period-label">Orders:</span>
                    <span className="period-value">{period.sales}</span>
                  </div>
                  <div className="period-item">
                    <span className="period-label">Revenue:</span>
                    <span className="period-value">{formatCurrency(period.revenue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Top Products Section */}
          <div className="top-products-section">
            <div className="section-header">
              <h2>🏆 Top Selling Products</h2>
              <span className="section-badge">Last 30 days</span>
            </div>
            
            {stats.topProducts.length > 0 ? (
              <div className="products-table-container">
                <table className="products-table">
                  <thead>
                    <tr>
                      <th>#</th>
                      <th>Product Name</th>
                      <th>Units Sold</th>
                      <th>Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topProducts.map((product, index) => (
                      <tr key={product.product_id || index}>
                        <td className="rank">{index + 1}</td>
                        <td className="product-name">{product.product_name}</td>
                        <td className="units-sold">{product.units_sold}</td>
                        <td className="product-revenue">{formatCurrency(product.revenue)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="empty-products">
                <p>No sales data available yet</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="quick-actions">
            <h3>Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => window.location.href = '/admin/products'}>
                📦 Manage Products
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/orders'}>
                📋 View All Orders
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/categories'}>
                🏷️ Manage Categories
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/coupons'}>
                🎟️ Manage Coupons
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;