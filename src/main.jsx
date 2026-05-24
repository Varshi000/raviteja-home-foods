// src/main.jsx
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import CartProvider from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";

createRoot(document.getElementById('root')).render(
   <StrictMode>
    <AuthProvider>
      <CartProvider>      {/* CartProvider must be INSIDE AuthProvider */}
        <App />
      </CartProvider>
    </AuthProvider>
  </StrictMode>,
);