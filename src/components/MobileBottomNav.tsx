import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, Crown, User } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: orders = [] } = useQuery({
    queryKey: ['active-orders-count'],
    queryFn: async () => {
      const res = await userAPI.getOrders();
      let orders = [];
      if (Array.isArray(res)) orders = res;
      else if (res?.orders) orders = res.orders;
      else if (res?.data) orders = res.data;
      return orders;
    },
    refetchInterval: 30000, // Refresh every 30 seconds
  });

  const activeOrdersCount = orders.filter((o: any) => 
    ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  ).length;

  const navItems = [
    { icon: Home, label: "Home", path: "/home" },
    { icon: ShoppingBag, label: "Orders", path: "/orders" },
    { icon: Crown, label: "Subscribe", path: "/subscription-plans" },
    { icon: Heart, label: "Wishlist", path: "/wishlist" },
    { icon: User, label: "Profile", path: "/settings" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          
          return (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              className={`flex flex-col items-center gap-1 px-3 py-1 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-gray-500"
              }`}
            >
              <div className="relative">
                <Icon className="w-5 h-5" />
                {item.label === "Orders" && activeOrdersCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-primary text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                    {activeOrdersCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
