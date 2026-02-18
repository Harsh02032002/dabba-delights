// ============================================
// Dabba Nation - Centralized API Service
// ============================================
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

async function apiRequest<T = any>(
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

async function apiUpload<T = any>(endpoint: string, formData: FormData, method = "POST"): Promise<T> {
  const token = localStorage.getItem("token");
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    body: formData,
    headers,
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error((error as any).message || "API upload failed");
  }
  return response.json();
}

function toQuery(params?: Record<string, unknown>) {
  if (!params) return "";
  const entries = Object.entries(params).reduce<Record<string, string>>(
    (acc, [k, v]) => {
      if (v !== undefined && v !== null) acc[k] = String(v);
      return acc;
    },
    {},
  );
  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
}

// ─── PRODUCT API (shared by seller & admin) ────────────────────────────────
export const productAPI = {
  // CRUD
  getProducts: (params?: Record<string, unknown>) =>
    apiRequest(`/products${toQuery(params)}`),
  createProduct: (formData: FormData) =>
    apiUpload("/products", formData),
  updateProduct: (id: string, formData: FormData) =>
    apiUpload(`/products/${id}`, formData, "PATCH"),
  deleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),

  // Status / Availability
  toggleAvailability: (id: string) =>
    apiRequest(`/products/${id}/toggle-availability`, { method: "PATCH" }),
  markOutOfStock: (id: string) =>
    apiRequest(`/products/${id}/out-of-stock`, { method: "PATCH" }),
  markInStock: (id: string) =>
    apiRequest(`/products/${id}/in-stock`, { method: "PATCH" }),

  // Quick edits
  updatePrice: (id: string, price: number) =>
    apiRequest(`/products/${id}/price`, { method: "PATCH", body: JSON.stringify({ price }) }),
  updateCategory: (id: string, category: string) =>
    apiRequest(`/products/${id}/category`, { method: "PATCH", body: JSON.stringify({ category }) }),
  toggleVeg: (id: string) =>
    apiRequest(`/products/${id}/toggle-veg`, { method: "PATCH" }),

  // Bulk JSON
  bulkCreate: (items: any[]) =>
    apiRequest("/products/bulk", { method: "POST", body: JSON.stringify(items) }),
  bulkUpdate: (items: any[]) =>
    apiRequest("/products/bulk", { method: "PATCH", body: JSON.stringify(items) }),

  // Bulk CSV
  bulkCSV: (formData: FormData) =>
    apiUpload("/products/bulk/csv", formData),

  // Duplicate
  duplicateProduct: (id: string) =>
    apiRequest(`/products/${id}/duplicate`, { method: "POST" }),

  // Archive / Delete
  archiveProduct: (id: string) =>
    apiRequest(`/products/${id}/archive`, { method: "PATCH" }),
  restoreProduct: (id: string) =>
    apiRequest(`/products/${id}/restore`, { method: "PATCH" }),
  hardDeleteProduct: (id: string) =>
    apiRequest(`/products/${id}/hard-delete`, { method: "DELETE" }),

  // Images
  replaceImage: (id: string, formData: FormData) =>
    apiUpload(`/products/${id}/image/replace`, formData, "PATCH"),
  removeImage: (id: string) =>
    apiRequest(`/products/${id}/image`, { method: "DELETE" }),

  // AI Optimize
  suggestOptimisation: (id?: string) =>
    apiRequest(id ? `/products/${id}/optimize` : "/products/optimize", { method: "POST" }),

  // Preview
  generatePreviewLink: () =>
    apiRequest("/products/preview-link", { method: "POST" }),

  // Metrics
  getInvestorMetrics: () =>
    apiRequest("/products/investor-metrics"),
  getProductPerformance: (id: string) =>
    apiRequest(`/products/${id}/performance`),

  // Smart bulk
  applySmartBulkRule: (data: any) =>
    apiRequest("/products/smart-bulk-rule", { method: "PATCH", body: JSON.stringify(data) }),
  setHappyHourDiscount: (data: any) =>
    apiRequest("/products/happy-hour", { method: "PATCH", body: JSON.stringify(data) }),

  // Inventory sync
  syncInventory: (items: { id: string; stock: number }[]) =>
    apiRequest("/products/sync-inventory", { method: "PATCH", body: JSON.stringify(items) }),

  // Bulk action (mass action bar)
  bulkAction: (data: { ids: string[]; action: string; value?: any }) =>
    apiRequest("/products/bulk-action", { method: "POST", body: JSON.stringify(data) }),

  // Menu health
  menuHealthScore: () =>
    apiRequest("/products/menu-health"),

  // Publish draft
  publishProduct: (id: string) =>
    apiRequest(`/products/${id}/publish`, { method: "PATCH" }),

  // Low stock
  getLowStockProducts: () =>
    apiRequest("/products/low-stock"),
};

// SELLER APIs
export const sellerAPI = {
  getDashboard: () => apiRequest("/seller/dashboard"),
  getOrders: (params?: { status?: string }) => {
    const query = params?.status ? `?status=${params.status}` : "";
    return apiRequest(`/seller/orders${query}`);
  },
  updateOrderStatus: (id: string, status: string) =>
    apiRequest(`/seller/orders/${id}/status`, { method: "PATCH", body: JSON.stringify({ status }) }),
  getMenuItems: (params?: Record<string, unknown>) =>
    apiRequest(`/products${toQuery(params)}`),
  addMenuItem: (data: Record<string, unknown>) =>
    apiRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  deleteMenuItem: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),
  getProfile: () => apiRequest("/seller/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/seller/profile", { method: "PUT", body: JSON.stringify(data) }),
  getEarnings: (period: string) =>
    apiRequest(`/seller/earnings?period=${period}`),
  getAnalytics: (period: string) =>
    apiRequest(`/seller/analytics?period=${period}`),
  getTopItems: () => apiRequest("/seller/analytics/top-items"),
  getPeakHours: () => apiRequest("/seller/analytics/peak-hours"),
  getRepeatCustomers: () => apiRequest("/seller/analytics/repeat-customers"),
  getAISuggestions: () => apiRequest("/seller/analytics/ai-suggestions"),
  getSettlements: (status?: string) =>
    apiRequest(`/seller/settlements${status ? `?status=${status}` : ""}`),
  getKYCStatus: () => apiRequest("/seller/kyc"),
  uploadKYCDocument: (formData: FormData) =>
    apiUpload("/seller/kyc/document", formData),
  submitKYC: () => apiRequest("/seller/kyc/submit", { method: "POST" }),
  getNotifications: () => apiRequest("/seller/notifications"),
  markNotificationRead: (id: string) =>
    apiRequest(`/seller/notifications/${id}/read`, { method: "PATCH" }),
  getLowStockAlerts: () => apiRequest("/seller/inventory/low-stock"),
  getReferrals: () => apiRequest("/seller/referrals"),
  generateReferralCode: () =>
    apiRequest("/seller/referrals/code", { method: "POST" }),
  getPromotions: () => apiRequest("/seller/promotions"),
  createPromotion: (data: Record<string, unknown>) =>
    apiRequest("/seller/promotions", { method: "POST", body: JSON.stringify(data) }),
  togglePromotion: (id: string, isActive: boolean) =>
    apiRequest(`/seller/promotions/${id}/toggle`, { method: "PATCH", body: JSON.stringify({ isActive }) }),
  getReviews: () => apiRequest("/seller/reviews"),
  replyToReview: (id: string, message: string) =>
    apiRequest(`/seller/reviews/${id}/reply`, { method: "POST", body: JSON.stringify({ message }) }),
  getInventory: () => apiRequest("/seller/inventory"),
  updateStock: (data: { productId: string; stock: number; expiryDate?: Date }) =>
    apiRequest("/seller/inventory/update", { method: "POST", body: JSON.stringify(data) }),
  getExpiryAlerts: () => apiRequest("/seller/inventory/expiry-alerts"),
  getCustomers: () => apiRequest("/seller/customers"),
  awardLoyaltyPoints: (userId: string, points: number) =>
    apiRequest("/seller/customers/award-points", { method: "POST", body: JSON.stringify({ userId, points }) }),
  getCampaigns: () => apiRequest("/seller/marketing/campaigns"),
  createCampaign: (data: Record<string, unknown>) =>
    apiRequest("/seller/marketing/campaigns", { method: "POST", body: JSON.stringify(data) }),
  getPayouts: () => apiRequest("/seller/payouts"),
  requestPayout: (amount: number, method: string) =>
    apiRequest("/seller/payouts/request", { method: "POST", body: JSON.stringify({ amount, method }) }),
  getPerformanceInsights: () => apiRequest("/seller/performance-insights"),
  getNotificationPreferences: () => apiRequest("/seller/settings/notifications"),
  updateNotificationPreferences: (data: Record<string, unknown>) =>
    apiRequest("/seller/settings/notifications", { method: "PUT", body: JSON.stringify(data) }),
  changePassword: (current: string, newPass: string) =>
    apiRequest("/seller/settings/password", { method: "POST", body: JSON.stringify({ currentPassword: current, newPassword: newPass }) }),
  createSupportTicket: (data: { subject: string; message: string; category?: string }) =>
    apiRequest("/seller/support/tickets", { method: "POST", body: JSON.stringify(data) }),
  getMyTickets: () => apiRequest("/seller/support/tickets"),
  addTicketResponse: (ticketId: string, message: string) =>
    apiRequest("/seller/support/tickets/response", { method: "POST", body: JSON.stringify({ ticketId, message }) }),
};

// ADMIN APIs
export const adminAPI = {
  getDashboard: () => apiRequest("/admin/dashboard"),
  getAnalytics: (period: string) => apiRequest(`/admin/analytics?period=${period}`),
  getCityWiseRevenue: () => apiRequest("/admin/analytics/city-wise"),
  getCategoryWiseSales: () => apiRequest("/admin/analytics/category-wise"),
  getCartDropoffs: () => apiRequest("/admin/analytics/cart-dropoffs"),
  getSellerPerformance: () => apiRequest("/admin/performance/sellers"),
  getPerformanceOverview: () => apiRequest("/admin/performance/overview"),
  getSettlements: (status?: string) =>
    apiRequest(`/admin/settlements${status ? `?status=${status}` : ""}`),
  processSettlement: (id: string) =>
    apiRequest(`/admin/settlements/${id}/process`, { method: "POST" }),
  getSellers: (status?: string) =>
    apiRequest(`/admin/sellers${status ? `?status=${status}` : ""}`),
  approveSeller: (id: string) =>
    apiRequest(`/admin/sellers/${id}/approve`, { method: "POST" }),
  rejectSeller: (id: string) =>
    apiRequest(`/admin/sellers/${id}/reject`, { method: "POST" }),
  getUsers: (params?: { search?: string; status?: string }) =>
    apiRequest(`/admin/users${toQuery(params as Record<string, unknown>)}`),
  blockUser: (id: string) =>
    apiRequest(`/admin/users/${id}/block`, { method: "POST" }),
  unblockUser: (id: string) =>
    apiRequest(`/admin/users/${id}/unblock`, { method: "POST" }),
  getOrders: (status?: string) =>
    apiRequest(`/admin/orders${status ? `?status=${status}` : ""}`),
  refundOrder: (id: string) =>
    apiRequest(`/admin/orders/${id}/refund`, { method: "POST" }),
  getCommissionConfig: () => apiRequest("/admin/commission"),
  updateCommissionConfig: (data: Record<string, unknown>) =>
    apiRequest("/admin/commission", { method: "PUT", body: JSON.stringify(data) }),
  getGSTConfig: () => apiRequest("/admin/gst"),
  updateGSTConfig: (data: Record<string, unknown>) =>
    apiRequest("/admin/gst", { method: "PUT", body: JSON.stringify(data) }),
  getReferrals: (status?: string) =>
    apiRequest(`/admin/referrals${status ? `?status=${status}` : ""}`),
  updateReferralConfig: (data: Record<string, unknown>) =>
    apiRequest("/admin/referrals/config", { method: "PUT", body: JSON.stringify(data) }),
  getMarketingSpend: () => apiRequest("/admin/marketing/spend"),
  getReferralConfig: () => apiRequest("/admin/referrals/config"),
  getCampaigns: () => apiRequest("/admin/marketing/campaigns"),
  createCampaign: (data: Record<string, unknown>) =>
    apiRequest("/admin/marketing/campaigns", { method: "POST", body: JSON.stringify(data) }),
  getPlatformConfig: () => apiRequest("/admin/config"),
  updatePlatformConfig: (data: Record<string, unknown>) =>
    apiRequest("/admin/config", { method: "PUT", body: JSON.stringify(data) }),
  getDisputes: () => apiRequest("/admin/disputes"),
  resolveDispute: (id: string, status: string, resolution: string) =>
    apiRequest(`/admin/disputes/${id}/resolve`, { method: "POST", body: JSON.stringify({ status, resolution }) }),
  getAuditLogs: (params?: Record<string, unknown>) =>
    apiRequest(`/admin/audit-logs${toQuery(params)}`),
  getCategories: () => apiRequest("/admin/categories"),
  createCategory: (data: Record<string, unknown>) =>
    apiRequest("/admin/categories", { method: "POST", body: JSON.stringify(data) }),
  deleteCategory: (id: string) =>
    apiRequest(`/admin/categories/${id}`, { method: "DELETE" }),
  bulkProcessSettlements: (ids: string[]) =>
    apiRequest("/admin/settlements/bulk-process", { method: "POST", body: JSON.stringify({ ids }) }),
};

// USER / CUSTOMER APIs
export const userAPI = {
  getSellers: (params?: Record<string, unknown>) =>
    apiRequest(`/user/sellers${toQuery(params)}`),
  getMenuItems: (params?: Record<string, unknown>) =>
    apiRequest(`/user/menu${toQuery(params)}`),
  getRecommendations: () => apiRequest("/user/recommendations"),
  getCart: () => apiRequest("/user/cart"),
  addToCart: (data: Record<string, unknown>) =>
    apiRequest("/user/cart/add", { method: "POST", body: JSON.stringify(data) }),
  updateQuantity: (itemId: string, quantity: number) =>
    apiRequest("/user/cart/update", { method: "PATCH", body: JSON.stringify({ itemId, quantity }) }),
  removeFromCart: (itemId: string) =>
    apiRequest(`/user/cart/remove/${itemId}`, { method: "DELETE" }),
  placeOrder: (data: Record<string, unknown>) =>
    apiRequest("/user/orders/place", { method: "POST", body: JSON.stringify(data) }),
  addToWishlist: (productId: string) =>
    apiRequest("/user/wishlist/add", { method: "POST", body: JSON.stringify({ productId }) }),
  getWishlist: () => apiRequest("/user/wishlist"),
  topupWallet: (amount: number) =>
    apiRequest("/user/wallet/topup", { method: "POST", body: JSON.stringify({ amount }) }),
  verifyPayment: (data: Record<string, unknown>) =>
    apiRequest("/user/wallet/verify", { method: "POST", body: JSON.stringify(data) }),
  getNotifications: () => apiRequest("/user/notifications"),
};

const authAPI = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  sellerLogin: (email: string, password: string) =>
    apiRequest("/auth/seller/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  adminLogin: (email: string, password: string) =>
    apiRequest("/auth/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  getProfile: () => apiRequest("/auth/profile"),
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  register: (data: Record<string, unknown>) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Convenience methods for each role
  userRegister: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => authAPI.register({ ...data, role: "user" }),

  sellerRegister: (data: {
    name: string;
    email: string;
    password: string;
    phone: string;
    businessName: string;
    address: string;
  }) => authAPI.register({ ...data, role: "seller" }),

  adminRegister: (data: { name: string; email: string; password: string }) =>
    authAPI.register({ ...data, role: "admin" }),
};

export { apiRequest, apiUpload, API_BASE_URL, authAPI };
