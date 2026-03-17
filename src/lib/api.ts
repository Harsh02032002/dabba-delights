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

  // I — ARCHIVE / DELETE / RECYCLE BIN
  // PATCH /products/:id/archive
  archiveProduct: (id: string) =>
    apiRequest(`/products/${id}/archive`, { method: "PATCH" }),
  // PATCH /products/:id/restore
  restoreProduct: (id: string) =>
    apiRequest(`/products/${id}/restore`, { method: "PATCH" }),
  // GET /products/recycle-bin
  getRecycleBin: () =>
    apiRequest("/products/recycle-bin"),
  // DELETE /products/recycle-bin/empty
  emptyRecycleBin: () =>
    apiRequest("/products/recycle-bin/empty", { method: "DELETE" }),
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
  deleteKYCDocument: (docType: string) =>
    apiRequest(`/seller/kyc/document/${docType}`, { method: "DELETE" }),
  updateKYCDocument: (docType: string, formData: FormData) =>
    apiUpload(`/seller/kyc/document/${docType}`, formData, "PUT"),
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

  // Profile image uploads
  uploadLogo: (formData: FormData) =>
    apiUpload("/seller/profile/logo", formData),
  
  uploadCoverImage: (formData: FormData) =>
    apiUpload("/seller/profile/cover", formData),
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
  // Warehouse & Delivery Management
  getDeliveryDashboard: () => apiRequest("/admin/delivery-dashboard"),
  getWarehouses: (params?: Record<string, unknown>) =>
    apiRequest(`/admin/warehouses${toQuery(params)}`),
  getWarehouseById: (id: string) => apiRequest(`/admin/warehouses/${id}`),
  createWarehouse: (data: Record<string, unknown>) =>
    apiRequest("/admin/warehouses", { method: "POST", body: JSON.stringify(data) }),
  updateWarehouse: (id: string, data: Record<string, unknown>) =>
    apiRequest(`/admin/warehouses/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteWarehouse: (id: string) =>
    apiRequest(`/admin/warehouses/${id}`, { method: "DELETE" }),
  toggleWarehouseStatus: (id: string) =>
    apiRequest(`/admin/warehouses/${id}/toggle`, { method: "PATCH" }),
  mapSellerToWarehouse: (warehouseId: string, sellerId: string) =>
    apiRequest(`/admin/warehouses/${warehouseId}/map-seller`, { method: "POST", body: JSON.stringify({ sellerId }) }),
  unmapSellerFromWarehouse: (warehouseId: string, sellerId: string) =>
    apiRequest(`/admin/warehouses/${warehouseId}/unmap-seller/${sellerId}`, { method: "DELETE" }),
  getDeliveryPartners: (params?: Record<string, unknown>) =>
    apiRequest(`/admin/partners${toQuery(params)}`),
  getDeliveryPartnerById: (id: string) => apiRequest(`/admin/partners/${id}`),
  approveDeliveryPartner: (id: string) =>
    apiRequest(`/admin/partners/${id}/approve`, { method: "POST" }),
  rejectDeliveryPartner: (id: string, reason?: string) =>
    apiRequest(`/admin/partners/${id}/reject`, { method: "POST", body: JSON.stringify({ reason }) }),
  assignPartnerToWarehouse: (partnerId: string, warehouseId: string) =>
    apiRequest(`/admin/partners/${partnerId}/assign-warehouse`, { method: "POST", body: JSON.stringify({ warehouseId }) }),
  getDeliveryPayConfig: () => apiRequest("/admin/pay-config"),
  updateDeliveryPayConfig: (data: Record<string, unknown>) =>
    apiRequest("/admin/pay-config", { method: "PUT", body: JSON.stringify(data) }),
  getDeliverySettlements: (status?: string) =>
    apiRequest(`/admin/settlements${status ? `?status=${status}` : ""}`),
  processDeliverySettlement: (id: string) =>
    apiRequest(`/admin/settlements/${id}/process`, { method: "POST" }),
};

// USER / CUSTOMER APIs
export const userAPI = {
  getSellers: async (params?: Record<string, unknown>) => {
    const res = await apiRequest<any>(`/user/sellers${toQuery(params)}`);
    // Normalize: always return { sellers: [], ...rest }
    const sellers = Array.isArray(res) ? res : Array.isArray(res?.sellers) ? res.sellers : Array.isArray(res?.data) ? res.data : [];
    return { sellers, total: res?.total || sellers.length, success: true };
  },
  getHomeChefs: async (params?: Record<string, unknown>) => {
    const res = await apiRequest<any>(`/user/sellers${toQuery(params)}`);
    const sellers = Array.isArray(res) ? res : Array.isArray(res?.sellers) ? res.sellers : Array.isArray(res?.data) ? res.data : [];
    // Filter only home chefs
    const homeChefs = sellers.filter(seller => seller.type === 'home-chef');
    return { sellers: homeChefs, total: homeChefs.length, success: true };
  },
  getRestaurants: async (params?: Record<string, unknown>) => {
    const res = await apiRequest<any>(`/user/sellers${toQuery(params)}`);
    const sellers = Array.isArray(res) ? res : Array.isArray(res?.sellers) ? res.sellers : Array.isArray(res?.data) ? res.data : [];
    // Filter only restaurants
    const restaurants = sellers.filter(seller => seller.type === 'restaurant');
    return { sellers: restaurants, total: restaurants.length, success: true };
  },
  getMenuItems: async (params?: Record<string, unknown>) => {
    const res = await apiRequest<any>(`/user/menu${toQuery(params)}`);
    // Normalize: always return { products: [], ...rest }
    const products = Array.isArray(res) ? res : Array.isArray(res?.products) ? res.products : Array.isArray(res?.data) ? res.data : Array.isArray(res?.menu) ? res.menu : [];
    return { products, total: res?.total || products.length, page: res?.page, limit: res?.limit, success: true };
  },
  getRecommendations: () => apiRequest("/user/recommendations"),
  getCart: () => apiRequest("/user/cart"),
  addToCart: (data: Record<string, unknown>) =>
    apiRequest("/user/cart/add", { method: "POST", body: JSON.stringify(data) }),
  updateQuantity: (itemId: string, quantity: number) =>
    apiRequest("/user/cart/update", { method: "PATCH", body: JSON.stringify({ itemId, quantity }) }),
  removeFromCart: (itemId: string) =>
    apiRequest(`/user/cart/remove/${itemId}`, { method: "DELETE" }),
  // Wallet
  getWalletTransactions: () => apiRequest("/user/wallet/transactions"),
  topupWallet: (amount: number) =>
    apiRequest("/user/wallet/topup", { method: "POST", body: JSON.stringify({ amount }) }),
  verifyPayment: (data: Record<string, unknown>) =>
    apiRequest("/user/wallet/verify", { method: "POST", body: JSON.stringify(data) }),
  placeOrder: (data: Record<string, unknown>) =>
    apiRequest("/user/orders/place", { method: "POST", body: JSON.stringify(data) }),
  getOrders: (status?: string) =>
    apiRequest(`/user/orders${status ? `?status=${status}` : ""}`),
  getOrderById: (id: string) =>
    apiRequest(`/user/orders/${id}`),
  cancelOrder: (id: string) =>
    apiRequest(`/user/orders/${id}/cancel`, { method: "POST" }),
  deleteOrder: (id: string) =>
    apiRequest(`/user/orders/${id}/delete`, { method: "DELETE" }),
  rateOrder: (id: string, rating: number, review?: string) =>
    apiRequest(`/user/orders/${id}/rate`, { method: "POST", body: JSON.stringify({ rating, review }) }),
  rateMenuItem: (menuItemId: string, rating: number) =>
    apiRequest(`/user/menu/${menuItemId}/rate`, { method: "POST", body: JSON.stringify({ rating }) }),
  rateSeller: (sellerId: string, rating: number) =>
    apiRequest(`/user/sellers/${sellerId}/rate`, { method: "POST", body: JSON.stringify({ rating }) }),
  getSellerRatingBreakdown: (sellerId: string) =>
    apiRequest(`/user/sellers/${sellerId}/rating-breakdown`),
  cancelOrder: (orderId: string) =>
    apiRequest(`/user/orders/${orderId}/cancel`, { method: "POST" }),
  downloadInvoice: (orderId: string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found for invoice download");
      return;
    }
    // Properly encode the token for URL
    const encodedToken = encodeURIComponent(token);
    const invoiceUrl = `${API_BASE_URL}/invoice/download/${orderId}?token=${encodedToken}`;
    console.log("Downloading invoice from:", invoiceUrl);
    window.open(invoiceUrl, '_blank');
  },
  generateInvoice: (orderId: string) =>
    apiRequest(`/invoice/generate/${orderId}`, { method: "POST" }),
  addToWishlist: (productId: string) =>
    apiRequest("/user/wishlist/add", { method: "POST", body: JSON.stringify({ productId }) }),
  removeFromWishlist: (productId: string) =>
    apiRequest(`/user/wishlist/remove/${productId}`, { method: "DELETE" }),
  getWishlist: () => apiRequest("/user/wishlist"),
  getNotifications: () => apiRequest("/user/notifications"),
  markNotificationRead: (id: string) => apiRequest(`/user/notifications/${id}/read`, { method: 'PATCH' }),
  markAllNotificationsRead: () => apiRequest('/user/notifications/mark-all-read', { method: 'PATCH' }),
  deleteNotification: (id: string) => apiRequest(`/user/notifications/${id}`, { method: 'DELETE' }),
  getActiveBanners: () => apiRequest("/user/banners"),
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

  verifyEmail: (email: string, code: string) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
    }),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    apiRequest("/auth/change-password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
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

  // Profile image uploads
  uploadAvatar: (formData: FormData) =>
    apiUpload("/auth/profile/avatar", formData),
  
  uploadBanner: (formData: FormData) =>
    apiUpload("/auth/profile/banner", formData),
};

export const paymentAPI = {
  createRazorpayOrder: (data: Record<string, any>) =>
    apiRequest<any>("/payment/razorpay/create-order", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  verifyRazorpayPayment: (data: Record<string, any>) =>
    apiRequest<any>("/payment/razorpay/verify", {
      method: "POST",
      body: JSON.stringify(data),
    }),
  createStripeIntent: (data: Record<string, any>) =>
    apiRequest<any>("/payment/stripe/create-intent", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

export const deliveryAPI = {
  // Authentication
  login: (credentials: { email: string; password: string }) =>
    apiRequest<any>("/delivery/login", {
      method: "POST",
      body: JSON.stringify(credentials),
    }),

  // Location Management
  updateLocation: (location: { latitude: number; longitude: number; address?: string }) =>
    apiRequest<any>("/delivery/location", {
      method: "PATCH",
      body: JSON.stringify(location),
    }),

  updateDeliveryLocation: (location: { latitude: number; longitude: number }) =>
    apiRequest<any>("/delivery/location-update", {
      method: "POST",
      body: JSON.stringify(location),
    }),

  // Order Management
  getActiveOrders: () =>
    apiRequest<any>("/delivery/orders/active"),

  acceptOrder: (orderId: string) =>
    apiRequest<any>(`/delivery/orders/${orderId}/accept`, {
      method: "POST",
    }),

  rejectOrder: (orderId: string) =>
    apiRequest<any>(`/delivery/orders/${orderId}/reject`, {
      method: "POST",
    }),

  updateDeliveryStatus: (orderId: string, data: { status: string; location?: { lat: number; lng: number } }) =>
    apiRequest<any>(`/delivery/orders/${orderId}/status`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Earnings & Wallet
  getEarnings: () =>
    apiRequest<any>("/delivery/earnings"),

  getWalletTransactions: () =>
    apiRequest<any>("/delivery/wallet/transactions"),

  withdrawFromWallet: (amount: number) =>
    apiRequest<any>("/delivery/wallet/withdraw", {
      method: "POST",
      body: JSON.stringify({ amount }),
    }),

  // Profile Management
  getPartnerProfile: () =>
    apiRequest<any>("/delivery/profile"),

  getOrderHistory: () =>
    apiRequest<any>("/delivery/order-history"),

  // Availability
  goOnline: () =>
    apiRequest<any>("/delivery/go-online", {
      method: "PATCH",
    }),

  goOffline: () =>
    apiRequest<any>("/delivery/go-offline", {
      method: "PATCH",
    }),

  toggleOnline: (isOnline: boolean) =>
    apiRequest<any>(`/delivery/toggle-online`, {
      method: "PUT",
      body: JSON.stringify({ isOnline }),
    }),
};

export { apiRequest, apiUpload, API_BASE_URL, authAPI };
