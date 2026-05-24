// src/context/CartContext.jsx
import { createContext, useState, useEffect, useContext, useCallback, useRef } from "react";
import { useAuth } from "./AuthContext";

export const CartContext = createContext();

const BASE_URL = "http://18.61.65.71:5454";

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
      
      // Create a single item array
      const items = [{
        product_id: productId,
        product_name: product.product_name,
        image_url: product.image_url || product.images_url?.[0] || "/placeholder.png",
        weight: weight,
        price: price,
        quantity: quantity,
        business_type: "retail"
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
        const error = await response.json();
        throw new Error(error.detail || "Failed to add to cart");
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

  // Update quantity - using add-bulk with updated quantity
  const updateQuantity = async (productId, weight, newQuantity) => {
    if (newQuantity < 0) return;
    
    setCartLoading(true);
    try {
      // Find the existing item to get its details
      const existingItem = cartItems.find(
        item => item.product_id === productId && item.weight === weight
      );
      
      if (!existingItem) return;
      
      if (newQuantity === 0) {
        // Remove item - we'll just reload the cart
        await loadCart();
        return;
      }
      
      // Create updated item
      const items = [{
        product_id: productId,
        product_name: existingItem.product_name,
        image_url: existingItem.image_url,
        weight: weight,
        price: existingItem.price,
        quantity: newQuantity,
        business_type: "retail"
      }];
      
      const payload = {
        items: items,
        guest_id: isAuthenticated ? undefined : guestId,
      };
      
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      
      await fetch(`${BASE_URL}/cart/add-bulk`, {
        method: "POST",
        headers,
        body: JSON.stringify(payload),
      });
      
      await loadCart();
    } catch (err) {
      console.error("Failed to update quantity:", err);
    } finally {
      setCartLoading(false);
    }
  };

  // Remove item
  const removeFromCart = async (productId, weight) => {
    // Since we can't delete directly, we'll clear and re-add all except this one
    setCartLoading(true);
    try {
      const itemsToKeep = cartItems.filter(
        item => !(item.product_id === productId && item.weight === weight)
      );
      
      const payload = {
        items: itemsToKeep.map(item => ({
          product_id: item.product_id,
          product_name: item.product_name,
          image_url: item.image_url,
          weight: item.weight,
          price: item.price,
          quantity: item.quantity,
          business_type: "retail"
        })),
        guest_id: isAuthenticated ? undefined : guestId,
      };
      
      const headers = {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      };
      
      // First clear the cart
      let clearUrl;
      if (isAuthenticated && user?.email) {
        clearUrl = `${BASE_URL}/cart/clear?user_email=${user.email}`;
      } else {
        clearUrl = `${BASE_URL}/cart/clear?guest_id=${guestId}`;
      }
      
      await fetch(clearUrl, { method: "DELETE", headers });
      
      // Then add back the items we want to keep
      if (itemsToKeep.length > 0) {
        await fetch(`${BASE_URL}/cart/add-bulk`, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
      }
      
      await loadCart();
    } catch (err) {
      console.error("Failed to remove from cart:", err);
      await loadCart();
    } finally {
      setCartLoading(false);
    }
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
      const payload = {
        coupon_code: couponCode,
        guest_id: isAuthenticated ? undefined : guestId,
      };
      
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
        const error = await response.json();
        throw new Error(error.detail || "Invalid coupon");
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
      let url;
      if (isAuthenticated && user?.email) {
        url = `${BASE_URL}/cart/remove-coupon?user_email=${user.email}`;
      } else {
        url = `${BASE_URL}/cart/remove-coupon?guest_id=${guestId}`;
      }
      
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