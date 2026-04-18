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
// User Pages
import LandingPage from "./pages/user/LandingPage";
import UserHome from "./pages/user/UserHome";
import SubscriptionPlans from "./pages/user/SubscriptionPlans";
import UserLogin from "./pages/user/UserLogin";
import UserRegister from "./pages/user/UserRegister";
import VerifyEmail from "./pages/auth/VerifyEmail";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResendVerificationCode from "./components/auth/ResendVerificationCode";
import CartPage from "./pages/user/CartPage";
import CheckoutPage from "./pages/user/CheckoutPage";
import UserWishlist from "./pages/user/UserWishlist";
import UserNotifications from "./pages/user/UserNotifications";
import UserWallet from "./pages/user/UserWallet";
import AllProducts from "./pages/user/AllProducts";
import MyOrders from "./pages/user/MyOrders";
import UserSettings from "./pages/user/UserSettings";
import SellerDetail from "./pages/user/SellerDetail";
import SubscriptionItems from "./pages/user/SubscriptionItems";
import UserSubscriptionPlans from "./pages/user/UserSubscriptionPlans";
import HelpCenter from "./pages/user/HelpCenter";
import ContactUs from "./pages/user/ContactUs";

// Static Pages
import AboutUs from "./pages/static/AboutUs";
import PrivacyPolicy from "./pages/user/PrivacyPolicy";
import TermsOfService from "./pages/user/TermsOfService";
import RefundPolicy from "./pages/user/RefundPolicy";

// Seller Pages
import SellerLogin from "./pages/seller/SellerLogin";
import SellerRegister from "./pages/seller/SellerRegister";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerMenu from "./pages/seller/SellerMenu";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerEarnings from "./pages/seller/SellerEarnings";
import SellerWallet from "./pages/seller/SellerWallet";
import SellerSettlements from "./pages/seller/SellerSettlements";
import SellerKYC from "./pages/seller/SellerKYC";
import SellerProfile from "./pages/seller/SellerProfile";
import SellerSettings from "./pages/seller/SellerSettings";
import SellerHelp from "./pages/seller/SellerHelp";
import SellerReferrals from "./pages/seller/SellerReferrals";
import SellerPromotions from "./pages/seller/SellerPromotions";
import SellerReviews from "./pages/seller/SellerReviews";
import SellerInventory from "./pages/seller/SellerInventory";
import SellerCustomers from "./pages/seller/SellerCustomers";
import SellerMarketing from "./pages/seller/SellerMarketing";
import SellerPayouts from "./pages/seller/SellerPayouts";
import SellerPerformanceInsights from "./pages/seller/SellerPerformanceInsights";
import SellerGST from "./pages/seller/SellerGST";
import SellerRecycleBin from "./pages/seller/SellerRecycleBin";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSellers from "./pages/admin/AdminSellers";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminSettlements from "./pages/admin/AdminSettlements";
import AdminCommission from "./pages/admin/AdminCommission";
import AdminGST from "./pages/admin/AdminGST";
import AdminReferrals from "./pages/admin/AdminReferrals";
import AdminMarketing from "./pages/admin/AdminMarketing";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AdminPerformance from "./pages/admin/AdminPerformance";
import AdminSettings from "./pages/admin/AdminSettings";
import AdminHelp from "./pages/admin/AdminHelp";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminWarehouses from "./pages/admin/AdminWarehouses";
import AdminDeliveryPartners from "./pages/admin/AdminDeliveryPartners";
import AdminDeliveryPayConfig from "./pages/admin/AdminDeliveryPayConfig";
import AdminWallet from "./pages/admin/AdminWallet";
import AdminSubscriptions from "./pages/admin/AdminSubscriptions";
import CategoryManagement from "./pages/admin/CategoryManagement";
import FoodItemsManagement from "./pages/admin/FoodItemsManagement";

// User Subscription Page
import UserSubscription from "./pages/user/UserSubscription";

// Other
import NotFound from "./pages/NotFound";

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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
          </TooltipProvider>
        </SocketProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
