import { useNavigate, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Heart, Crown, User } from "lucide-react";

export function MobileBottomNav() {
  const navigate = useNavigate();
  const location = useLocation();

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
              <Icon className="w-5 h-5" />
              <span className="text-xs font-medium">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
