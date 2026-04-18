import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { RoleGuard } from "@/components/RoleGuard";
import { KYCGate } from "@/components/seller/KYCGate";
import React, { Suspense, lazy } from "react";

// Lazy load components
import LandingPage from "./pages/user/LandingPage";
const UserHome = lazy(() => import("./pages/user/UserHome"));
const SubscriptionPlans = lazy(() => import("./pages/user/SubscriptionPlans"));
const UserLogin = lazy(() => import("./pages/user/UserLogin"));
const UserRegister = lazy(() => import("./pages/user/UserRegister"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ForgotPassword = lazy(() => import("./pages/auth/ForgotPassword"));
const ResendVerificationCode = lazy(() => import("./components/auth/ResendVerificationCode"));
const CartPage = lazy(() => import("./pages/user/CartPage"));
const CheckoutPage = lazy(() => import("./pages/user/CheckoutPage"));
const UserWishlist = lazy(() => import("./pages/user/UserWishlist"));
const UserNotifications = lazy(() => import("./pages/user/UserNotifications"));
const UserWallet = lazy(() => import("./pages/user/UserWallet"));
const AllProducts = lazy(() => import("./pages/user/AllProducts"));
const MyOrders = lazy(() => import("./pages/user/MyOrders"));
const UserSettings = lazy(() => import("./pages/user/UserSettings"));
const SellerDetail = lazy(() => import("./pages/user/SellerDetail"));
const SubscriptionItems = lazy(() => import("./pages/user/SubscriptionItems"));
const UserSubscriptionPlans = lazy(() => import("./pages/user/UserSubscriptionPlans"));
const HelpCenter = lazy(() => import("./pages/user/HelpCenter"));
const ContactUs = lazy(() => import("./pages/user/ContactUs"));

const AboutUs = lazy(() => import("./pages/static/AboutUs"));
const PrivacyPolicy = lazy(() => import("./pages/user/PrivacyPolicy"));
const TermsOfService = lazy(() => import("./pages/user/TermsOfService"));
const RefundPolicy = lazy(() => import("./pages/user/RefundPolicy"));

const SellerLogin = lazy(() => import("./pages/seller/SellerLogin"));
const SellerRegister = lazy(() => import("./pages/seller/SellerRegister"));
const SellerDashboard = lazy(() => import("./pages/seller/SellerDashboard"));
const SellerMenu = lazy(() => import("./pages/seller/SellerMenu"));
const SellerOrders = lazy(() => import("./pages/seller/SellerOrders"));
const SellerAnalytics = lazy(() => import("./pages/seller/SellerAnalytics"));
const SellerEarnings = lazy(() => import("./pages/seller/SellerEarnings"));
const SellerWallet = lazy(() => import("./pages/seller/SellerWallet"));
const SellerSettlements = lazy(() => import("./pages/seller/SellerSettlements"));
const SellerKYC = lazy(() => import("./pages/seller/SellerKYC"));
const SellerProfile = lazy(() => import("./pages/seller/SellerProfile"));
const SellerSettings = lazy(() => import("./pages/seller/SellerSettings"));
const SellerHelp = lazy(() => import("./pages/seller/SellerHelp"));
const SellerReferrals = lazy(() => import("./pages/seller/SellerReferrals"));
const SellerPromotions = lazy(() => import("./pages/seller/SellerPromotions"));
const SellerReviews = lazy(() => import("./pages/seller/SellerReviews"));
const SellerInventory = lazy(() => import("./pages/seller/SellerInventory"));
const SellerCustomers = lazy(() => import("./pages/seller/SellerCustomers"));
const SellerMarketing = lazy(() => import("./pages/seller/SellerMarketing"));
const SellerPayouts = lazy(() => import("./pages/seller/SellerPayouts"));
const SellerPerformanceInsights = lazy(() => import("./pages/seller/SellerPerformanceInsights"));
const SellerGST = lazy(() => import("./pages/seller/SellerGST"));
const SellerRecycleBin = lazy(() => import("./pages/seller/SellerRecycleBin"));

const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminSellers = lazy(() => import("./pages/admin/AdminSellers"));
const AdminUsers = lazy(() => import("./pages/admin/AdminUsers"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminSettlements = lazy(() => import("./pages/admin/AdminSettlements"));
const AdminCommission = lazy(() => import("./pages/admin/AdminCommission"));
const AdminGST = lazy(() => import("./pages/admin/AdminGST"));
const AdminReferrals = lazy(() => import("./pages/admin/AdminReferrals"));
const AdminMarketing = lazy(() => import("./pages/admin/AdminMarketing"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminPerformance = lazy(() => import("./pages/admin/AdminPerformance"));
const AdminSettings = lazy(() => import("./pages/admin/AdminSettings"));
const AdminHelp = lazy(() => import("./pages/admin/AdminHelp"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminDisputes = lazy(() => import("./pages/admin/AdminDisputes"));
const AdminAuditLogs = lazy(() => import("./pages/admin/AdminAuditLogs"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminWarehouses = lazy(() => import("./pages/admin/AdminWarehouses"));
const AdminDeliveryPartners = lazy(() => import("./pages/admin/AdminDeliveryPartners"));
const AdminDeliveryPayConfig = lazy(() => import("./pages/admin/AdminDeliveryPayConfig"));
const AdminWallet = lazy(() => import("./pages/admin/AdminWallet"));
const AdminSubscriptions = lazy(() => import("./pages/admin/AdminSubscriptions"));
const CategoryManagement = lazy(() => import("./pages/admin/CategoryManagement"));
const FoodItemsManagement = lazy(() => import("./pages/admin/FoodItemsManagement"));

const UserSubscription = lazy(() => import("./pages/user/UserSubscription"));
const NotFound = lazy(() => import("./pages/NotFound"));

const LoadingFallback = () => (
  <div className="flex items-center justify-center min-h-screen bg-background">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
  </div>
);


export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Reduced stale time for faster updates
      staleTime: 30 * 1000, // 30 seconds instead of 5 minutes
      gcTime: 5 * 60 * 1000, // 5 minutes garbage collection
      // Faster refetching strategy
      refetchOnWindowFocus: true,
      refetchOnMount: true,
      refetchOnReconnect: true,
      // Retry configuration
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 3000),
      // Enable network mode for offline support
      networkMode: 'online',
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
      networkMode: 'online',
    },
  },
});

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <SocketProvider>
          <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Suspense fallback={<LoadingFallback />}>
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<UserLogin />} />
                <Route path="/register" element={<UserRegister />} />
                <Route path="/verify-email" element={<VerifyEmail />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/resend-verification" element={<ResendVerificationCode />} />

                {/* User Routes - Protected for users only */}
                <Route path="/home" element={<RoleGuard allowedRole="user"><UserHome /></RoleGuard>} />
                <Route path="/subscription-plans" element={<RoleGuard allowedRole="user"><SubscriptionPlans /></RoleGuard>} />
                <Route path="/cart" element={<RoleGuard allowedRole="user"><CartPage /></RoleGuard>} />
                <Route path="/checkout" element={<RoleGuard allowedRole="user"><CheckoutPage /></RoleGuard>} />
                <Route path="/wishlist" element={<RoleGuard allowedRole="user"><UserWishlist /></RoleGuard>} />
                <Route path="/notifications" element={<RoleGuard allowedRole="user"><UserNotifications /></RoleGuard>} />
                <Route path="/wallet" element={<RoleGuard allowedRole="user"><UserWallet /></RoleGuard>} />
                <Route path="/all-products" element={<RoleGuard allowedRole="user"><AllProducts /></RoleGuard>} />
                <Route path="/orders" element={<RoleGuard allowedRole="user"><MyOrders /></RoleGuard>} />
                <Route path="/subscriptions" element={<RoleGuard allowedRole="user"><UserSubscription /></RoleGuard>} />
                <Route path="/subscription-items" element={<ProtectedRoute><SubscriptionItems /></ProtectedRoute>} />
                <Route path="/subscription-plans" element={<ProtectedRoute><UserSubscriptionPlans /></ProtectedRoute>} />
                <Route path="/settings" element={<RoleGuard allowedRole="user"><UserSettings /></RoleGuard>} />
                <Route path="/seller/:id" element={<RoleGuard allowedRole="user"><SellerDetail /></RoleGuard>} />

                {/* Static Pages */}
                <Route path="/about" element={<AboutUs />} />
                <Route path="/help" element={<HelpCenter />} />
                <Route path="/contact" element={<ContactUs />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/privacy-policy" element={<PrivacyPolicy />} />
                <Route path="/terms" element={<TermsOfService />} />
                <Route path="/terms-of-service" element={<TermsOfService />} />
                <Route path="/refund" element={<RefundPolicy />} />
                <Route path="/refund-policy" element={<RefundPolicy />} />

                {/* Seller Routes */}
                <Route path="/seller/login" element={<SellerLogin />} />
                <Route path="/seller/register" element={<SellerRegister />} />
                <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerDashboard /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/menu" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerMenu /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerOrders /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/analytics" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerAnalytics /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/earnings" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerEarnings /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/wallet" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerWallet /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/settlements" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerSettlements /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/kyc" element={<ProtectedRoute requiredRole="seller"><SellerKYC /></ProtectedRoute>} />
                <Route path="/seller/profile" element={<ProtectedRoute requiredRole="seller"><SellerProfile /></ProtectedRoute>} />
                <Route path="/seller/settings" element={<ProtectedRoute requiredRole="seller"><SellerSettings /></ProtectedRoute>} />
                <Route path="/seller/help" element={<ProtectedRoute requiredRole="seller"><SellerHelp /></ProtectedRoute>} />
                <Route path="/seller/referrals" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerReferrals /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/promotions" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerPromotions /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/reviews" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerReviews /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/inventory" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerInventory /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/customers" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerCustomers /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/marketing" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerMarketing /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/payouts" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerPayouts /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/performance" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerPerformanceInsights /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/gst" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerGST /></KYCGate></ProtectedRoute>} />
                <Route path="/seller/recycle-bin" element={<ProtectedRoute requiredRole="seller"><KYCGate><SellerRecycleBin /></KYCGate></ProtectedRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
                <Route path="/admin/sellers" element={<ProtectedRoute requiredRole="admin"><AdminSellers /></ProtectedRoute>} />
                <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><AdminUsers /></ProtectedRoute>} />
                <Route path="/admin/orders" element={<ProtectedRoute requiredRole="admin"><AdminOrders /></ProtectedRoute>} />
                <Route path="/admin/disputes" element={<ProtectedRoute requiredRole="admin"><AdminDisputes /></ProtectedRoute>} />
                <Route path="/admin/audit-logs" element={<ProtectedRoute requiredRole="admin"><AdminAuditLogs /></ProtectedRoute>} />
                <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><AdminCategories /></ProtectedRoute>} />
                <Route path="/admin/settlements" element={<ProtectedRoute requiredRole="admin"><AdminSettlements /></ProtectedRoute>} />
                <Route path="/admin/commission" element={<ProtectedRoute requiredRole="admin"><AdminCommission /></ProtectedRoute>} />
                <Route path="/admin/gst" element={<ProtectedRoute requiredRole="admin"><AdminGST /></ProtectedRoute>} />
                <Route path="/admin/referrals" element={<ProtectedRoute requiredRole="admin"><AdminReferrals /></ProtectedRoute>} />
                <Route path="/admin/marketing" element={<ProtectedRoute requiredRole="admin"><AdminMarketing /></ProtectedRoute>} />
                <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><AdminAnalytics /></ProtectedRoute>} />
                <Route path="/admin/performance" element={<ProtectedRoute requiredRole="admin"><AdminPerformance /></ProtectedRoute>} />
                <Route path="/admin/settings" element={<ProtectedRoute requiredRole="admin"><AdminSettings /></ProtectedRoute>} />
                <Route path="/admin/help" element={<ProtectedRoute requiredRole="admin"><AdminHelp /></ProtectedRoute>} />
                <Route path="/admin/products" element={<ProtectedRoute requiredRole="admin"><AdminProducts /></ProtectedRoute>} />
                <Route path="/admin/warehouses" element={<ProtectedRoute requiredRole="admin"><AdminWarehouses /></ProtectedRoute>} />
                <Route path="/admin/delivery-partners" element={<ProtectedRoute requiredRole="admin"><AdminDeliveryPartners /></ProtectedRoute>} />
                <Route path="/admin/delivery-pay-config" element={<ProtectedRoute requiredRole="admin"><AdminDeliveryPayConfig /></ProtectedRoute>} />
                <Route path="/admin/wallet" element={<ProtectedRoute requiredRole="admin"><AdminWallet /></ProtectedRoute>} />
                <Route path="/admin/subscriptions" element={<ProtectedRoute requiredRole="admin"><AdminSubscriptions /></ProtectedRoute>} />
                <Route path="/admin/category-management" element={<ProtectedRoute requiredRole="admin"><CategoryManagement /></ProtectedRoute>} />
                <Route path="/admin/food-items" element={<ProtectedRoute requiredRole="admin"><FoodItemsManagement /></ProtectedRoute>} />

                {/* Catch-all */}
                <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </TooltipProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
