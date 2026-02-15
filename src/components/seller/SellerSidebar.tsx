import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  BarChart3,
  DollarSign,
  Gift,
  Megaphone,
  Star,
  Archive,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  HelpCircle,
  FileCheck,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Store,
  Receipt,
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const sellerNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/seller",
  },
  {
    title: "Menu Management",
    icon: UtensilsCrossed,
    href: "/seller/menu",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    href: "/seller/orders",
  },
  {
    title: "divider",
    icon: null,
    href: "",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/seller/analytics",
  },
  {
    title: "Earnings",
    icon: DollarSign,
    href: "/seller/earnings",
  },
  {
    title: "Settlements",
    icon: Receipt,
    href: "/seller/settlements",
  },
  {
    title: "divider",
    icon: null,
    href: "",
  },
  {
    title: "Referrals",
    icon: Gift,
    href: "/seller/referrals",
  },
  {
    title: "Promotions",
    icon: Megaphone,
    href: "/seller/promotions",
  },
  {
    title: "Reviews",
    icon: Star,
    href: "/seller/reviews",
  },
  {
    title: "Inventory",
    icon: Archive,
    href: "/seller/inventory",
  },
  {
    title: "Customers",
    icon: Users,
    href: "/seller/customers",
  },
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/seller/marketing",
  },
  {
    title: "divider",
    icon: null,
    href: "",
  },
  {
    title: "Payouts",
    icon: DollarSign,
    href: "/seller/payouts",
  },
  {
    title: "Performance",
    icon: TrendingUp,
    href: "/seller/performance",
  },
  {
    title: "divider",
    icon: null,
    href: "",
  },
  {
    title: "KYC Status",
    icon: FileCheck,
    href: "/seller/kyc",
  },
  {
    title: "Profile",
    icon: Store,
    href: "/seller/profile",
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/seller/settings",
  },
  {
    title: "Help & Support",
    icon: HelpCircle,
    href: "/seller/help",
  },
];

export function SellerSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/seller") {
      return location.pathname === "/seller";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-sidebar gradient-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
        collapsed ? "w-[72px]" : "w-[260px]",
      )}
    >
      {/* Header */}
      <div
        className={cn(
          "p-4 border-b border-sidebar-border",
          collapsed && "px-3",
        )}
      >
        <Link to="/seller" className="flex items-center">
          <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
        </Link>
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-card border border-border shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {sellerNavItems.map((item, index) => {
            if (item.title === "divider") {
              return (
                <li key={index} className="py-2">
                  <div
                    className={cn(
                      "border-t border-sidebar-border",
                      collapsed && "mx-2",
                    )}
                  />
                </li>
              );
            }

            const Icon = item.icon!;
            const active = isActive(item.href);

            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "sidebar-link",
                  active && "sidebar-link-active",
                  collapsed && "justify-center px-3",
                )}
              >
                <Icon size={20} className={active ? "text-primary" : ""} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.title}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.title}>{linkContent}</li>;
          })}
        </ul>
      </nav>

      {/* Bottom Navigation */}
      <div className="p-3 border-t border-sidebar-border">
        <ul className="space-y-1">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            const linkContent = (
              <Link
                to={item.href}
                className={cn(
                  "sidebar-link",
                  active && "sidebar-link-active",
                  collapsed && "justify-center px-3",
                )}
              >
                <Icon size={20} />
                {!collapsed && <span>{item.title}</span>}
              </Link>
            );

            if (collapsed) {
              return (
                <li key={item.title}>
                  <Tooltip delayDuration={0}>
                    <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                    <TooltipContent side="right" sideOffset={10}>
                      {item.title}
                    </TooltipContent>
                  </Tooltip>
                </li>
              );
            }

            return <li key={item.title}>{linkContent}</li>;
          })}
        </ul>

        {/* User Profile */}
        <div
          className={cn(
            "mt-4 pt-4 border-t border-sidebar-border",
            collapsed && "px-0",
          )}
        >
          <div
            className={cn(
              "flex items-center gap-3",
              collapsed && "justify-center",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <User size={20} className="text-primary" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || "Seller"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user?.email || "seller@example.com"}
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={logout}
                className="text-muted-foreground hover:text-destructive"
              >
                <LogOut size={16} />
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}
