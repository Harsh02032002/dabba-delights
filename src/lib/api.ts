// ============================================
// Dabba Nation - Centralized API Service
// ============================================
// All API endpoints are listed here.
// Connect your Node.js/Express backend by setting VITE_API_URL in .env
// Example: VITE_API_URL=http://localhost:5000/api
// ============================================

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Generic API request helper with JWT auth
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token && { Authorization: `Bearer ${token}` }),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).message || "API request failed");
  }

  return response.json();
}

// For file uploads (KYC, images etc.)
async function apiUpload<T>(endpoint: string, formData: FormData): Promise<T> {
  const token = localStorage.getItem("token");

  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method: "POST",
    body: formData,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).message || "API upload failed");
  }

  return response.json();
}

// Helper to build query strings without using `any`
function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const entries = Object.entries(params).reduce<Record<string, string>>(
    (acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    },
    {},
  );
  return new URLSearchParams(entries).toString();
}

// SELLER APIs
export const sellerAPI = {
  // Dashboard
  getDashboard: () => apiRequest<unknown>("/seller/dashboard"),

  // Orders
  getOrders: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : "";
    return apiRequest<unknown[]>(`/seller/orders${query}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiRequest<unknown>(`/seller/orders/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  // Menu (Products)
  getMenuItems: () => apiRequest<unknown[]>("/seller/menu"),
  addMenuItem: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/seller/menu", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteMenuItem: (id: string) =>
    apiRequest<unknown>(`/seller/menu/${id}`, { method: "DELETE" }),

  // Profile
  getProfile: () => apiRequest<unknown>("/seller/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/seller/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Earnings
  getEarnings: (period: string) =>
    apiRequest<unknown>(`/seller/earnings?period=${period}`),

  // Analytics
  getAnalytics: (period: string) =>
    apiRequest<unknown>(`/seller/analytics?period=${period}`),
  getTopItems: () => apiRequest<unknown[]>("/seller/analytics/top-items"),
  getPeakHours: () => apiRequest<unknown>("/seller/analytics/peak-hours"),
  getRepeatCustomers: () =>
    apiRequest<unknown>("/seller/analytics/repeat-customers"),
  getAISuggestions: () =>
    apiRequest<unknown>("/seller/analytics/ai-suggestions"),

  // Settlements
  getSettlements: (status?: string) =>
    apiRequest<unknown[]>(
      `/seller/settlements${status ? `?status=${status}` : ""}`,
    ),

  // KYC
  getKYCStatus: () => apiRequest<unknown>("/seller/kyc"),
  uploadKYCDocument: (formData: FormData) =>
    apiUpload<unknown>("/seller/kyc/document", formData),
  submitKYC: () =>
    apiRequest<unknown>("/seller/kyc/submit", { method: "POST" }),

  // Notifications
  getNotifications: () => apiRequest<unknown[]>("/seller/notifications"),
  markNotificationRead: (id: string) =>
    apiRequest<unknown>(`/seller/notifications/${id}/read`, {
      method: "PATCH",
    }),

  // Low Stock Alerts
  getLowStockAlerts: () => apiRequest<unknown[]>("/seller/inventory/low-stock"),

  // Referrals
  getReferrals: () => apiRequest<unknown>("/seller/referrals"),
  generateReferralCode: () =>
    apiRequest<unknown>("/seller/referrals/code", { method: "POST" }),

  // Promotions / Offers
  getPromotions: () => apiRequest<unknown[]>("/seller/promotions"),
  createPromotion: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/seller/promotions", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  togglePromotion: (id: string, isActive: boolean) =>
    apiRequest<unknown>(`/seller/promotions/${id}/toggle`, {
      method: "PATCH",
      body: JSON.stringify({ isActive }),
    }),

  // Reviews & Ratings
  getReviews: () => apiRequest<unknown[]>("/seller/reviews"),
  replyToReview: (id: string, message: string) =>
    apiRequest<unknown>(`/seller/reviews/${id}/reply`, {
      method: "POST",
      body: JSON.stringify({ message }),
    }),

  // Inventory / Stock
  getInventory: () => apiRequest<unknown[]>("/seller/inventory"),
  updateStock: (data: {
    productId: string;
    stock: number;
    expiryDate?: Date;
  }) =>
    apiRequest<unknown>("/seller/inventory/update", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getExpiryAlerts: () =>
    apiRequest<unknown[]>("/seller/inventory/expiry-alerts"),

  // Customers
  getCustomers: () => apiRequest<unknown[]>("/seller/customers"),
  awardLoyaltyPoints: (userId: string, points: number) =>
    apiRequest<unknown>("/seller/customers/award-points", {
      method: "POST",
      body: JSON.stringify({ userId, points }),
    }),

  // Marketing Tools
  getCampaigns: () => apiRequest<unknown[]>("/seller/marketing/campaigns"),
  createCampaign: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/seller/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Payout History
  getPayouts: () => apiRequest<unknown[]>("/seller/payouts"),
  requestPayout: (amount: number, method: string) =>
    apiRequest<unknown>("/seller/payouts/request", {
      method: "POST",
      body: JSON.stringify({ amount, method }),
    }),

  // Performance Insights
  getPerformanceInsights: () =>
    apiRequest<unknown>("/seller/performance-insights"),

  // Settings (Notifications + Password)
  getNotificationPreferences: () =>
    apiRequest<unknown>("/seller/settings/notifications"),
  updateNotificationPreferences: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/seller/settings/notifications", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  changePassword: (current: string, newPass: string) =>
    apiRequest<unknown>("/seller/settings/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword: current, newPassword: newPass }),
    }),

  // Help & Support
  createSupportTicket: (data: {
    subject: string;
    message: string;
    category?: string;
  }) =>
    apiRequest<unknown>("/seller/support/tickets", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  getMyTickets: () => apiRequest<unknown[]>("/seller/support/tickets"),
  addTicketResponse: (ticketId: string, message: string) =>
    apiRequest<unknown>("/seller/support/tickets/response", {
      method: "POST",
      body: JSON.stringify({ ticketId, message }),
    }),
};

// ADMIN APIs
export const adminAPI = {
  // Dashboard
  getDashboard: () => apiRequest<unknown>("/admin/dashboard"),

  // Analytics
  getAnalytics: (period: string) =>
    apiRequest<unknown>(`/admin/analytics?period=${period}`),
  getCityWiseRevenue: () => apiRequest<unknown[]>("/admin/analytics/city-wise"),
  getCategoryWiseSales: () =>
    apiRequest<unknown[]>("/admin/analytics/category-wise"),
  getCartDropoffs: () => apiRequest<unknown>("/admin/analytics/cart-dropoffs"),

  // Performance
  getSellerPerformance: () =>
    apiRequest<unknown[]>("/admin/performance/sellers"),
  getPerformanceOverview: () =>
    apiRequest<unknown>("/admin/performance/overview"),

  // Settlements
  getSettlements: (status?: string) =>
    apiRequest<unknown[]>(
      `/admin/settlements${status ? `?status=${status}` : ""}`,
    ),
  processSettlement: (id: string) =>
    apiRequest<unknown>(`/admin/settlements/${id}/process`, { method: "POST" }),

  // Sellers Management
  getSellers: (status?: string) =>
    apiRequest<unknown[]>(`/admin/sellers${status ? `?status=${status}` : ""}`),
  approveSeller: (id: string) =>
    apiRequest<unknown>(`/admin/sellers/${id}/approve`, { method: "POST" }),
  rejectSeller: (id: string) =>
    apiRequest<unknown>(`/admin/sellers/${id}/reject`, { method: "POST" }),

  // Users Management
  getUsers: (params?: { search?: string; status?: string }) => {
    const query = toQuery(params as Record<string, unknown> | undefined);
    return apiRequest<unknown[]>(`/admin/users?${query}`);
  },
  blockUser: (id: string) =>
    apiRequest<unknown>(`/admin/users/${id}/block`, { method: "POST" }),
  unblockUser: (id: string) =>
    apiRequest<unknown>(`/admin/users/${id}/unblock`, { method: "POST" }),

  // Orders (Admin View)
  getOrders: (status?: string) =>
    apiRequest<unknown[]>(`/admin/orders${status ? `?status=${status}` : ""}`),
  refundOrder: (id: string) =>
    apiRequest<unknown>(`/admin/orders/${id}/refund`, { method: "POST" }),

  // Commission Config
  getCommissionConfig: () => apiRequest<unknown>("/admin/commission"),
  updateCommissionConfig: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/commission", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // GST Config
  getGSTConfig: () => apiRequest<unknown>("/admin/gst"),
  updateGSTConfig: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/gst", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Referrals (Admin View)
  getReferrals: (status?: string) =>
    apiRequest<unknown[]>(
      `/admin/referrals${status ? `?status=${status}` : ""}`,
    ),
  updateReferralConfig: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/referrals/config", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Marketing Campaigns
  getCampaigns: () => apiRequest<unknown[]>("/admin/marketing/campaigns"),
  createCampaign: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/marketing/campaigns", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Platform Settings
  getPlatformConfig: () => apiRequest<unknown>("/admin/config"),
  updatePlatformConfig: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/config", {
      method: "PUT",
      body: JSON.stringify(data),
    }),

  // Disputes
  getDisputes: () => apiRequest<unknown[]>("/admin/disputes"),
  resolveDispute: (id: string, status: string, resolution: string) =>
    apiRequest<unknown>(`/admin/disputes/${id}/resolve`, {
      method: "POST",
      body: JSON.stringify({ status, resolution }),
    }),

  // Audit Logs
  getAuditLogs: () => apiRequest<unknown[]>("/admin/audit-logs"),

  // Categories Management
  getCategories: () => apiRequest<unknown[]>("/admin/categories"),
  createCategory: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/admin/categories", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  deleteCategory: (id: string) =>
    apiRequest<unknown>(`/admin/categories/${id}`, { method: "DELETE" }),
};

// USER / CUSTOMER APIs
export const userAPI = {
  // Home Page - Sellers
  getSellers: (params: {
    type?: string;
    search?: string;
    lat?: number;
    long?: number;
  }) => {
    const query = toQuery(params as Record<string, unknown> | undefined);
    return apiRequest<unknown[]>(`/user/sellers?${query}`);
  },

  // Menu Items
  getMenuItems: (params: { search?: string; sellerId?: string }) => {
    const query = toQuery(params as Record<string, unknown> | undefined);
    return apiRequest<unknown[]>(`/user/menu?${query}`);
  },

  // AI Recommendations
  getRecommendations: () => apiRequest<unknown[]>("/user/recommendations"),

  // Cart Operations
  getCart: () => apiRequest<unknown>("/user/cart"),
  addToCart: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/user/cart/add", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  updateQuantity: (itemId: string, quantity: number) =>
    apiRequest<unknown>("/user/cart/update", {
      method: "PATCH",
      body: JSON.stringify({ itemId, quantity }),
    }),
  removeFromCart: (itemId: string) =>
    apiRequest<unknown>(`/user/cart/remove/${itemId}`, { method: "DELETE" }),

  // Place Order
  placeOrder: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/user/orders/place", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Wishlist
  addToWishlist: (productId: string) =>
    apiRequest<unknown>("/user/wishlist/add", {
      method: "POST",
      body: JSON.stringify({ productId }),
    }),
  getWishlist: () => apiRequest<unknown[]>("/user/wishlist"),

  // Wallet
  topupWallet: (amount: number) =>
    apiRequest<unknown>("/user/wallet/topup", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),
  verifyPayment: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/user/wallet/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Notifications
  getNotifications: () => apiRequest<unknown[]>("/user/notifications"),
};

const authAPI = {
  login: (email: string, password: string) =>
    apiRequest<unknown>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  register: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  sellerLogin: (email: string, password: string) =>
    apiRequest<unknown>("/auth/seller/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminLogin: (email: string, password: string) =>
    apiRequest<unknown>("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => apiRequest<unknown>("/auth/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest<unknown>("/auth/profile", {
      method: "PUT",
      body: JSON.stringify(data),
    }),
};

export { apiRequest, apiUpload, API_BASE_URL, authAPI };
