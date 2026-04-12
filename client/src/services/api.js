// src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if it exists
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Export the api instance as default and named export
export const apiClient = api;
export default api;

// ==================== PRODUCT APIs ====================
export const getProducts = async (category) => {
  try {
    const url = category && category !== 'all' 
      ? `/products?category=${category}` 
      : '/products';
    const response = await api.get(url);
    return response;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const getProductById = async (id) => {
  try {
    const response = await api.get(`/products/${id}`);
    return response;
  } catch (error) {
    console.error('Error fetching product:', error);
    throw error;
  }
};

// ==================== AUTH APIs ====================
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
    }
    return response;
  } catch (error) {
    console.error('Error registering:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await api.post('/auth/login', credentials);
    if (response.data.token) {
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('user', JSON.stringify(response.data.user || response.data));
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

export const getMe = async () => {
  try {
    const response = await api.get('/auth/me');
    return response;
  } catch (error) {
    console.error('Error getting user:', error);
    throw error;
  }
};

// ==================== ORDER APIs ====================
export const createOrder = async (orderData) => {
  try {
    const response = await api.post('/orders', orderData);
    return response;
  } catch (error) {
    console.error('Error creating order:', error);
    throw error;
  }
};

export const getMyOrders = async () => {
  try {
    const response = await api.get('/orders/my-orders');
    return response;
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

export const getOrderById = async (orderId) => {
  try {
    const response = await api.get(`/orders/${orderId}`);
    return response;
  } catch (error) {
    console.error('Error fetching order:', error);
    throw error;
  }
};

// ==================== RAZORPAY APIs ====================
export const createRazorpayOrder = async (amount) => {
  try {
    const response = await api.post('/payments/create-razorpay-order', { amount });
    return response;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw error;
  }
};

export const verifyPayment = async (paymentData) => {
  try {
    const response = await api.post('/payments/verify-payment', paymentData);
    return response;
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
};

// ==================== ADMIN APIs ====================
export const getAllOrders = async () => {
  try {
    const response = await api.get('/orders/all');
    return response;
  } catch (error) {
    console.error('Error fetching all orders:', error);
    throw error;
  }
};

export const updateOrderStatus = async (orderId, status) => {
  try {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response;
  } catch (error) {
    console.error('Error updating order status:', error);
    throw error;
  }
};

export const updateProductStock = async (productId, stockQuantity) => {
  try {
    const response = await api.put(`/products/${productId}/stock`, { stockQuantity });
    return response;
  } catch (error) {
    console.error('Error updating product stock:', error);
    throw error;
  }
};