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
  const [token, setToken] = useState(() => localStorage.getItem("access_token"));
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem("user_data");
    try {
      return storedUser ? JSON.parse(storedUser) : null;
    } catch {
      return null;
    }
  });
  const [isAdmin, setIsAdmin] = useState(() => localStorage.getItem("is_admin") === "true");
  const [loading, setLoading] = useState(false);

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
