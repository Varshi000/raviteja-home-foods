// src/services/api.js
const BASE_URL = "http://18.61.65.71:5454";

// ==================== HELPER FUNCTIONS ====================

const getAuthHeaders = () => {
  const token = localStorage.getItem("access_token");
  return token ? { "Authorization": `Bearer ${token}` } : {};
};

const handleResponse = async (response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.detail || error.message || `HTTP ${response.status}`);
  }
  return response.json();
};

// ==================== PRODUCTS API ====================

export const fetchActiveProducts = async () => {
  const response = await fetch(`${BASE_URL}/products/get_active_products`);
  const data = await handleResponse(response);
  return Array.isArray(data) ? data : data.data || [];
};

export const fetchProductsByCategory = async (categoryId) => {
  const response = await fetch(`${BASE_URL}/products/active-by-category?category_id=${categoryId}`);
  const data = await handleResponse(response);
  return Array.isArray(data) ? data : data.data || [];
};

export const fetchProductById = async (productId) => {
  const response = await fetch(`${BASE_URL}/products/get_product/${productId}`);
  const data = await handleResponse(response);
  return data;
};

// ==================== CATEGORIES API ====================

export const fetchCategories = async () => {
  const response = await fetch(`${BASE_URL}/categories/all_Categories/retail`);
  const data = await handleResponse(response);
  return Array.isArray(data) ? data : [];
};

// ==================== CART API ====================

export const getCart = async (guestId, userEmail = null) => {
  try {
    let url;
    if (userEmail) {
      url = `${BASE_URL}/cart/?user_email=${userEmail}`;
    } else {
      url = `${BASE_URL}/cart/?guest_id=${guestId}`;
    }
    
    const headers = getAuthHeaders();
    const response = await fetch(url, { headers });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateCartItem = async (payload) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const response = await fetch(`${BASE_URL}/cart/update`, {
      method: "PUT",
      headers,
      body: JSON.stringify(payload),
    });
    const data = await handleResponse(response);
    return data.data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const clearCart = async (guestId, userEmail = null) => {
  try {
    let url;
    if (userEmail) {
      url = `${BASE_URL}/cart/clear?user_email=${userEmail}`;
    } else {
      url = `${BASE_URL}/cart/clear?guest_id=${guestId}`;
    }
    
    const headers = getAuthHeaders();
    const response = await fetch(url, { method: "DELETE", headers });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const mergeCart = async (guestId) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const response = await fetch(`${BASE_URL}/cart/merge`, {
      method: "POST",
      headers,
      body: JSON.stringify({ guest_id: guestId }),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error("Failed to merge cart:", error);
    return null;
  }
};

export const applyCoupon = async (couponCode, guestId = null, userEmail = null) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const body = userEmail 
      ? { coupon_code: couponCode, user_email: userEmail } 
      : { coupon_code: couponCode, guest_id: guestId };
    
    const response = await fetch(`${BASE_URL}/cart/apply-coupon`, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const removeCoupon = async (guestId = null, userEmail = null) => {
  try {
    let url;
    if (userEmail) {
      url = `${BASE_URL}/cart/remove-coupon?user_email=${userEmail}`;
    } else {
      url = `${BASE_URL}/cart/remove-coupon?guest_id=${guestId}`;
    }
    
    const headers = getAuthHeaders();
    const response = await fetch(url, { method: "DELETE", headers });
    return handleResponse(response);
  } catch (error) {
    console.error(error);
    return null;
  }
};

// ==================== ORDERS API ====================

export const getGuestOrders = async (guestId) => {
  try {
    const response = await fetch(`${BASE_URL}/orders/guest/${guestId}`);
    const data = await handleResponse(response);
    return data.data || [];
  } catch (error) {
    console.error("Failed to get guest orders:", error);
    return [];
  }
};

export const getUserOrders = async (userEmail) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/orders/user/${userEmail}`, { headers });
    const data = await handleResponse(response);
    return data.orders || data.data || [];
  } catch (error) {
    console.error("Failed to get user orders:", error);
    return [];
  }
};

export const getAllOrders = async (limit = 100, skip = 0) => {
  try {
    const headers = getAuthHeaders();
    const response = await fetch(`${BASE_URL}/orders/admin/all-orders?limit=${limit}&skip=${skip}`, { headers });
    const data = await handleResponse(response);
    return data;
  } catch (error) {
    console.error("Failed to get all orders:", error);
    return { data: [], count: 0 };
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const headers = {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    };
    const response = await fetch(`${BASE_URL}/orders/admin/update_status/${orderId}`, {
      method: "PUT",
      headers,
      body: JSON.stringify({ order_status: status }),
    });
    return handleResponse(response);
  } catch (error) {
    console.error("Failed to update order status:", error);
    return null;
  }
};

export const estimateDelivery = async (country, state, pincode, guestId) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/orders/delivery-estimate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ country, state, pincode, guest_id: guestId }),
  });
  return handleResponse(response);
};

export const placeOrder = async (orderData) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/orders/place`, {
    method: "POST",
    headers,
    body: JSON.stringify(orderData),
  });
  return handleResponse(response);
};

export const verifyPayment = async (razorpayOrderId, razorpayPaymentId, razorpaySignature, guestId) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/orders/verify-payment`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      razorpay_order_id: razorpayOrderId,
      razorpay_payment_id: razorpayPaymentId,
      razorpay_signature: razorpaySignature,
      guest_id: guestId,
    }),
  });
  return handleResponse(response);
};

// ==================== USER AUTH API ====================

export const requestUserOtp = async (email) => {
  const response = await fetch(`${BASE_URL}/user-login/request-otp?email=${encodeURIComponent(email)}`, {
    method: "POST",
  });
  return handleResponse(response);
};

export const verifyUserOtp = async (email, otp) => {
  const response = await fetch(`${BASE_URL}/user-login/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
    method: "POST",
  });
  return handleResponse(response);
};

export const getUserProfile = async () => {
  const headers = getAuthHeaders();
  const response = await fetch(`${BASE_URL}/user-login/me`, { headers });
  return handleResponse(response);
};

// ==================== ADMIN AUTH API ====================

export const adminLogin = async (email, password) => {
  const formData = new URLSearchParams();
  formData.append("username", email);
  formData.append("password", password);
  
  const response = await fetch(`${BASE_URL}/admin-registration/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });
  return handleResponse(response);
};

// ==================== DASHBOARD API ====================

export const getDashboardStats = async () => {
  const headers = getAuthHeaders();
  const response = await fetch(`${BASE_URL}/dashboard/overview`, { headers });
  return handleResponse(response);
};

// ==================== SHIPPING API ====================

export const estimateShipping = async (country, state, pincode, cartWeightGrams, orderTotal) => {
  const response = await fetch(`${BASE_URL}/shipping/estimate`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      country,
      state,
      zipcode: parseInt(pincode),
      cart_weight_grams: cartWeightGrams,
      order_total: orderTotal,
    }),
  });
  return handleResponse(response);
};

export const fetchCountries = async () => {
  const response = await fetch(`${BASE_URL}/shipping/countries`);
  const data = await handleResponse(response);
  return data.countries || [];
};

export const fetchStates = async (country) => {
  const response = await fetch(`${BASE_URL}/shipping/countries/${encodeURIComponent(country)}/states`);
  const data = await handleResponse(response);
  return data.states || [];
};

// ==================== ADMIN SHIPPING API ====================

export const getShippingRules = async (adminId) => {
  const headers = getAuthHeaders();
  const response = await fetch(`${BASE_URL}/shipping/admin/${adminId}/rules`, { headers });
  return handleResponse(response);
};

export const createShippingRules = async (adminId, country) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/shipping/admin/${adminId}/rules`, {
    method: "POST",
    headers,
    body: JSON.stringify({ country, states: [] }),
  });
  return handleResponse(response);
};

export const addShippingState = async (adminId, country, stateName) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/shipping/admin/${adminId}/add-state`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      country,
      state: {
        state_name: stateName,
        zones: [],
      },
    }),
  });
  return handleResponse(response);
};

export const addShippingZone = async (adminId, country, stateName, zoneData) => {
  const headers = {
    "Content-Type": "application/json",
    ...getAuthHeaders(),
  };
  const response = await fetch(`${BASE_URL}/shipping/admin/${adminId}/add-zone`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      country,
      state_name: stateName,
      zone: {
        start_zipcode: parseInt(zoneData.startZipcode),
        end_zipcode: parseInt(zoneData.endZipcode),
        charge_per_kg: parseFloat(zoneData.chargePerKg),
        free_delivery_min_order_value: parseFloat(zoneData.freeDeliveryMinOrderValue),
      },
    }),
  });
  return handleResponse(response);
};