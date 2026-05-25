// src/App.jsx
import "./App.css";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";

// Public Components
import TopBar from "./components/TopBar";
import Header from "./components/Header";
import HeroSlider from "./components/HeroSlider";
import StorySection from "./components/StorySection";
import ProductSection from "./components/ProductSection";
import FeaturedProducts from "./components/FeaturedProduct";
import AvailableOn from "./components/AvailableOn";
import Footer from "./components/Footer";
import BannerSection from "./components/BannerSection";
import CategoriesSection from "./components/CategoriesSection";
import CategoryPage from "./components/CategoryPage";
import CartPage from "./components/CartPage";
import AboutPage from "./components/AboutPage";
import ContactPage from "./components/ContactPage";
import ShippingPolicy from "./components/ShippingPolicy";
import PrivacyPolicy from "./components/PrivacyPolicy";
import TermsPage from "./components/TermsPage";
import WelcomePopup from "./components/WelcomePopup";
import LoginPage from "./components/LoginPage";
import CheckoutPage from "./components/CheckoutPage";
import AllProducts from "./components/AllProducts";
import SweetsPage from "./components/SweetsPage";
import ProductDetails from "./components/ProductDetails";
import OrderSuccess from "./components/OrderSuccess";
import MyOrders from "./components/MyOrders";

// Admin Components
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminProducts from "./components/admin/AdminProducts";
import AdminOrders from "./components/admin/AdminOrders";
import AdminCategories from "./components/admin/AdminCategories";
import AdminShipping from "./components/admin/AdminShipping";
import AdminCoupons from "./components/admin/AdminCoupons";


// Protected Route Component for Admin
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  
  if (loading) {
    return (
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        alignItems: "center", 
        height: "100vh",
        fontSize: "18px",
        color: "var(--primary-color)"
      }}>
        Loading...
      </div>
    );
  }
  
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin-login" replace />;
  }
  
  return children;
};

// Public Layout with Header, Navbar, Footer (for most pages)
const PublicLayout = ({ children }) => {
  return (
    <>
      <TopBar />
      <Header />
      {children}
      <AvailableOn />
      <Footer />
    </>
  );
};

// Simple Layout WITHOUT Footer and AvailableOn (for login, checkout, orders, etc.)
const SimpleLayout = ({ children }) => {
  return (
    <>
      <TopBar />
      <Header />
      {children}
      {/* No AvailableOn */}
      {/* No Footer */}
    </>
  );
};

// Home Component
function Home() {
  return (
    <>
      <WelcomePopup />
      <HeroSlider />
      <StorySection />
      <BannerSection />
      <CategoriesSection />
      <ProductSection />
      <FeaturedProducts />
    </>
  );
}

// Main App Component
function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes - With Full Layout (Header, Navbar, Footer, AvailableOn) */}
        <Route path="/" element={
          <PublicLayout>
            <Home />
          </PublicLayout>
        } />
        
        <Route path="/product/:productId" element={
          <PublicLayout>
            <ProductDetails />
          </PublicLayout>
        } />
        
        <Route path="/category/:type" element={
          <PublicLayout>
            <CategoryPage />
          </PublicLayout>
        } />
        
        <Route path="/cart" element={
          <PublicLayout>
            <CartPage />
          </PublicLayout>
        } />
        
        <Route path="/about" element={
          <PublicLayout>
            <AboutPage />
          </PublicLayout>
        } />
        
        <Route path="/contact" element={
          <PublicLayout>
            <ContactPage />
          </PublicLayout>
        } />
        
        <Route path="/shipping-policy" element={
          <PublicLayout>
            <ShippingPolicy />
          </PublicLayout>
        } />
        
        <Route path="/privacy-policy" element={
          <PublicLayout>
            <PrivacyPolicy />
          </PublicLayout>
        } />
        
        <Route path="/terms" element={
          <PublicLayout>
            <TermsPage />
          </PublicLayout>
        } />
        
        <Route path="/all-products" element={
          <PublicLayout>
            <AllProducts />
          </PublicLayout>
        } />
        
        <Route path="/sweets" element={
          <PublicLayout>
            <SweetsPage />
          </PublicLayout>
        } />

        {/* Routes with Simple Layout (NO Footer, NO AvailableOn) */}
        <Route path="/login" element={
          <SimpleLayout>
            <LoginPage />
          </SimpleLayout>
        } />
        
        <Route path="/checkout" element={
          <SimpleLayout>
            <CheckoutPage />
          </SimpleLayout>
        } />
        
        <Route path="/order-success" element={
          <SimpleLayout>
            <OrderSuccess />
          </SimpleLayout>
        } />
        
        <Route path="/my-orders" element={
          <SimpleLayout>
            <MyOrders />
          </SimpleLayout>
        } />

        {/* Admin Routes - WITHOUT Header, Navbar, Footer */}
        <Route path="/admin-login" element={<AdminLogin />} />
        
        <Route 
          path="/admin/dashboard" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/products" 
          element={
            <ProtectedRoute>
              <AdminProducts />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/orders" 
          element={
            <ProtectedRoute>
              <AdminOrders />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/admin/categories" 
          element={
            <ProtectedRoute>
              <AdminCategories />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/shipping" 
          element={
            <ProtectedRoute>
              <AdminShipping />
            </ProtectedRoute>
          } 
        />
        <Route 
          path="/admin/coupons" 
          element={
            <ProtectedRoute>
              <AdminCoupons />
            </ProtectedRoute>
          } 
        />


        {/* 404 Catch-all - Redirect to Home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;