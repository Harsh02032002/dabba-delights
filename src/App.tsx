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

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminSellers from "./pages/admin/AdminSellers";

import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              {/* User Routes */}
              <Route path="/" element={<UserHome />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/cart" element={<CartPage />} />

              {/* Seller Routes */}
              <Route path="/seller/login" element={<SellerLogin />} />
              <Route path="/seller" element={<SellerDashboard />} />
              <Route path="/seller/menu" element={<SellerMenu />} />
              <Route path="/seller/orders" element={<SellerOrders />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminDashboard />} />
              <Route path="/admin/sellers" element={<AdminSellers />} />

              {/* Catch-all */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
