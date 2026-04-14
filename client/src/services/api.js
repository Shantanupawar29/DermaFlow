// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Track loading state globally
let loadingCallbacks = {
  onStart: null,
  onEnd: null,
  activeRequests: 0
};

export const setLoadingCallbacks = (onStart, onEnd) => {
  loadingCallbacks.onStart = onStart;
  loadingCallbacks.onEnd = onEnd;
};

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - shows loader
api.interceptors.request.use(
  (config) => {
    // Don't show loader for specific endpoints if skipLoader is true
    const skipLoader = config.skipLoader || 
                      config.url?.includes('/reviews') && config.method === 'post' ||
                      config.url?.includes('/track') && config.method === 'get';
    
    if (!skipLoader && loadingCallbacks.onStart) {
      loadingCallbacks.activeRequests++;
      if (loadingCallbacks.activeRequests === 1) {
        loadingCallbacks.onStart();
      }
    }
    
    // Add token to requests
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    if (loadingCallbacks.onEnd && loadingCallbacks.activeRequests > 0) {
      loadingCallbacks.activeRequests--;
      if (loadingCallbacks.activeRequests === 0) {
        loadingCallbacks.onEnd();
      }
    }
    return Promise.reject(error);
  }
);

// Response interceptor - hides loader
api.interceptors.response.use(
  (response) => {
    if (!response.config.skipLoader && loadingCallbacks.onEnd && loadingCallbacks.activeRequests > 0) {
      loadingCallbacks.activeRequests--;
      if (loadingCallbacks.activeRequests === 0) {
        loadingCallbacks.onEnd();
      }
    }
    return response;
  },
  (error) => {
    if (!error.config?.skipLoader && loadingCallbacks.onEnd && loadingCallbacks.activeRequests > 0) {
      loadingCallbacks.activeRequests--;
      if (loadingCallbacks.activeRequests === 0) {
        loadingCallbacks.onEnd();
      }
    }
    
    // Handle session expiry
// Handle session expiry - Let AuthContext handle it
if (error.response?.status === 401) {
  console.log("Unauthorized - letting AuthContext handle logout");
  // DON'T redirect here! Just let the error bubble up to AuthContext
}
    return Promise.reject(error);
  }
);

// Export the api instance as default and named export
export const apiClient = api;
export default api;

// ==================== PRODUCT APIs ====================
export const getProducts = async (category, options = {}) => {
  try {
    const url = category && category !== 'all' 
      ? `/products?category=${category}` 
      : '/products';
    const response = await api.get(url, options);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id, options = {}) => {
  try {
    const response = await api.get(`/products/${id}`, options);
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

export const searchProducts = async (query, options = {}) => {
  try {
    const response = await api.get(`/products/search?q=${query}`, options);
    return response;
  } catch (error) {
    console.error('Error searching products:', error);
    throw error;
  }
};

// ==================== AUTH APIs ====================
export const register = async (userData, options = {}) => {
  try {
    const response = await api.post('/auth/register', userData, options);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const login = async (credentials, options = {}) => {
  try {
    const response = await api.post('/auth/login', credentials, options);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
    }
    return response;
  } catch (error) {
    console.error('Error logging in:', error);
    throw error;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = '/login';
};

export const getMe = async (options = {}) => {
  try {
    const response = await api.get('/auth/me', options);
    return response;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

export const updateProfile = async (profileData, options = {}) => {
  try {
    const response = await api.put('/auth/profile', profileData, options);
    if (response.data.user) {
    }
    return response;
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
};

// ==================== ORDER APIs ====================
export const createOrder = async (orderData, options = {}) => {
  try {
    const response = await api.post('/orders', orderData, options);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getMyOrders = async (options = {}) => {
  try {
    const response = await api.get('/orders/my-orders', options);
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId, options = {}) => {
  try {
    const response = await api.get(`/orders/${orderId}`, options);
    return response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

export const cancelOrder = async (orderId, options = {}) => {
  try {
    const response = await api.put(`/orders/${orderId}/cancel`, {}, options);
    return response;
  } catch (error) {
    console.error('Error cancelling order:', error);
    throw error;
  }
};

// ==================== RAZORPAY APIs ====================
export const createRazorpayOrder = async (amount, options = {}) => {
  try {
    const response = await api.post('/payments/create-razorpay-order', { amount }, options);
    return response;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData, options = {}) => {
  try {
    const response = await api.post('/payments/verify-payment', paymentData, options);
    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const getAllOrders = async (options = {}) => {
  try {
    const response = await api.get('/orders', options);
    return response;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status, trackingNumber = null, options = {}) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status, trackingNumber }, options);
    return response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateProductStock = async (productId, stockQuantity, options = {}) => {
  try {
    const response = await api.put(`/products/${productId}/stock`, { stockQuantity }, options);
    return response;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};

export const createProduct = async (productData, options = {}) => {
  try {
    const response = await api.post('/products', productData, options);
    return response;
  } catch (error) {
    console.error('Error creating product:', error);
    throw error;
  }
};

export const updateProduct = async (productId, productData, options = {}) => {
  try {
    const response = await api.put(`/products/${productId}`, productData, options);
    return response;
  } catch (error) {
    console.error('Error updating product:', error);
    throw error;
  }
};

export const deleteProduct = async (productId, options = {}) => {
  try {
    const response = await api.delete(`/products/${productId}`, options);
    return response;
  } catch (error) {
    console.error('Error deleting product:', error);
    throw error;
  }
};

// ==================== PROFILE APIs ====================
export const getAddresses = async (options = {}) => {
  try {
    const response = await api.get('/profile/addresses', options);
    return response;
  } catch (error) {
    console.error('Error fetching addresses:', error);
    throw error;
  }
};

export const addAddress = async (addressData, options = {}) => {
  try {
    const response = await api.post('/profile/addresses', addressData, options);
    return response;
  } catch (error) {
    console.error('Error adding address:', error);
    throw error;
  }
};

export const updateAddress = async (addressId, addressData, options = {}) => {
  try {
    const response = await api.put(`/profile/addresses/${addressId}`, addressData, options);
    return response;
  } catch (error) {
    console.error('Error updating address:', error);
    throw error;
  }
};

export const deleteAddress = async (addressId, options = {}) => {
  try {
    const response = await api.delete(`/profile/addresses/${addressId}`, options);
    return response;
  } catch (error) {
    console.error('Error deleting address:', error);
    throw error;
  }
};

export const getWishlist = async (options = {}) => {
  try {
    const response = await api.get('/profile/wishlist', options);
    return response;
  } catch (error) {
    console.error('Error fetching wishlist:', error);
    throw error;
  }
};

export const addToWishlist = async (productId, options = {}) => {
  try {
    const response = await api.post('/profile/wishlist', { productId }, options);
    return response;
  } catch (error) {
    console.error('Error adding to wishlist:', error);
    throw error;
  }
};

export const removeFromWishlist = async (productId, options = {}) => {
  try {
    const response = await api.delete(`/profile/wishlist/${productId}`, options);
    return response;
  } catch (error) {
    console.error('Error removing from wishlist:', error);
    throw error;
  }
};

export const getProfileStats = async (options = {}) => {
  try {
    const response = await api.get('/profile/stats', options);
    return response;
  } catch (error) {
    console.error('Error fetching profile stats:', error);
    throw error;
  }
};

// ==================== QUIZ APIs ====================
export const submitQuiz = async (quizData, options = {}) => {
  try {
    const response = await api.post('/quiz/submit', quizData, options);
    return response;
  } catch (error) {
    console.error('Error submitting quiz:', error);
    throw error;
  }
};

export const getRoutine = async (options = {}) => {
  try {
    const response = await api.get('/quiz/routine', options);
    return response;
  } catch (error) {
    console.error('Error fetching routine:', error);
    throw error;
  }
};

// ==================== REVIEWS APIs ====================
export const getProductReviews = async (productId, options = {}) => {
  try {
    const response = await api.get(`/reviews/product/${productId}`, options);
    return response;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    throw error;
  }
};

export const createReview = async (reviewData, options = {}) => {
  try {
    const response = await api.post('/reviews', reviewData, options);
    return response;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

// ==================== SUBSCRIPTION APIs ====================
export const getMySubscriptions = async (options = {}) => {
  try {
    const response = await api.get('/subscriptions/mine', options);
    return response;
  } catch (error) {
    console.error('Error fetching subscriptions:', error);
    throw error;
  }
};

export const createSubscription = async (subscriptionData, options = {}) => {
  try {
    const response = await api.post('/subscriptions', subscriptionData, options);
    return response;
  } catch (error) {
    console.error('Error creating subscription:', error);
    throw error;
  }
};

export const pauseSubscription = async (subscriptionId, options = {}) => {
  try {
    const response = await api.put(`/subscriptions/${subscriptionId}/pause`, {}, options);
    return response;
  } catch (error) {
    console.error('Error pausing subscription:', error);
    throw error;
  }
};

export const resumeSubscription = async (subscriptionId, options = {}) => {
  try {
    const response = await api.put(`/subscriptions/${subscriptionId}/resume`, {}, options);
    return response;
  } catch (error) {
    console.error('Error resuming subscription:', error);
    throw error;
  }
};

export const cancelSubscription = async (subscriptionId, reason = '', options = {}) => {
  try {
    const response = await api.put(`/subscriptions/${subscriptionId}/cancel`, { reason }, options);
    return response;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    throw error;
  }
};

// ==================== COUPON APIs ====================
export const validateCoupon = async (code, cartTotal, options = {}) => {
  try {
    const response = await api.post('/coupons/validate', { code, cartTotal }, options);
    return response;
  } catch (error) {
    console.error('Error validating coupon:', error);
    throw error;
  }
};

// ==================== GLOW POINTS APIs ====================
export const redeemPoints = async (points, options = {}) => {
  try {
    const response = await api.post('/auth/redeem-points', { points }, options);
    return response;
  } catch (error) {
    console.error('Error redeeming points:', error);
    throw error;
  }
};

// ==================== PINCODE APIs ====================
export const getPincodeDetails = async (pincode, options = {}) => {
  try {
    const response = await api.get(`/pincode/${pincode}`, options);
    return response;
  } catch (error) {
    console.error('Error fetching pincode details:', error);
    throw error;
  }
};