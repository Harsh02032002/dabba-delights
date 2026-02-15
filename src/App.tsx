import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";

// User Pages
import UserHome from "./pages/user/UserHome";
import UserLogin from "./pages/user/UserLogin";
import CartPage from "./pages/user/CartPage";

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
import AdminDisputes from "./pages/admin/AdminDisputes";
import AdminAuditLogs from "./pages/admin/AdminAuditLogs";
import AdminCategories from "./pages/admin/AdminCategories";
import UserWishlist from "./pages/user/UserWishlist";
import NotFound from "./pages/NotFound";
import UserNotifications from "./pages/user/UserNotifications";
import { SocketProvider } from '@/contexts/SocketContext';

const queryClient = new QueryClient();

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
              {/* Seller Routes */}
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/seller/menu" element={<SellerMenu />} />
              <Route path="/seller/orders" element={<SellerOrders />} />
              <Route path="/seller/analytics" element={<SellerAnalytics />} />
              <Route path="/seller/earnings" element={<SellerEarnings />} />
              <Route path="/seller/settlements" element={<SellerSettlements />} />
              <Route path="/seller/kyc" element={<SellerKYC />} />
              <Route path="/seller/profile" element={<SellerProfile />} />
              <Route path="/seller/settings" element={<SellerSettings />} />
              <Route path="/seller/help" element={<SellerHelp />} />
              <Route path="/seller/referrals" element={<SellerReferrals />} />
              <Route path="/seller/promotions" element={<SellerPromotions />} />
              <Route path="/seller/reviews" element={<SellerReviews />} />
              <Route path="/seller/inventory" element={<SellerInventory />} />
              <Route path="/seller/customers" element={<SellerCustomers />} />
              <Route path="/seller/marketing" element={<SellerMarketing />} />
              <Route path="/seller/payouts" element={<SellerPayouts />} />
              <Route path="/seller/performance" element={<SellerPerformanceInsights />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />
              <Route path="/admin/users" element={<AdminUsers />} />
              <Route path="/admin/orders" element={<AdminOrders />} />
              <Route path="/admin/disputes" element={<AdminDisputes />} />
              <Route path="/admin/audit-logs" element={<AdminAuditLogs />} />
              <Route path="/admin/categories" element={<AdminCategories />} />
              <Route path="/admin/settlements" element={<AdminSettlements />} />
              <Route path="/admin/commission" element={<AdminCommission />} />
              <Route path="/admin/gst" element={<AdminGST />} />
              <Route path="/admin/referrals" element={<AdminReferrals />} />
              <Route path="/admin/marketing" element={<AdminMarketing />} />
              <Route path="/admin/analytics" element={<AdminAnalytics />} />
              <Route path="/admin/performance" element={<AdminPerformance />} />
              <Route path="/admin/settings" element={<AdminSettings />} />
              <Route path="/admin/help" element={<AdminHelp />} />

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
