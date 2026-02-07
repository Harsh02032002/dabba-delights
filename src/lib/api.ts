// ============================================
// Dabba Nation - Centralized API Service
// ============================================
// All API endpoints are listed here.
// Connect your Node.js/Express backend by setting VITE_API_URL in .env
// Example: VITE_API_URL=http://localhost:5000/api
// ============================================

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Generic API request helper with JWT auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    throw new Error(error.message || 'Request failed');
  }

  return response.json();
}

// For multipart form data (image uploads via Multer)
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem('token');

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Upload failed' }));
    throw new Error(error.message || 'Upload failed');
  }

  return response.json();
}

// ============================================
// AUTH APIs
// ============================================
export const authAPI = {
  // POST /auth/login
  login: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // POST /auth/register
  register: (data: { name: string; email: string; password: string; phone: string }) =>
    apiRequest<{ token: string; user: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /auth/seller/login
  sellerLogin: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/seller/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // POST /auth/admin/login
  adminLogin: (email: string, password: string) =>
    apiRequest<{ token: string; user: any }>('/auth/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),

  // GET /auth/me
  getProfile: () => apiRequest<{ user: any }>('/auth/me'),

  // PUT /auth/profile
  updateProfile: (data: any) =>
    apiRequest<{ user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

// ============================================
// SELLER APIs
// ============================================
export const sellerAPI = {
  // GET /seller/profile
  getProfile: () => apiRequest<any>('/seller/profile'),

  // PUT /seller/profile
  updateProfile: (data: any) =>
    apiRequest<any>('/seller/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // POST /seller/profile/logo
  uploadLogo: (formData: FormData) =>
    apiUpload<{ url: string }>('/seller/profile/logo', formData),

  // GET /seller/dashboard
  getDashboard: () => apiRequest<any>('/seller/dashboard'),

  // --- Menu ---
  // GET /seller/menu
  getMenuItems: () => apiRequest<any[]>('/seller/menu'),

  // POST /seller/menu
  addMenuItem: (data: any) =>
    apiRequest<any>('/seller/menu', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /seller/menu/:id
  updateMenuItem: (id: string, data: any) =>
    apiRequest<any>(`/seller/menu/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // DELETE /seller/menu/:id
  deleteMenuItem: (id: string) =>
    apiRequest<any>(`/seller/menu/${id}`, { method: 'DELETE' }),

  // POST /seller/menu/:id/image
  uploadMenuImage: (id: string, formData: FormData) =>
    apiUpload<{ url: string }>(`/seller/menu/${id}/image`, formData),

  // PATCH /seller/menu/:id/availability
  toggleAvailability: (id: string, isAvailable: boolean) =>
    apiRequest<any>(`/seller/menu/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    }),

  // --- Orders ---
  // GET /seller/orders?status=xxx
  getOrders: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiRequest<{ orders: any[]; total: number }>(`/seller/orders?${query}`);
  },

  // PATCH /seller/orders/:id/status
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<any>(`/seller/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // --- Analytics ---
  // GET /seller/analytics?period=weekly|monthly|yearly
  getAnalytics: (period: string = 'weekly') =>
    apiRequest<any>(`/seller/analytics?period=${period}`),

  // GET /seller/analytics/top-items
  getTopItems: () => apiRequest<any[]>('/seller/analytics/top-items'),

  // GET /seller/analytics/peak-hours
  getPeakHours: () => apiRequest<any[]>('/seller/analytics/peak-hours'),

  // GET /seller/analytics/repeat-customers
  getRepeatCustomers: () => apiRequest<any>('/seller/analytics/repeat-customers'),

  // --- Earnings ---
  // GET /seller/earnings?period=weekly|monthly
  getEarnings: (period: string = 'monthly') =>
    apiRequest<any>(`/seller/earnings?period=${period}`),

  // --- Settlements ---
  // GET /seller/settlements?status=pending|settled
  getSettlements: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/seller/settlements${query}`);
  },

  // --- KYC ---
  // GET /seller/kyc
  getKYCStatus: () => apiRequest<any>('/seller/kyc'),

  // POST /seller/kyc/upload
  uploadKYCDocument: (formData: FormData) =>
    apiUpload<any>('/seller/kyc/upload', formData),

  // POST /seller/kyc/submit
  submitKYC: () =>
    apiRequest<any>('/seller/kyc/submit', { method: 'POST' }),
};

// ============================================
// USER / CUSTOMER APIs
// ============================================
export const userAPI = {
  // GET /sellers?type=home_chef|restaurant&city=xxx
  getSellers: (params?: { type?: string; city?: string }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.city) query.set('city', params.city);
    return apiRequest<any[]>(`/sellers?${query}`);
  },

  // GET /sellers/:id
  getSellerById: (id: string) => apiRequest<any>(`/sellers/${id}`),

  // GET /sellers/:id/menu
  getSellerMenu: (sellerId: string) => apiRequest<any[]>(`/sellers/${sellerId}/menu`),

  // GET /menu/search?q=xxx
  searchMenu: (query: string) =>
    apiRequest<any[]>(`/menu/search?q=${encodeURIComponent(query)}`),

  // --- Cart ---
  // GET /cart
  getCart: () => apiRequest<any>('/cart'),

  // POST /cart/add
  addToCart: (menuItemId: string, quantity: number) =>
    apiRequest<any>('/cart/add', {
      method: 'POST',
      body: JSON.stringify({ menuItemId, quantity }),
    }),

  // PUT /cart/update
  updateCartItem: (menuItemId: string, quantity: number) =>
    apiRequest<any>('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ menuItemId, quantity }),
    }),

  // DELETE /cart/remove/:menuItemId
  removeFromCart: (menuItemId: string) =>
    apiRequest<any>(`/cart/remove/${menuItemId}`, { method: 'DELETE' }),

  // DELETE /cart/clear
  clearCart: () => apiRequest<any>('/cart/clear', { method: 'DELETE' }),

  // --- Orders ---
  // POST /orders
  createOrder: (data: any) =>
    apiRequest<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /orders
  getOrders: () => apiRequest<any[]>('/orders'),

  // GET /orders/:id
  getOrderById: (id: string) => apiRequest<any>(`/orders/${id}`),

  // POST /orders/:id/review
  submitReview: (orderId: string, data: { rating: number; comment: string }) =>
    apiRequest<any>(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- Subscriptions ---
  // POST /subscriptions
  createSubscription: (data: any) =>
    apiRequest<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // GET /subscriptions
  getSubscriptions: () => apiRequest<any[]>('/subscriptions'),

  // PATCH /subscriptions/:id/pause
  pauseSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}/pause`, { method: 'PATCH' }),

  // PATCH /subscriptions/:id/resume
  resumeSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}/resume`, { method: 'PATCH' }),

  // DELETE /subscriptions/:id
  cancelSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}`, { method: 'DELETE' }),

  // --- Wallet ---
  // GET /wallet
  getWallet: () => apiRequest<any>('/wallet'),

  // GET /wallet/transactions
  getWalletTransactions: () => apiRequest<any[]>('/wallet/transactions'),

  // --- Payments ---
  // POST /payments/create-order (Razorpay)
  createPaymentOrder: (data: { amount: number; orderId: string }) =>
    apiRequest<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /payments/verify
  verifyPayment: (data: any) =>
    apiRequest<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // POST /payments/stripe-intent
  createStripeIntent: (data: { amount: number; orderId: string }) =>
    apiRequest<any>('/payments/stripe-intent', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
};

// ============================================
// ADMIN APIs
// ============================================
export const adminAPI = {
  // GET /admin/dashboard
  getDashboard: () => apiRequest<any>('/admin/dashboard'),

  // --- Sellers ---
  // GET /admin/sellers?status=xxx&type=xxx
  getSellers: (params?: { status?: string; type?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    return apiRequest<{ sellers: any[]; total: number }>(`/admin/sellers?${query}`);
  },

  // GET /admin/sellers/:id
  getSellerById: (id: string) => apiRequest<any>(`/admin/sellers/${id}`),

  // PATCH /admin/sellers/:id/approve
  approveSeller: (id: string) =>
    apiRequest<any>(`/admin/sellers/${id}/approve`, { method: 'PATCH' }),

  // PATCH /admin/sellers/:id/reject
  rejectSeller: (id: string, reason: string) =>
    apiRequest<any>(`/admin/sellers/${id}/reject`, {
      method: 'PATCH',
      body: JSON.stringify({ reason }),
    }),

  // PATCH /admin/sellers/:id/commission
  updateSellerCommission: (id: string, commission: number) =>
    apiRequest<any>(`/admin/sellers/${id}/commission`, {
      method: 'PATCH',
      body: JSON.stringify({ commission }),
    }),

  // PATCH /admin/sellers/:id/toggle-active
  toggleSellerActive: (id: string) =>
    apiRequest<any>(`/admin/sellers/${id}/toggle-active`, { method: 'PATCH' }),

  // --- Users ---
  // GET /admin/users?page=x&search=xxx
  getUsers: (params?: { page?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    return apiRequest<{ users: any[]; total: number }>(`/admin/users?${query}`);
  },

  // PATCH /admin/users/:id/block
  blockUser: (id: string) =>
    apiRequest<any>(`/admin/users/${id}/block`, { method: 'PATCH' }),

  // PATCH /admin/users/:id/unblock
  unblockUser: (id: string) =>
    apiRequest<any>(`/admin/users/${id}/unblock`, { method: 'PATCH' }),

  // --- Orders ---
  // GET /admin/orders?status=xxx&page=x
  getOrders: (params?: { status?: string; page?: number; sellerId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.sellerId) query.set('sellerId', params.sellerId);
    return apiRequest<{ orders: any[]; total: number }>(`/admin/orders?${query}`);
  },

  // PATCH /admin/orders/:id/status
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<any>(`/admin/orders/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  // POST /admin/orders/:id/refund
  refundOrder: (id: string) =>
    apiRequest<any>(`/admin/orders/${id}/refund`, { method: 'POST' }),

  // --- Settlements ---
  // GET /admin/settlements?status=pending|settled
  getSettlements: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/admin/settlements${query}`);
  },

  // POST /admin/settlements/:id/process
  processSettlement: (id: string) =>
    apiRequest<any>(`/admin/settlements/${id}/process`, { method: 'POST' }),

  // POST /admin/settlements/bulk-process
  bulkProcessSettlements: (ids: string[]) =>
    apiRequest<any>('/admin/settlements/bulk-process', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    }),

  // --- Commission ---
  // GET /admin/commission
  getCommissionConfig: () => apiRequest<any>('/admin/commission'),

  // PUT /admin/commission
  updateCommissionConfig: (data: any) =>
    apiRequest<any>('/admin/commission', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // --- GST ---
  // GET /admin/gst
  getGSTConfig: () => apiRequest<any>('/admin/gst'),

  // PUT /admin/gst
  updateGSTConfig: (data: any) =>
    apiRequest<any>('/admin/gst', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // --- Referrals ---
  // GET /admin/referrals
  getReferrals: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return apiRequest<{ referrals: any[]; total: number }>(`/admin/referrals?${query}`);
  },

  // GET /admin/referrals/config
  getReferralConfig: () => apiRequest<any>('/admin/referrals/config'),

  // PUT /admin/referrals/config
  updateReferralConfig: (data: any) =>
    apiRequest<any>('/admin/referrals/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // --- Marketing ---
  // GET /admin/marketing/campaigns
  getCampaigns: () => apiRequest<any[]>('/admin/marketing/campaigns'),

  // POST /admin/marketing/campaigns
  createCampaign: (data: any) =>
    apiRequest<any>('/admin/marketing/campaigns', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // PUT /admin/marketing/campaigns/:id
  updateCampaign: (id: string, data: any) =>
    apiRequest<any>(`/admin/marketing/campaigns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  // GET /admin/marketing/spend
  getMarketingSpend: () => apiRequest<any>('/admin/marketing/spend'),

  // --- Analytics ---
  // GET /admin/analytics?period=weekly|monthly|yearly
  getAnalytics: (period: string = 'monthly') =>
    apiRequest<any>(`/admin/analytics?period=${period}`),

  // GET /admin/analytics/city-wise
  getCityWiseRevenue: () => apiRequest<any[]>('/admin/analytics/city-wise'),

  // GET /admin/analytics/category-wise
  getCategoryWiseSales: () => apiRequest<any[]>('/admin/analytics/category-wise'),

  // GET /admin/analytics/cart-dropoffs
  getCartDropoffs: () => apiRequest<any>('/admin/analytics/cart-dropoffs'),

  // --- Performance ---
  // GET /admin/performance/sellers
  getSellerPerformance: () => apiRequest<any[]>('/admin/performance/sellers'),

  // GET /admin/performance/overview
  getPerformanceOverview: () => apiRequest<any>('/admin/performance/overview'),

  // --- Platform Config ---
  // GET /admin/config
  getPlatformConfig: () => apiRequest<any>('/admin/config'),

  // PUT /admin/config
  updatePlatformConfig: (data: any) =>
    apiRequest<any>('/admin/config', {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
};

export { apiRequest, apiUpload, API_BASE_URL };
