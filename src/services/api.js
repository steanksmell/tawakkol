import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('tawakkul_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('tawakkul_token');
      if (token) {
        localStorage.removeItem('tawakkul_token');
        localStorage.removeItem('tawakkul_user');
        
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
      }
    }
    
    return Promise.reject(error);
  }
);

// ==================== Auth Service ====================
export const authService = {
  signup: (data) => api.post('/auth/signup', data),
  signin: (data) => api.post('/auth/signin', data),
  forgotPassword: (data) => api.post('/auth/forgot-password', data),
  resetPassword: (token, data) => api.post(`/auth/reset-password/${token}`, data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/me', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  logout: () => api.post('/auth/logout'),
  
  // Admin user management
  getUsers: (params) => api.get('/auth/users', { params }),
  getUserById: (id) => api.get(`/auth/users/${id}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ==================== Contact Service ====================
export const contactService = {
  sendMessage: (data) => api.post('/contact', data),
  getContacts: (params) => api.get('/contact', { params }),
  updateContactStatus: (id, data) => api.patch(`/contact/${id}`, data),
  deleteContact: (id) => api.delete(`/contact/${id}`),
};

// ==================== Product Service ====================
export const productService = {
  getProducts: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return api.get(`/products${queryString ? `?${queryString}` : ''}`);
  },
  getProductStats: () => api.get('/products/stats'),
  exportProducts: (format = 'json') => {
    return api.get(`/products/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });
  },
  createProduct: (formData) => {
    return api.post('/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
  getProduct: (id) => api.get(`/products/${id}`),
  updateProduct: (id, formData) => {
    const isFormData = formData instanceof FormData;
    return api.put(`/products/${id}`, formData, {
      headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' },
      timeout: 30000,
    });
  },
  deleteProduct: (id) => api.delete(`/products/${id}`),
  bulkDeleteProducts: (ids) => {
    return api.delete('/products/bulk', { data: { ids } });
  },
  
  // ✅ NEW: Toggle product active/inactive status
  toggleProductStatus: (id) => api.patch(`/products/${id}/toggle-status`),
  
  // Stock management endpoints
  updateProductStock: (productId, stockData) => {
    return api.patch(`/products/${productId}/stock`, stockData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  
  getLowStockProducts: () => {
    return api.get('/products/low-stock');
  },

  // Stock management endpoints
  processOrderStock: (items) => {
    return api.post('/products/process-order-stock', { items }, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  releaseOrderStock: (items) => {
    return api.post('/products/release-order-stock', { items }, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  getStockTracking: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return api.get(`/products/stock-tracking${queryString ? `?${queryString}` : ''}`);
  },

  getProductStockHistory: (productId, size) => {
    return api.get(`/products/${productId}/stock-history/${size}`);
  },
};

// ==================== Offer Service ====================
export const offerService = {
  getOffers: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return api.get(`/offers${queryString ? `?${queryString}` : ''}`);
  },
  getOffer: (id) => api.get(`/offers/${id}`),
  validatePromoCode: (data) => api.post('/offers/validate-promo', data),
  getOfferStats: () => api.get('/offers/stats'),
  exportOffers: (format = 'json') => {
    return api.get(`/offers/export?format=${format}`, {
      responseType: format === 'csv' ? 'blob' : 'json',
    });
  },
  createOffer: (formData) => {
    return api.post('/offers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });
  },
  updateOffer: (id, formData) => {
    const isFormData = formData instanceof FormData;
    return api.put(`/offers/${id}`, formData, {
      headers: { 'Content-Type': isFormData ? 'multipart/form-data' : 'application/json' },
      timeout: 30000,
    });
  },
  deleteOffer: (id) => api.delete(`/offers/${id}`),
  bulkDeleteOffers: (ids) => {
    return api.delete('/offers/bulk', { data: { ids } });
  },
  toggleOfferStatus: (id) => api.patch(`/offers/${id}/toggle-status`),
  toggleOfferFeatured: (id) => api.patch(`/offers/${id}/toggle-featured`),
  
  // Stock management endpoints for offers
  updateOfferStock: (offerId, stockData) => {
    return api.patch(`/offers/${offerId}/stock`, stockData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },
  
  getLowStockOffers: () => {
    return api.get('/offers/low-stock');
  },
};

// ==================== Order Service ====================
export const orderService = {
  // Create a new order (public)
  createOrder: (orderData) => {
    return api.post('/orders', orderData, {
      headers: { 'Content-Type': 'application/json' },
    });
  },

  // Get all orders (admin)
  getOrders: (params = {}) => {
    const queryParams = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      if (params[key] !== undefined && params[key] !== null && params[key] !== '') {
        queryParams.append(key, params[key]);
      }
    });
    const queryString = queryParams.toString();
    return api.get(`/orders${queryString ? `?${queryString}` : ''}`);
  },

  // Get single order (admin)
  getOrder: (id) => api.get(`/orders/${id}`),

  // Get order stats (admin)
  getOrderStats: () => api.get('/orders/stats'),

  // Update order status (admin)
  updateOrderStatus: (id, status) => {
    return api.patch(`/orders/${id}/status`, { status });
  },

  // Cancel order (public)
  cancelOrder: (id, reason) => {
    return api.patch(`/orders/${id}/cancel`, { reason });
  },

  // Track order by order number (public)
  trackOrder: (orderNumber) => {
    return api.get(`/orders/track/${orderNumber}`);
  },

  // Delete order (admin)
  deleteOrder: (id) => api.delete(`/orders/${id}`),
};

// ==================== Stock Management Helpers ====================

/**
 * Get stock tracking dashboard data
 * @param {Object} filters - { productId, size, lowStock, category, status }
 */
export const getStockTrackingHelper = async (filters = {}) => {
  try {
    const response = await productService.getStockTracking(filters);
    return response.data;
  } catch (error) {
    console.error('Get stock tracking error:', error);
    throw error;
  }
};

/**
 * Get stock history for a specific product size
 * @param {String} productId - Product ID
 * @param {String} size - Size (e.g., 'S', 'M', 'L')
 */
export const getProductStockHistoryHelper = async (productId, size) => {
  try {
    const response = await productService.getProductStockHistory(productId, size);
    return response.data;
  } catch (error) {
    console.error('Get product stock history error:', error);
    throw error;
  }
};

/**
 * Process stock deduction when order is delivered/completed
 * @param {Array} items - Array of { productId, size, quantity }
 */
export const processOrderStockHelper = async (items) => {
  try {
    const response = await productService.processOrderStock(items);
    return response.data;
  } catch (error) {
    console.error('Process order stock error:', error);
    throw error;
  }
};

/**
 * Release reserved stock when order is cancelled
 * @param {Array} items - Array of { productId, size, quantity }
 */
export const releaseOrderStockHelper = async (items) => {
  try {
    const response = await productService.releaseOrderStock(items);
    return response.data;
  } catch (error) {
    console.error('Release order stock error:', error);
    throw error;
  }
};

// ==================== Form Data Helpers ====================

// Updated createOfferFormData with stockBySize support
export const createOfferFormData = (offerData, mainImageFile, additionalImageFiles) => {
  const formData = new FormData();
  
  // Handle each field properly
  Object.keys(offerData).forEach((key) => {
    // Handle sizes array (legacy - keep for backward compatibility)
    if (key === 'sizes' && Array.isArray(offerData[key])) {
      if (offerData[key].length > 0) {
        offerData[key].forEach((size) => { 
          formData.append('sizes', size); 
        });
      }
    } 
    // Handle stockBySize - Convert to JSON string
    else if (key === 'stockBySize') {
      if (offerData[key] && Array.isArray(offerData[key]) && offerData[key].length > 0) {
        // Filter out sizes with empty or zero quantity
        const validStock = offerData[key].filter(item => 
          item.size && item.quantity !== undefined && item.quantity !== null && item.quantity !== ''
        );
        
        if (validStock.length > 0) {
          // Stringify the array for backend parsing
          const stockToSend = validStock.map(item => ({
            size: item.size,
            quantity: Number(item.quantity) || 0,
            location: item.location || '',
            reserved: item.reserved || 0
          }));
          formData.append('stockBySize', JSON.stringify(stockToSend));
        } else {
          // Send a default stock entry to avoid validation error
          formData.append('stockBySize', JSON.stringify([{ size: 'M', quantity: 0, location: '' }]));
        }
      } else {
        // Send a default stock entry to avoid validation error
        formData.append('stockBySize', JSON.stringify([{ size: 'M', quantity: 0, location: '' }]));
      }
    }
    // Handle other fields
    else if (key !== 'mainImage' && key !== 'images' && key !== 'stockBySize') {
      // Convert numbers and booleans to strings
      const value = offerData[key];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Add main image
  if (mainImageFile && mainImageFile instanceof File) {
    formData.append('mainImage', mainImageFile);
  }
  
  // Add additional images
  if (additionalImageFiles && additionalImageFiles.length > 0) {
    additionalImageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file);
      }
    });
  }
  
  return formData;
};

// Updated createProductFormData with proper stockBySize handling
export const createProductFormData = (productData, mainImageFile, additionalImageFiles) => {
  const formData = new FormData();
  
  // Handle each field properly
  Object.keys(productData).forEach((key) => {
    // Handle size array (legacy - keep for backward compatibility)
    if (key === 'size' && Array.isArray(productData[key])) {
      if (productData[key].length > 0) {
        productData[key].forEach((size) => { 
          formData.append('size', size); 
        });
      }
    } 
    // Handle stockBySize - CRITICAL FIX: Convert to JSON string
    else if (key === 'stockBySize') {
      if (productData[key] && Array.isArray(productData[key]) && productData[key].length > 0) {
        // Filter out sizes with empty or zero quantity
        const validStock = productData[key].filter(item => 
          item.size && item.quantity !== undefined && item.quantity !== null && item.quantity !== ''
        );
        
        if (validStock.length > 0) {
          // Stringify the array for backend parsing
          const stockToSend = validStock.map(item => ({
            size: item.size,
            quantity: Number(item.quantity) || 0,
            location: item.location || '',
            reserved: item.reserved || 0
          }));
          formData.append('stockBySize', JSON.stringify(stockToSend));
        } else {
          // Send a default stock entry to avoid validation error
          formData.append('stockBySize', JSON.stringify([{ size: 'M', quantity: 0, location: '' }]));
        }
      } else {
        // Send a default stock entry to avoid validation error
        formData.append('stockBySize', JSON.stringify([{ size: 'M', quantity: 0, location: '' }]));
      }
    }
    // Handle other fields
    else if (key !== 'mainImage' && key !== 'images' && key !== 'stockBySize') {
      // Convert numbers and booleans to strings
      const value = productData[key];
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value.toString());
      }
    }
  });
  
  // Add main image
  if (mainImageFile && mainImageFile instanceof File) {
    formData.append('mainImage', mainImageFile);
  }
  
  // Add additional images
  if (additionalImageFiles && additionalImageFiles.length > 0) {
    additionalImageFiles.forEach((file) => {
      if (file instanceof File) {
        formData.append('images', file);
      }
    });
  }
  
  return formData;
};

// Helper function to update product stock (for use in components)
export const updateProductStockHelper = async (productId, size, quantity, operation = 'set') => {
  try {
    const response = await productService.updateProductStock(productId, {
      size,
      quantity: parseInt(quantity),
      operation
    });
    return response;
  } catch (error) {
    console.error('Product stock update error:', error);
    throw error;
  }
};

// Helper function to update offer stock (for use in components)
export const updateOfferStockHelper = async (offerId, size, quantity, operation = 'set') => {
  try {
    const response = await offerService.updateOfferStock(offerId, {
      size,
      quantity: parseInt(quantity),
      operation
    });
    return response;
  } catch (error) {
    console.error('Offer stock update error:', error);
    throw error;
  }
};

// ==================== User Service (legacy - redirects to auth) ====================
export const userService = {
  getUsers: (params) => api.get('/auth/users', { params }),
  getUser: (id) => api.get(`/auth/users/${id}`),
  updateUser: (id, data) => api.put(`/auth/users/${id}`, data),
  deleteUser: (id) => api.delete(`/auth/users/${id}`),
};

// ==================== Dashboard Service ====================
export const dashboardService = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentOrders: (limit = 5) => api.get(`/dashboard/recent-orders?limit=${limit}`),
};

export default api;