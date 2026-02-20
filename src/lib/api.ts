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
      if (v !== undefined && v !== null && v !== "") acc[k] = String(v);
      return acc;
    },
    {},
  );
  const qs = new URLSearchParams(entries).toString();
  return qs ? `?${qs}` : "";
}

// ─── PRODUCT API — matches product.routes.js exactly ───────────────────────
export const productAPI = {
  // A — BASIC CRUD
  // GET /products  (query: search, category, isVeg, isAvailable, page, limit, sort)
  getProducts: (params?: Record<string, unknown>) =>
    apiRequest(`/products${toQuery(params)}`),
  // POST /products  (multipart — handleImageUpload middleware)
  createProduct: (formData: FormData) =>
    apiUpload("/products", formData),
  // PUT /products/:id  (multipart — handleImageUpload middleware)
  updateProduct: (id: string, formData: FormData) =>
    apiUpload(`/products/${id}`, formData, "PUT"),
  
  // B — STATUS / AVAILABILITY
  // PATCH /products/:id/toggle
  toggleAvailability: (id: string) =>
    apiRequest(`/products/${id}/toggle`, { method: "PATCH" }),
  // PATCH /products/:id/out-of-stock
  markOutOfStock: (id: string) =>
    apiRequest(`/products/${id}/out-of-stock`, { method: "PATCH" }),
  // PATCH /products/:id/in-stock
  markInStock: (id: string) =>
    apiRequest(`/products/${id}/in-stock`, { method: "PATCH" }),

  // C — QUICK EDIT
  // PATCH /products/:id/price
  updatePrice: (id: string, price: number) =>
    apiRequest(`/products/${id}/price`, { method: "PATCH", body: JSON.stringify({ price }) }),
  // PATCH /products/:id/category
  updateCategory: (id: string, category: string) =>
    apiRequest(`/products/${id}/category`, { method: "PATCH", body: JSON.stringify({ category }) }),
  // PATCH /products/:id/veg-toggle
  toggleVeg: (id: string) =>
    apiRequest(`/products/${id}/veg-toggle`, { method: "PATCH" }),

  // D — BULK JSON
  // POST /products/bulk/create
  bulkCreate: (items: any[]) =>
    apiRequest("/products/bulk/create", { method: "POST", body: JSON.stringify(items) }),
  // PUT /products/bulk/update
  bulkUpdate: (items: any[]) =>
    apiRequest("/products/bulk/update", { method: "PUT", body: JSON.stringify(items) }),

  // E — CSV BULK
  // POST /products/bulk/csv  (multipart, field: "file")
  bulkCSV: (formData: FormData) =>
    apiUpload("/products/bulk/csv", formData),

  // F — DUPLICATE
  // POST /products/:id/duplicate
  duplicateProduct: (id: string) =>
    apiRequest(`/products/${id}/duplicate`, { method: "POST" }),

  // I — ARCHIVE / DELETE
  // PATCH /products/:id/archive
  archiveProduct: (id: string) =>
    apiRequest(`/products/${id}/archive`, { method: "PATCH" }),
  // PATCH /products/:id/restore
  restoreProduct: (id: string) =>
    apiRequest(`/products/${id}/restore`, { method: "PATCH" }),
  // DELETE /products/:id
  hardDeleteProduct: (id: string) =>
    apiRequest(`/products/${id}`, { method: "DELETE" }),

  // J — IMAGE
  // PATCH /products/:id/image  (multipart — handleImageUpload)
  replaceImage: (id: string, formData: FormData) =>
    apiUpload(`/products/${id}/image`, formData, "PATCH"),
  // DELETE /products/:id/image
  removeImage: (id: string) =>
    apiRequest(`/products/${id}/image`, { method: "DELETE" }),

  // K — METRICS
  // GET /products/metrics
  getInvestorMetrics: () =>
    apiRequest("/products/metrics"),
  
  // L — SMART BULK + HAPPY HOUR
  // POST /products/bulk/smart-rule
  applySmartBulkRule: (data: any) =>
    apiRequest("/products/bulk/smart-rule", { method: "POST", body: JSON.stringify(data) }),
  // PATCH /products/happy-hour
  setHappyHourDiscount: (data: any) =>
    apiRequest("/products/happy-hour", { method: "PATCH", body: JSON.stringify(data) }),

  // M — MENU VERSIONING
  // PATCH /products/menu-version
  switchMenuVersion: (version: number) =>
    apiRequest("/products/menu-version", { method: "PATCH", body: JSON.stringify({ version }) }),

  // N — DRAFT / PUBLISH
  // PATCH /products/:id/publish
  publishProduct: (id: string) =>
    apiRequest(`/products/${id}/publish`, { method: "PATCH" }),

  // O & X — AI OPTIMISATION
  // GET /products/optimise-suggestions
  suggestOptimisation: () =>
    apiRequest("/products/optimise-suggestions"),

  // P — HEALTH SCORE
  // GET /products/health-score
  menuHealthScore: () =>
    apiRequest("/products/health-score"),

  // Q — INVENTORY
  // POST /products/inventory/auto-check
  autoStockCheck: () =>
    apiRequest("/products/inventory/auto-check", { method: "POST" }),
  // GET /products/inventory/low-stock
  getLowStockProducts: () =>
    apiRequest("/products/inventory/low-stock"),
  // PATCH /products/:id/stock
  updateStock: (id: string, stock: number) =>
    apiRequest(`/products/${id}/stock`, { method: "PATCH", body: JSON.stringify({ stock }) }),
  // POST /products/inventory/sync
  syncInventory: (items: { id: string; stock: number }[]) =>
    apiRequest("/products/inventory/sync", { method: "POST", body: JSON.stringify(items) }),

  // R — MULTI-OUTLET
  // PATCH /products/:id/outlet
  assignOutlet: (id: string, outletId: string) =>
    apiRequest(`/products/${id}/outlet`, { method: "PATCH", body: JSON.stringify({ outletId }) }),

  // S — PRODUCT PERFORMANCE
  // GET /products/:id/performance
  getProductPerformance: (id: string) =>
    apiRequest(`/products/${id}/performance`),

  // T — TEMPLATE / CLONE
  // POST /products/from-template
  createFromTemplate: (templateId: string) =>
    apiRequest("/products/from-template", { method: "POST", body: JSON.stringify({ templateId }) }),

  // U — MASS ACTION
  // POST /products/bulk/action
  bulkAction: (data: { ids: string[]; action: string; value?: any }) =>
    apiRequest("/products/bulk/action", { method: "POST", body: JSON.stringify(data) }),

  // V — ROLLBACK
  // POST /products/rollback
  rollbackLastUpdate: () =>
    apiRequest("/products/rollback", { method: "POST" }),

  // W — PREVIEW LINK
  // POST /products/preview-link
  generatePreviewLink: () =>
    apiRequest("/products/preview-link", { method: "POST" }),

  // Y — BACKGROUND JOBS
  // POST /products/bulk/background
  startBackgroundBulkJob: (data: any) =>
    apiRequest("/products/bulk/background", { method: "POST", body: JSON.stringify(data) }),

  // Z — INVESTOR DASHBOARD
  // GET /products/investor-dashboard
  getInvestorDashboard: () =>
    apiRequest("/products/investor-dashboard"),
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
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  adminLogin: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),
  
  getProfile: () => apiRequest("/auth/me"),
  
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
