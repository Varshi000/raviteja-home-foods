// src/context/AuthContext.jsx
import { createContext, useState, useContext, useEffect } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);  // ← This is a boolean
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem("access_token");
      const storedUser = localStorage.getItem("user_data");
      const storedIsAdmin = localStorage.getItem("is_admin") === "true";

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        setIsAdmin(storedIsAdmin);  // ← Set boolean value
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Admin Login
  const adminLogin = (accessToken, adminData) => {
    const userData = {
      id: adminData.id,
      email: adminData.email,
      name: adminData.fullname,
      mobile: adminData.mobile,
      role: "admin",
    };
    
    setToken(accessToken);
    setUser(userData);
    setIsAdmin(true);  // ← Set boolean value
    
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("is_admin", "true");
  };

  // User Login
  const userLogin = (accessToken, email) => {
    const userData = {
      email: email,
      name: email.split('@')[0],
      role: "user",
    };
    
    setToken(accessToken);
    setUser(userData);
    setIsAdmin(false);  // ← Set boolean value
    
    localStorage.setItem("access_token", accessToken);
    localStorage.setItem("user_data", JSON.stringify(userData));
    localStorage.setItem("is_admin", "false");
  };

  // Logout
  const logout = () => {
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    
    localStorage.removeItem("access_token");
    localStorage.removeItem("user_data");
    localStorage.removeItem("is_admin");
    localStorage.removeItem("guest_id");
  };

  const value = {
    user,
    isAdmin,  // ← This is a boolean (true/false)
    loading,
    token,
    adminLogin,
    userLogin,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
