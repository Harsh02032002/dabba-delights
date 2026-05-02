// ============================================
// Dabba Nation - Centralized API Service (Optimized)
// ============================================
const API_BASE_URL =
  import.meta.env.VITE_API_URL || 
  (typeof window !== 'undefined' ? `${window.location.protocol}//${window.location.hostname}:5000/api` : "http://localhost:5000/api");

// Helper to get full image URL
export const getImageUrl = (path: string | undefined): string => {
  if (!path || path === '/placeholder.svg') return '/placeholder.svg';
  if (path.startsWith('http') || path.startsWith('data:') || path.startsWith('blob:')) return path;
  
  // If it's already a local frontend asset path, don't prepend backend URL
  if (path.startsWith('/src') || path.startsWith('/assets') || path.startsWith('/images') || path.startsWith('@/')) {
    return path;
  }

  const baseUrl = API_BASE_URL.replace('/api', '');
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${baseUrl}${cleanPath}`;
};

// Request timeout in milliseconds
const REQUEST_TIMEOUT = 10000; // 10 seconds

// Helper to add timeout to fetch
async function fetchWithTimeout(url: string, options: RequestInit, timeout = REQUEST_TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error('Request timed out. Please check your connection.');
    }
    throw error;
  }
}

/** Customer restaurant URL is /seller/:mongoId — must use userToken, not sellerToken */
function isSellerPanelPath(path: string): boolean {
  if (!path.startsWith('/seller')) return false;
  if (path === '/seller/login' || path === '/seller/register') return true;
  const rest = path.replace(/^\/seller\/?/, '');
  if (!rest) return true;
  const first = rest.split('/')[0] ?? '';
  if (/^[a-f\d]{24}$/i.test(first)) return false;
  return true;
}

// Helper to get the correct token based on current URL path
function getTokenForCurrentRole(): string | null {
  if (typeof window === 'undefined') return localStorage.getItem('userToken') || localStorage.getItem('token');
  
  const path = window.location.pathname;
  
  if (path.startsWith('/admin')) {
    return localStorage.getItem('adminToken');
  }
  
  if (path.startsWith('/seller') && isSellerPanelPath(path)) {
    return localStorage.getItem('sellerToken');
  }
  
  if (path.startsWith('/delivery')) {
    return localStorage.getItem('deliveryToken');
  }
  
  return localStorage.getItem('userToken') || localStorage.getItem('token');
}

type ApiRequestOptions = RequestInit & { authToken?: string | null };

async function apiRequest<T = any>(
  endpoint: string,
  options: ApiRequestOptions = {},
): Promise<T> {
  const { authToken, ...fetchOptions } = options;
  const token =
    authToken === null
      ? null
      : authToken !== undefined
        ? authToken
        : getTokenForCurrentRole();
  
  // Check if body is FormData - don't set Content-Type for FormData
  const isFormData = fetchOptions.body instanceof FormData;
  
  const headers: HeadersInit = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(token && { Authorization: `Bearer ${token}` }),
    ...fetchOptions.headers,
  };
  
  const startTime = performance.now();
  
  try {
    const response = await fetchWithTimeout(`${API_BASE_URL}${endpoint}`, {
      ...fetchOptions,
      headers,
    });
    
    const duration = performance.now() - startTime;
    console.log(`[API] ${endpoint} - ${duration.toFixed(0)}ms`);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).message || `API request failed: ${response.status}`);
    }
    
    return response.json();
  } catch (error: any) {
    const duration = performance.now() - startTime;
    console.error(`[API Error] ${endpoint} - ${duration.toFixed(0)}ms - ${error.message}`);
    throw error;
  }
}

async function apiUpload<T = any>(
  endpoint: string,
  formData: FormData,
  method = "POST",
  timeout = 30000,
  authToken?: string | null,
): Promise<T> {
  const token =
    authToken === null
      ? null
      : authToken !== undefined
        ? authToken
        : getTokenForCurrentRole();
  const headers: HeadersInit = {
    ...(token && { Authorization: `Bearer ${token}` }),
  };
  
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      body: formData,
      headers,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error((error as any).message || "API upload failed");
    }
    return response.json();
  } catch (error: any) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Upload timed out. Please try again.');
    }
    throw error;
  }
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
  getProducts: (
    params?: Record<string, unknown> & {
      pendingApproval?: boolean;
      approvedOnly?: boolean;
    },
  ) => apiRequest(`/products${toQuery(params)}`),
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

  // O — ADMIN APPROVAL (using /admin prefix)
  // PATCH /admin/products/:id/approve
  approveProduct: (id: string) =>
    apiRequest(`/admin/products/${id}/approve`, { method: "PATCH" }),
  // PATCH /admin/products/:id/reject
  rejectProduct: (id: string, reason?: string) =>
    apiRequest(`/admin/products/${id}/reject`, { method: "PATCH", body: JSON.stringify({ reason }) }),
  // POST /admin/products/bulk-approve
  bulkApproveProducts: (ids: string[]) =>
    apiRequest("/admin/products/bulk-approve", { method: "POST", body: JSON.stringify({ ids }) }),

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
  bulkUpdateOrderStatus: (ids: string[], status: string) =>
    apiRequest(`/seller/orders/bulk/status`, { method: "PATCH", body: JSON.stringify({ ids, status }) }),
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
  getSubscriptions: () => apiRequest("/seller/subscriptions"),
  getSubscriptionUsage: () => apiRequest("/seller/subscriptions/usage"),
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
  
  // GST
  getGSTReport: (period?: string) =>
    apiRequest(`/seller/gst/reports${period ? `?period=${period}` : ""}`),
  
  // Image Helper
  getImageUrl: (path: string | undefined) => getImageUrl(path),
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
  createSeller: (data: Record<string, unknown>) =>
    apiRequest("/admin/sellers", { method: "POST", body: JSON.stringify(data) }),
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
  getGSTSettingsDoc: () => apiRequest("/admin/gst/settings"),
  saveGSTSettingsDoc: (data: Record<string, unknown>) =>
    apiRequest("/admin/gst", { method: "POST", body: JSON.stringify(data) }),
  getSubscriptionReports: () => apiRequest("/admin/subscriptions"),
  getSubscriptionUsageReports: () => apiRequest("/admin/subscriptions/usage"),
  getSubscriptionPlans: () => apiRequest("/subscriptions/admin/plans"),
  approveMenuProduct: (id: string) =>
    apiRequest(`/admin/products/${id}/approve`, { method: "PATCH" }),
  rejectMenuProduct: (id: string, reason?: string) =>
    apiRequest(`/admin/products/${id}/reject`, {
      method: "PATCH",
      body: JSON.stringify({ reason: reason || "" }),
    }),
  bulkApproveMenuProducts: (ids: string[]) =>
    apiRequest("/admin/products/bulk-approve", {
      method: "POST",
      body: JSON.stringify({ ids }),
    }),
  getGSTReports: (period?: string) =>
    apiRequest(`/admin/gst/reports${period ? `?period=${period}` : ""}`),
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
  deleteSeller: (id: string) =>
    apiRequest(`/admin/sellers/${id}`, { method: "DELETE" }),
  deleteUser: (id: string) =>
    apiRequest(`/admin/users/${id}`, { method: "DELETE" }),
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
  getActiveSubscription: () => apiRequest("/user/subscriptions/active"),
  purchaseSubscription: (totalAmount: number, totalDays: number) =>
    apiRequest("/user/subscriptions/purchase", {
      method: "POST",
      body: JSON.stringify({ totalAmount, totalDays }),
    }),
  verifySubscriptionPayment: (paymentData: any) =>
    apiRequest("/user/subscriptions/verify-payment", {
      method: "POST",
      body: JSON.stringify(paymentData),
    }),
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
  deleteOrder: (id: string) =>
    apiRequest(`/user/orders/${id}/delete`, { method: "DELETE" }),
  cancelOrder: (id: string) =>
    apiRequest(`/user/orders/${id}/cancel`, { method: "POST" }),
  rateOrder: (id: string, rating: number, review?: string) =>
    apiRequest(`/user/orders/${id}/rate`, { method: "POST", body: JSON.stringify({ rating, review }) }),
  rateMenuItem: (menuItemId: string, rating: number) =>
    apiRequest(`/user/menu/${menuItemId}/rate`, { method: "POST", body: JSON.stringify({ rating }) }),
  rateSeller: (sellerId: string, rating: number) =>
    apiRequest(`/user/sellers/${sellerId}/rate`, { method: "POST", body: JSON.stringify({ rating }) }),
  getSellerRatingBreakdown: (sellerId: string) =>
    apiRequest(`/user/sellers/${sellerId}/rating-breakdown`),
  downloadInvoice: (orderId: string) => {
    const token = getTokenForCurrentRole();
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
  getSubscriptionPlans: () => apiRequest("/subscriptions/plans"),
  getImageUrl: (path: string | undefined) => getImageUrl(path),
};

const authAPI = {
  login: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      authToken: null,
    }),
  
  sellerLogin: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      authToken: null,
    }),
  
  adminLogin: (email: string, password: string) =>
    apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      authToken: null,
    }),
  
  getProfile: () => apiRequest("/auth/me"),

  /** Use when loading a stored session so the request always uses that role's JWT (not pathname). */
  getProfileWithToken: (token: string) =>
    apiRequest("/auth/me", { authToken: token }),
  
  getSellerProfile: () => apiRequest("/auth/me"),
  
  getAdminProfile: () => apiRequest("/auth/me"),
  
  updateProfile: (data: Record<string, unknown>) =>
    apiRequest("/auth/profile", { method: "PUT", body: JSON.stringify(data) }),
  
  register: (data: Record<string, unknown>) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
      authToken: null,
    }),

  verifyEmail: (email: string, code: string) =>
    apiRequest("/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({ email, code }),
      authToken: null,
    }),

  forgotPassword: (email: string) =>
    apiRequest("/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      authToken: null,
    }),

  resetPassword: (email: string, code: string, newPassword: string) =>
    apiRequest("/auth/reset-password", {
      method: "POST",
      body: JSON.stringify({ email, code, newPassword }),
      authToken: null,
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
  
  getImageUrl: (path: string | undefined) => getImageUrl(path),
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

/** GST rates for checkout (no admin login required) */
export function fetchPublicGSTSettings() {
  return apiRequest<{ success: boolean; data: Record<string, unknown> }>("/public/gst-settings", {
    authToken: null,
  });
}

export function fetchPublicPlatformConfig() {
  return apiRequest("/public/platform-config", { authToken: null });
}

export { apiRequest, apiUpload, API_BASE_URL, authAPI };
