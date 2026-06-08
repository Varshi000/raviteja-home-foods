// src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

const BASE_URL = "/api";

// Generate unique guest ID for non-logged-in users
function generateGuestId() {
  let guestId = localStorage.getItem("guest_id");
  if (!guestId) {
    guestId = 'guest_' + Math.random().toString(36).substring(2, 15);
    localStorage.setItem("guest_id", guestId);
  }
  return guestId;
}

function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState([]);
  const [cartLoading, setCartLoading] = useState(false);
  const [subtotal, setSubtotal] = useState(0);
  const [totalPreview, setTotalPreview] = useState(0);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const { isAuthenticated, user, token } = useAuth();
  const guestId = generateGuestId();

  // Get auth headers
  const getAuthHeaders = () => {
    const authToken = token || localStorage.getItem("access_token");
    return authToken ? { "Authorization": `Bearer ${authToken}` } : {};
  };

  // Load cart from backend - GET /cart/
  const loadCart = async () => {
    setCartLoading(true);
    try {
      let url;
      if (isAuthenticated && user?.email) {
        url = `${BASE_URL}/cart/?user_email=${user.email}`;
      } else {
        url = `${BASE_URL}/cart/?guest_id=${guestId}`;
      }
      
      const headers = getAuthHeaders();
      const response = await fetch(url, { headers });
      
      if (response.ok) {
        const data = await response.json();
        const cartData = data.data;
        
        if (cartData && cartData.items) {
          setCartItems(cartData.items);
          setSubtotal(cartData.subtotal || 0);
          setTotalPreview(cartData.total_preview || 0);
          setDiscountAmount(cartData.discount_amount || 0);
          setAppliedCoupon(cartData.coupon_code || null);
        } else {
          setCartItems([]);
          setSubtotal(0);
          setTotalPreview(0);
        }
      } else {
        setCartItems([]);
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      setCartItems([]);
    } finally {
      setCartLoading(false);
    }
  };

  // Add item to cart using POST /cart/add-bulk (since PUT /cart/update is not working)
  const addToCart = async (product, quantity = 1) => {
    setCartLoading(true);
    
    try {
      const productId = product.id || product._id;
      const weight = product.selectedWeight || product.weight || "500g";
      const price = product.price || 0;
      
      const items = [{
        product_id: productId,
        product_name: product.product_name,
        image_url: product.image_url || product.images_url?.[0] || "/placeholder.png",
        weight: weight,
        price: price,
        quantity: quantity,
        business_type: product.business_type || "retail"
      }];
      
      const payload = {
        items: items,
        guest_id: isAuthenticated ? undefined : guestId,
      };
      
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      
      // Use add-bulk endpoint instead of update
      const response = await fetch(`${BASE_URL}/cart/add-bulk`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || `Failed to add to cart (${response.status})`);
      }
      
      // Reload cart after update
      await loadCart();
      
      return { success: true, message: "Added to cart!" };
    } catch (err) {
      console.error("Failed to add to cart:", err);
      return { success: false, message: err.message };
    } finally {
      setCartLoading(false);
    }
  };

  // Update quantity - using PUT /cart/update
  const updateQuantity = async (productId, weight, newQuantity) => {
    if (newQuantity < 0) return;
    
    setCartLoading(true);
    try {
      const payload = {
        product_id: productId,
        weight: weight,
        quantity: newQuantity,
        guest_id: isAuthenticated ? undefined : guestId,
      };
      
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      
      const response = await fetch(`${BASE_URL}/cart/update`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || `Failed to update quantity (${response.status})`);
      }
      
      await loadCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Remove item
  const removeFromCart = async (productId, weight) => {
    await updateQuantity(productId, weight, 0);
  };

  // Clear entire cart
  const clearCart = async () => {
    setCartLoading(true);
    try {
      let url;
      if (isAuthenticated && user?.email) {
        url = `${BASE_URL}/cart/clear?user_email=${user.email}`;
      } else {
        url = `${BASE_URL}/cart/clear?guest_id=${guestId}`;
      }
      
      const headers = getAuthHeaders();
      await fetch(url, { method: "DELETE", headers });
      
      setCartItems([]);
      setSubtotal(0);
      setTotalPreview(0);
      setDiscountAmount(0);
      setAppliedCoupon(null);
    } catch (err) {
      console.error("Failed to clear cart:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Apply coupon
  const applyCoupon = async (couponCode) => {
    setCartLoading(true);
    try {
      // Backend uses Bearer token (Authorization header) for logged-in users
      // and guest_id in body for guest users. Do NOT send user_email in body.
      const payload = isAuthenticated
        ? { coupon_code: couponCode }
        : { coupon_code: couponCode, guest_id: guestId };
      
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      
      const response = await fetch(`${BASE_URL}/cart/apply-coupon`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || "Invalid or expired coupon code");
      }
      
      await loadCart();
      return { success: true, message: "Coupon applied successfully!" };
    } catch (err) {
      console.error("Failed to apply coupon:", err);
      return { success: false, message: err.message };
    } finally {
      setCartLoading(false);
    }
  };

  // Remove coupon
  const removeCoupon = async () => {
    setCartLoading(true);
    try {
      // Backend uses Bearer token for logged-in users, guest_id query param for guests
      const url = isAuthenticated
        ? `${BASE_URL}/cart/remove-coupon`
        : `${BASE_URL}/cart/remove-coupon?guest_id=${guestId}`;
      
      const headers = getAuthHeaders();
      const response = await fetch(url, { method: "DELETE", headers });
      
      if (response.ok) {
        await loadCart();
        return { success: true };
      }
      throw new Error("Failed to remove coupon");
    } catch (err) {
      console.error("Failed to remove coupon:", err);
      return { success: false, message: err.message };
    } finally {
      setCartLoading(false);
    }
  };

  // Merge guest cart after login
  const mergeGuestCart = async () => {
    if (isAuthenticated && user?.email) {
      const storedGuestId = localStorage.getItem("guest_id");
      if (storedGuestId) {
        try {
          const headers = {
            "Content-Type": "application/json",
            ...getAuthHeaders(),
          };
          
          const response = await fetch(`${BASE_URL}/cart/merge`, {
            method: "POST",
            headers,
            body: JSON.stringify({ guest_id: storedGuestId }),
          });
          
          if (response.ok) {
            localStorage.removeItem("guest_id");
            await loadCart();
          }
        } catch (err) {
          console.error("Failed to merge cart:", err);
        }
      }
    }
  };

  // Load cart on mount and when auth changes
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      mergeGuestCart();
    } else {
      loadCart();
    }
  }, [isAuthenticated, user]);

  // Get cart count
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + (item.quantity || 0), 0);
  };

  // Get cart total
  const getCartTotal = () => totalPreview;

  // Get item quantity
  const getItemQuantity = (productId, weight) => {
    const item = cartItems.find(
      item => item.product_id === productId && item.weight === weight
    );
    return item ? item.quantity : 0;
  };

  const value = {
    cartItems,
    cartLoading,
    subtotal,
    totalPreview,
    discountAmount,
    appliedCoupon,
    guestId,
    addToCart,
    updateQuantity,
    removeFromCart,
    clearCart,
    applyCoupon,
    removeCoupon,
    getCartCount,
    getCartTotal,
    getItemQuantity,
    refreshCart: loadCart,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
}

export default CartProvider;
