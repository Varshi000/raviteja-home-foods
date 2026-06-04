// src/components/admin/AdminDashboard.jsx
import { useState, useEffect } from "react";
import AdminSidebar from "./AdminSidebar";
import AdminNavbar from "./AdminNavbar";
import { getDashboardStats } from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import {
  ShoppingCart,
  TrendingUp,
  Calendar,
  DollarSign,
  Clock,
  RefreshCw,
  AlertCircle,
  Package,
  List,
  Tag,
  Gift,
  Star,
} from "lucide-react";
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
      icon: "ShoppingCart", 
      color: "#7b1113",
      subtitle: "All time orders"
    },
    { 
      label: "Total Revenue", 
      value: formatCurrency(stats.total.revenue), 
      icon: "TrendingUp", 
      color: "#d2a355",
      subtitle: "Lifetime earnings"
    },
    { 
      label: "Today's Orders", 
      value: stats.daily.sales, 
      icon: "Calendar", 
      color: "#2e7d32",
      subtitle: "Last 24 hours"
    },
    { 
      label: "Today's Revenue", 
      value: formatCurrency(stats.daily.revenue), 
      icon: "DollarSign", 
      color: "#ff9800",
      subtitle: "Today's earnings"
    },
  ];

  const getIcon = (iconName) => {
    const iconMap = {
      ShoppingCart,
      TrendingUp,
      Calendar,
      DollarSign,
      Clock,
      Package,
      List,
      Tag,
      Gift,
      Star,
    };
    return iconMap[iconName] || ShoppingCart;
  };

  const periodCards = [
    { label: "This Week", sales: stats.weekly.sales, revenue: stats.weekly.revenue, icon: "Calendar" },
    { label: "This Month", sales: stats.monthly.sales, revenue: stats.monthly.revenue, icon: "Clock" },
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
            <div className="error-icon-wrapper">
              <AlertCircle size={56} />
            </div>
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
            <RefreshCw size={16} className="update-icon" />
            Last updated: {formatDate(lastUpdated)}
            <button 
              onClick={fetchDashboardStats} 
              className="refresh-btn" 
              title="Refresh"
              aria-label="Refresh dashboard"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          {/* Stats Grid */}
          <div className="stats-grid">
            {statsCards.map((stat, index) => {
              const IconComponent = getIcon(stat.icon);
              return (
                <div key={index} className="stat-card" style={{ borderTopColor: stat.color }}>
                  <div className="stat-icon" style={{ backgroundColor: `${stat.color}15` }}>
                    <IconComponent size={28} color={stat.color} strokeWidth={2} />
                  </div>
                  <div className="stat-info">
                    <h3>{stat.value}</h3>
                    <p>{stat.label}</p>
                    <span className="stat-subtitle">{stat.subtitle}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Period Stats */}
          <div className="period-stats">
            {periodCards.map((period, index) => {
              const IconComponent = getIcon(period.icon);
              return (
                <div key={index} className="period-card">
                  <div className="period-header">
                    <IconComponent size={24} className="period-icon" />
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
              );
            })}
          </div>

          {/* Top Products Section */}
          <div className="top-products-section">
            <div className="section-header">
              <div className="section-title">
                <Star size={20} className="title-icon" />
                <h2>Top Selling Products</h2>
              </div>
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
            <h3 className="quick-actions-title">Quick Actions</h3>
            <div className="actions-grid">
              <button className="action-btn" onClick={() => window.location.href = '/admin/products'}>
                <Package size={18} />
                Manage Products
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/orders'}>
                <List size={18} />
                View All Orders
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/categories'}>
                <Tag size={18} />
                Manage Categories
              </button>
              <button className="action-btn" onClick={() => window.location.href = '/admin/coupons'}>
                <Gift size={18} />
                Manage Coupons
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;
