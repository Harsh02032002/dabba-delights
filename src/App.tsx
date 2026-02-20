import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// User Pages
import UserHome from "./pages/user/UserHome";
import UserLogin from "./pages/user/UserLogin";
import CartPage from "./pages/user/CartPage";
import UserWishlist from "./pages/user/UserWishlist";
import UserNotifications from "./pages/user/UserNotifications";
import UserWallet from "./pages/user/UserWallet";
import AllProducts from "./pages/user/AllProducts";
import UserRegister from "./pages/user/UserRegister.tsx";
// Seller Pages
import SellerLogin from "./pages/seller/SellerLogin";
import SellerDashboard from "./pages/seller/SellerDashboard";
import SellerMenu from "./pages/seller/SellerMenu";
import SellerOrders from "./pages/seller/SellerOrders";
import SellerAnalytics from "./pages/seller/SellerAnalytics";
import SellerEarnings from "./pages/seller/SellerEarnings";
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
import SellerRegister from "./pages/seller/SellerRegister.tsx";

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

// Other
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      retry: 1,
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
              {/* User Routes */}
              <Route path="/" element={<UserHome />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/wishlist" element={<UserWishlist />} />
              <Route path="/notifications" element={<UserNotifications />} />
              <Route path="/wallet" element={<UserWallet />} />
              <Route path="/all-products" element={<AllProducts />} />
              <Route path="/register" element={<UserRegister />} />
              {/* Seller Routes */}
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/seller/register" element={<SellerRegister />} />
              <Route path="/seller" element={<ProtectedRoute requiredRole="seller"><SellerDashboard /></ProtectedRoute>} />
              <Route path="/seller/menu" element={<ProtectedRoute requiredRole="seller"><SellerMenu /></ProtectedRoute>} />
              <Route path="/seller/orders" element={<ProtectedRoute requiredRole="seller"><SellerOrders /></ProtectedRoute>} />
              <Route path="/seller/analytics" element={<ProtectedRoute requiredRole="seller"><SellerAnalytics /></ProtectedRoute>} />
              <Route path="/seller/earnings" element={<ProtectedRoute requiredRole="seller"><SellerEarnings /></ProtectedRoute>} />
              <Route path="/seller/settlements" element={<ProtectedRoute requiredRole="seller"><SellerSettlements /></ProtectedRoute>} />
              <Route path="/seller/kyc" element={<ProtectedRoute requiredRole="seller"><SellerKYC /></ProtectedRoute>} />
              <Route path="/seller/profile" element={<ProtectedRoute requiredRole="seller"><SellerProfile /></ProtectedRoute>} />
              <Route path="/seller/settings" element={<ProtectedRoute requiredRole="seller"><SellerSettings /></ProtectedRoute>} />
              <Route path="/seller/help" element={<ProtectedRoute requiredRole="seller"><SellerHelp /></ProtectedRoute>} />
              <Route path="/seller/referrals" element={<ProtectedRoute requiredRole="seller"><SellerReferrals /></ProtectedRoute>} />
              <Route path="/seller/promotions" element={<ProtectedRoute requiredRole="seller"><SellerPromotions /></ProtectedRoute>} />
              <Route path="/seller/reviews" element={<ProtectedRoute requiredRole="seller"><SellerReviews /></ProtectedRoute>} />
              <Route path="/seller/inventory" element={<ProtectedRoute requiredRole="seller"><SellerInventory /></ProtectedRoute>} />
              <Route path="/seller/customers" element={<ProtectedRoute requiredRole="seller"><SellerCustomers /></ProtectedRoute>} />
              <Route path="/seller/marketing" element={<ProtectedRoute requiredRole="seller"><SellerMarketing /></ProtectedRoute>} />
              <Route path="/seller/payouts" element={<ProtectedRoute requiredRole="seller"><SellerPayouts /></ProtectedRoute>} />
              <Route path="/seller/performance" element={<ProtectedRoute requiredRole="seller"><SellerPerformanceInsights /></ProtectedRoute>} />
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
