import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { SocketProvider } from "@/contexts/SocketContext";

// User Pages
import UserHome from "./pages/user/UserHome";
import UserLogin from "./pages/user/UserLogin";
import CartPage from "./pages/user/CartPage";
import UserWishlist from "./pages/user/UserWishlist";
import UserNotifications from "./pages/user/UserNotifications";
import UserRegister from "./pages/user/UserRegister"; // Added

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
import SellerRegister from "./pages/seller/SellerRegister"; // Added

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

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <SocketProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <AppRoutes />
              </BrowserRouter>
            </TooltipProvider>
          </SocketProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

// Protected Routes Logic
function AppRoutes() {
  const { isLoggedIn, user } = useAuth();

  // Seller Protected Wrapper
  const SellerProtected = ({ children }: { children: JSX.Element }) => {
    if (!isLoggedIn) return <Navigate to="/seller/login" replace />;
    if (user?.role !== "seller") return <Navigate to="/" replace />;
    return children;
  };

  // Admin Protected Wrapper
  const AdminProtected = ({ children }: { children: JSX.Element }) => {
    if (!isLoggedIn) return <Navigate to="/admin/login" replace />;
    if (user?.role !== "admin") return <Navigate to="/" replace />;
    return children;
  };

  return (
    <Routes>
      {/* Public User Routes */}
      <Route path="/" element={<UserHome />} />
      <Route path="/login" element={<UserLogin />} />
      <Route path="/register" element={<UserRegister />} />
      <Route path="/cart" element={<CartPage />} />
      <Route path="/wishlist" element={<UserWishlist />} />
      <Route path="/notifications" element={<UserNotifications />} />

      {/* Seller Routes - Protected */}
      <Route path="/seller/login" element={<SellerLogin />} />
      <Route path="/seller/register" element={<SellerRegister />} />

      <Route
        path="/seller"
        element={
          <SellerProtected>
            <SellerDashboard />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/menu"
        element={
          <SellerProtected>
            <SellerMenu />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/orders"
        element={
          <SellerProtected>
            <SellerOrders />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/analytics"
        element={
          <SellerProtected>
            <SellerAnalytics />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/earnings"
        element={
          <SellerProtected>
            <SellerEarnings />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/settlements"
        element={
          <SellerProtected>
            <SellerSettlements />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/kyc"
        element={
          <SellerProtected>
            <SellerKYC />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/profile"
        element={
          <SellerProtected>
            <SellerProfile />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/settings"
        element={
          <SellerProtected>
            <SellerSettings />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/help"
        element={
          <SellerProtected>
            <SellerHelp />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/referrals"
        element={
          <SellerProtected>
            <SellerReferrals />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/promotions"
        element={
          <SellerProtected>
            <SellerPromotions />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/reviews"
        element={
          <SellerProtected>
            <SellerReviews />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/inventory"
        element={
          <SellerProtected>
            <SellerInventory />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/customers"
        element={
          <SellerProtected>
            <SellerCustomers />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/marketing"
        element={
          <SellerProtected>
            <SellerMarketing />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/payouts"
        element={
          <SellerProtected>
            <SellerPayouts />
          </SellerProtected>
        }
      />
      <Route
        path="/seller/performance"
        element={
          <SellerProtected>
            <SellerPerformanceInsights />
          </SellerProtected>
        }
      />

      {/* Admin Routes - Protected */}
      <Route path="/admin/login" element={<AdminLogin />} />

      <Route
        path="/admin"
        element={
          <AdminProtected>
            <AdminDashboard />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/sellers"
        element={
          <AdminProtected>
            <AdminSellers />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/users"
        element={
          <AdminProtected>
            <AdminUsers />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/orders"
        element={
          <AdminProtected>
            <AdminOrders />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/disputes"
        element={
          <AdminProtected>
            <AdminDisputes />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/audit-logs"
        element={
          <AdminProtected>
            <AdminAuditLogs />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/categories"
        element={
          <AdminProtected>
            <AdminCategories />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/settlements"
        element={
          <AdminProtected>
            <AdminSettlements />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/commission"
        element={
          <AdminProtected>
            <AdminCommission />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/gst"
        element={
          <AdminProtected>
            <AdminGST />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/referrals"
        element={
          <AdminProtected>
            <AdminReferrals />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/marketing"
        element={
          <AdminProtected>
            <AdminMarketing />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/analytics"
        element={
          <AdminProtected>
            <AdminAnalytics />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/performance"
        element={
          <AdminProtected>
            <AdminPerformance />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/settings"
        element={
          <AdminProtected>
            <AdminSettings />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/help"
        element={
          <AdminProtected>
            <AdminHelp />
          </AdminProtected>
        }
      />
      <Route
        path="/admin/products"
        element={
          <AdminProtected>
            <AdminProducts />
          </AdminProtected>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

export default App;
