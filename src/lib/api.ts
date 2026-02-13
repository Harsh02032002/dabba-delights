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
  getProfile: () => apiRequest<any>('/seller/profile'),
  updateProfile: (data: any) =>
    apiRequest<any>('/seller/profile', { method: 'PUT', body: JSON.stringify(data) }),
  uploadLogo: (formData: FormData) =>
    apiUpload<{ url: string }>('/seller/profile/logo', formData),
  getDashboard: () => apiRequest<any>('/seller/dashboard'),

  // Menu
  getMenuItems: () => apiRequest<any[]>('/seller/menu'),
  addMenuItem: (data: any) =>
    apiRequest<any>('/seller/menu', { method: 'POST', body: JSON.stringify(data) }),
  updateMenuItem: (id: string, data: any) =>
    apiRequest<any>(`/seller/menu/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) =>
    apiRequest<any>(`/seller/menu/${id}`, { method: 'DELETE' }),
  uploadMenuImage: (id: string, formData: FormData) =>
    apiUpload<{ url: string }>(`/seller/menu/${id}/image`, formData),
  toggleAvailability: (id: string, isAvailable: boolean) =>
    apiRequest<any>(`/seller/menu/${id}/availability`, {
      method: 'PATCH', body: JSON.stringify({ isAvailable }),
    }),

  // Orders
  getOrders: (params?: { status?: string; page?: number; limit?: number }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    return apiRequest<{ orders: any[]; total: number }>(`/seller/orders?${query}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<any>(`/seller/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),

  // Analytics
  getAnalytics: (period: string = 'weekly') =>
    apiRequest<any>(`/seller/analytics?period=${period}`),
  getTopItems: () => apiRequest<any[]>('/seller/analytics/top-items'),
  getPeakHours: () => apiRequest<any[]>('/seller/analytics/peak-hours'),
  getRepeatCustomers: () => apiRequest<any>('/seller/analytics/repeat-customers'),
  getAISuggestions: () => apiRequest<any>('/seller/analytics/ai-suggestions'),

  // Earnings
  getEarnings: (period: string = 'monthly') =>
    apiRequest<any>(`/seller/earnings?period=${period}`),

  // Settlements
  getSettlements: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/seller/settlements${query}`);
  },

  // KYC
  getKYCStatus: () => apiRequest<any>('/seller/kyc'),
  uploadKYCDocument: (formData: FormData) =>
    apiUpload<any>('/seller/kyc/upload', formData),
  submitKYC: () =>
    apiRequest<any>('/seller/kyc/submit', { method: 'POST' }),

  // Referrals
  getReferrals: () => apiRequest<any>('/seller/referrals'),
  generateReferralCode: () =>
    apiRequest<any>('/seller/referrals/code', { method: 'POST' }),

  // Promotions
  getPromotions: () => apiRequest<any[]>('/seller/promotions'),
  createPromotion: (data: any) =>
    apiRequest<any>('/seller/promotions', { method: 'POST', body: JSON.stringify(data) }),
  togglePromotion: (id: string, isActive: boolean) =>
    apiRequest<any>(`/seller/promotions/${id}/toggle`, {
      method: 'PATCH', body: JSON.stringify({ isActive }),
    }),

  // Reviews
  getReviews: () => apiRequest<any[]>('/seller/reviews'),
  replyToReview: (id: string, message: string) =>
    apiRequest<any>(`/seller/reviews/${id}/reply`, {
      method: 'POST', body: JSON.stringify({ message }),
    }),

  // Inventory
  getInventory: () => apiRequest<any[]>('/seller/inventory'),
  updateStock: (data: { productId: string; stock: number; expiryDate?: string }) =>
    apiRequest<any>('/seller/inventory/update', {
      method: 'POST', body: JSON.stringify(data),
    }),
  getLowStockAlerts: () => apiRequest<any[]>('/seller/inventory/low-stock'),
  getExpiryAlerts: () => apiRequest<any[]>('/seller/inventory/expiry-alerts'),

  // Customers
  getCustomers: () => apiRequest<any[]>('/seller/customers'),
  awardLoyaltyPoints: (userId: string, points: number) =>
    apiRequest<any>('/seller/customers/award-points', {
      method: 'POST', body: JSON.stringify({ userId, points }),
    }),

  // Marketing
  getCampaigns: () => apiRequest<any[]>('/seller/marketing/campaigns'),
  createCampaign: (data: any) =>
    apiRequest<any>('/seller/marketing/campaigns', {
      method: 'POST', body: JSON.stringify(data),
    }),

  // Payouts
  getPayouts: () => apiRequest<any[]>('/seller/payouts'),
  requestPayout: (amount: number, method: string) =>
    apiRequest<any>('/seller/payouts/request', {
      method: 'POST', body: JSON.stringify({ amount, method }),
    }),

  // Performance
  getPerformanceInsights: () => apiRequest<any>('/seller/performance-insights'),

  // Settings
  getNotificationPreferences: () => apiRequest<any>('/seller/settings/notifications'),
  updateNotificationPreferences: (data: any) =>
    apiRequest<any>('/seller/settings/notifications', {
      method: 'PUT', body: JSON.stringify(data),
    }),
  changePassword: (current: string, newPass: string) =>
    apiRequest<any>('/seller/settings/password', {
      method: 'POST', body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    }),

  // Support
  createSupportTicket: (data: { subject: string; message: string; category?: string }) =>
    apiRequest<any>('/seller/support/tickets', {
      method: 'POST', body: JSON.stringify(data),
    }),
  getMyTickets: () => apiRequest<any[]>('/seller/support/tickets'),
  addTicketResponse: (ticketId: string, message: string) =>
    apiRequest<any>('/seller/support/tickets/response', {
      method: 'POST', body: JSON.stringify({ ticketId, message }),
    }),

  // Notifications
  getNotifications: () => apiRequest<any[]>('/seller/notifications'),
  markNotificationRead: (id: string) =>
    apiRequest<any>(`/seller/notifications/${id}/read`, { method: 'PATCH' }),
};

// ============================================
// USER / CUSTOMER APIs
// ============================================
export const userAPI = {
  // GET /sellers?type=home_chef|restaurant&city=xxx
  getSellers: (params?: { type?: string; city?: string; search?: string; lat?: number; long?: number }) => {
    const query = new URLSearchParams();
    if (params?.type && params.type !== 'all') query.set('type', params.type);
    if (params?.city) query.set('city', params.city);
    if (params?.search) query.set('search', params.search);
    if (params?.lat) query.set('lat', String(params.lat));
    if (params?.long) query.set('long', String(params.long));
    return apiRequest<any[]>(`/sellers?${query}`);
  },

  // GET /sellers/:id
  getSellerById: (id: string) => apiRequest<any>(`/sellers/${id}`),

  // GET /sellers/:id/menu
  getSellerMenu: (sellerId: string) => apiRequest<any[]>(`/sellers/${sellerId}/menu`),

  // GET /menu/search?q=xxx
  searchMenu: (query: string) =>
    apiRequest<any[]>(`/menu/search?q=${encodeURIComponent(query)}`),

  // GET /user/menu (all products with filters)
  getMenuItems: (params?: { search?: string; sellerId?: string; page?: number; limit?: number; category?: string; isVeg?: boolean; sortBy?: string }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.sellerId) query.set('sellerId', params.sellerId);
    if (params?.page) query.set('page', String(params.page));
    if (params?.limit) query.set('limit', String(params.limit));
    if (params?.category) query.set('category', params.category);
    if (params?.isVeg) query.set('isVeg', 'true');
    if (params?.sortBy) query.set('sortBy', params.sortBy);
    return apiRequest<any>(`/user/menu?${query}`);
  },

  // AI Recommendations
  getRecommendations: () => apiRequest<any[]>('/user/recommendations'),

  // --- Cart ---
  getCart: () => apiRequest<any>('/cart'),

  addToCart: (data: { menuItemId: string; quantity: number; sellerId?: string }) =>
    apiRequest<any>('/cart/add', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCartItem: (menuItemId: string, quantity: number) =>
    apiRequest<any>('/cart/update', {
      method: 'PUT',
      body: JSON.stringify({ menuItemId, quantity }),
    }),

  removeFromCart: (menuItemId: string) =>
    apiRequest<any>(`/cart/remove/${menuItemId}`, { method: 'DELETE' }),

  clearCart: () => apiRequest<any>('/cart/clear', { method: 'DELETE' }),

  // --- Orders ---
  createOrder: (data: any) =>
    apiRequest<any>('/orders', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getOrders: () => apiRequest<any[]>('/orders'),

  getOrderById: (id: string) => apiRequest<any>(`/orders/${id}`),

  submitReview: (orderId: string, data: { rating: number; comment: string }) =>
    apiRequest<any>(`/orders/${orderId}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // --- Subscriptions ---
  createSubscription: (data: any) =>
    apiRequest<any>('/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  getSubscriptions: () => apiRequest<any[]>('/subscriptions'),

  pauseSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}/pause`, { method: 'PATCH' }),

  resumeSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}/resume`, { method: 'PATCH' }),

  cancelSubscription: (id: string) =>
    apiRequest<any>(`/subscriptions/${id}`, { method: 'DELETE' }),

  // --- Wishlist ---
  getWishlist: () => apiRequest<any[]>('/user/wishlist'),

  addToWishlist: (productId: string) =>
    apiRequest<any>('/user/wishlist/toggle', {
      method: 'POST',
      body: JSON.stringify({ productId }),
    }),

  // --- Wallet ---
  getWallet: () => apiRequest<any>('/wallet'),
  getWalletBalance: () => apiRequest<any>('/wallet'),

  getWalletTransactions: () => apiRequest<any[]>('/wallet/transactions'),
  getWalletHistory: () => apiRequest<any[]>('/wallet/transactions'),

  topupWallet: (amount: number) =>
    apiRequest<any>('/wallet/topup', {
      method: 'POST',
      body: JSON.stringify({ amount }),
    }),

  // --- Notifications ---
  getNotifications: () => apiRequest<any[]>('/user/notifications'),

  markNotificationRead: (id: string) =>
    apiRequest<any>(`/user/notifications/${id}/read`, { method: 'PATCH' }),

  // --- Payments ---
  createPaymentOrder: (data: { amount: number; orderId: string }) =>
    apiRequest<any>('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  verifyPayment: (data: any) =>
    apiRequest<any>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

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
  getDashboard: () => apiRequest<any>('/admin/dashboard'),

  // Sellers
  getSellers: (params?: { status?: string; type?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.type) query.set('type', params.type);
    if (params?.page) query.set('page', String(params.page));
    return apiRequest<{ sellers: any[]; total: number }>(`/admin/sellers?${query}`);
  },
  getSellerById: (id: string) => apiRequest<any>(`/admin/sellers/${id}`),
  approveSeller: (id: string) =>
    apiRequest<any>(`/admin/sellers/${id}/approve`, { method: 'PATCH' }),
  rejectSeller: (id: string, reason: string) =>
    apiRequest<any>(`/admin/sellers/${id}/reject`, {
      method: 'PATCH', body: JSON.stringify({ reason }),
    }),
  updateSellerCommission: (id: string, commission: number) =>
    apiRequest<any>(`/admin/sellers/${id}/commission`, {
      method: 'PATCH', body: JSON.stringify({ commission }),
    }),
  toggleSellerActive: (id: string) =>
    apiRequest<any>(`/admin/sellers/${id}/toggle-active`, { method: 'PATCH' }),

  // Users
  getUsers: (params?: { page?: number; search?: string; status?: string }) => {
    const query = new URLSearchParams();
    if (params?.page) query.set('page', String(params.page));
    if (params?.search) query.set('search', params.search);
    if (params?.status) query.set('status', params.status);
    return apiRequest<{ users: any[]; total: number }>(`/admin/users?${query}`);
  },
  blockUser: (id: string) =>
    apiRequest<any>(`/admin/users/${id}/block`, { method: 'PATCH' }),
  unblockUser: (id: string) =>
    apiRequest<any>(`/admin/users/${id}/unblock`, { method: 'PATCH' }),

  // Orders
  getOrders: (params?: { status?: string; page?: number; sellerId?: string }) => {
    const query = new URLSearchParams();
    if (params?.status && params.status !== 'all') query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    if (params?.sellerId) query.set('sellerId', params.sellerId);
    return apiRequest<{ orders: any[]; total: number }>(`/admin/orders?${query}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<any>(`/admin/orders/${id}/status`, {
      method: 'PATCH', body: JSON.stringify({ status }),
    }),
  refundOrder: (id: string) =>
    apiRequest<any>(`/admin/orders/${id}/refund`, { method: 'POST' }),

  // Settlements
  getSettlements: (status?: string) => {
    const query = status ? `?status=${status}` : '';
    return apiRequest<any[]>(`/admin/settlements${query}`);
  },
  processSettlement: (id: string) =>
    apiRequest<any>(`/admin/settlements/${id}/process`, { method: 'POST' }),
  bulkProcessSettlements: (ids: string[]) =>
    apiRequest<any>('/admin/settlements/bulk-process', {
      method: 'POST', body: JSON.stringify({ ids }),
    }),

  // Commission
  getCommissionConfig: () => apiRequest<any>('/admin/commission'),
  updateCommissionConfig: (data: any) =>
    apiRequest<any>('/admin/commission', { method: 'PUT', body: JSON.stringify(data) }),

  // GST
  getGSTConfig: () => apiRequest<any>('/admin/gst'),
  updateGSTConfig: (data: any) =>
    apiRequest<any>('/admin/gst', { method: 'PUT', body: JSON.stringify(data) }),

  // Referrals
  getReferrals: (params?: { status?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.status) query.set('status', params.status);
    if (params?.page) query.set('page', String(params.page));
    return apiRequest<{ referrals: any[]; total: number }>(`/admin/referrals?${query}`);
  },
  getReferralConfig: () => apiRequest<any>('/admin/referrals/config'),
  updateReferralConfig: (data: any) =>
    apiRequest<any>('/admin/referrals/config', { method: 'PUT', body: JSON.stringify(data) }),

  // Marketing
  getCampaigns: () => apiRequest<any[]>('/admin/marketing/campaigns'),
  createCampaign: (data: any) =>
    apiRequest<any>('/admin/marketing/campaigns', {
      method: 'POST', body: JSON.stringify(data),
    }),
  updateCampaign: (id: string, data: any) =>
    apiRequest<any>(`/admin/marketing/campaigns/${id}`, {
      method: 'PUT', body: JSON.stringify(data),
    }),
  getMarketingSpend: () => apiRequest<any>('/admin/marketing/spend'),

  // Analytics
  getAnalytics: (period: string = 'monthly') =>
    apiRequest<any>(`/admin/analytics?period=${period}`),
  getCityWiseRevenue: () => apiRequest<any[]>('/admin/analytics/city-wise'),
  getCategoryWiseSales: () => apiRequest<any[]>('/admin/analytics/category-wise'),
  getCartDropoffs: () => apiRequest<any>('/admin/analytics/cart-dropoffs'),

  // Performance
  getSellerPerformance: () => apiRequest<any[]>('/admin/performance/sellers'),
  getPerformanceOverview: () => apiRequest<any>('/admin/performance/overview'),

  // Platform Config
  getPlatformConfig: () => apiRequest<any>('/admin/config'),
  updatePlatformConfig: (data: any) =>
    apiRequest<any>('/admin/config', { method: 'PUT', body: JSON.stringify(data) }),

  // Disputes
  getDisputes: () => apiRequest<any[]>('/admin/disputes'),
  resolveDispute: (id: string, status: string, resolution: string) =>
    apiRequest<any>(`/admin/disputes/${id}/resolve`, {
      method: 'POST', body: JSON.stringify({ status, resolution }),
    }),

  // Audit Logs
  getAuditLogs: (params?: { search?: string; page?: number }) => {
    const query = new URLSearchParams();
    if (params?.search) query.set('search', params.search);
    if (params?.page) query.set('page', String(params.page));
    return apiRequest<any>(`/admin/audit-logs?${query}`);
  },

  // Categories
  getCategories: () => apiRequest<any[]>('/admin/categories'),
  createCategory: (data: any) =>
    apiRequest<any>('/admin/categories', { method: 'POST', body: JSON.stringify(data) }),
  updateCategory: (id: string, data: any) =>
    apiRequest<any>(`/admin/categories/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    apiRequest<any>(`/admin/categories/${id}`, { method: 'DELETE' }),
};

export { apiRequest, apiUpload, API_BASE_URL };
