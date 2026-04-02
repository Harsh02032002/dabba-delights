import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/Logo";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  Users,
  Store,
  ShoppingBag,
  BarChart3,
  Settings,
  LogOut,
  HelpCircle,
  Shield,
  DollarSign,
  Percent,
  Gift,
  TrendingUp,
  Bell,
  User,
  ChevronLeft,
  ChevronRight,
  Receipt,
  FileText,
  Globe,
  Megaphone,
  UtensilsCrossed,
  Warehouse,
  Truck,
  CreditCard,
} from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const adminNavItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
  },
  {
    title: "divider",
    icon: null,
    href: "",
    label: "Management",
  },
  {
    title: "Sellers",
    icon: Store,
    href: "/admin/sellers",
  },
  {
    title: "Users",
    icon: Users,
    href: "/admin/users",
  },
  {
    title: "Orders",
    icon: ShoppingBag,
    href: '/admin/orders',
  },
  {
    title: 'Products',
    icon: UtensilsCrossed,
    href: '/admin/products',
  },
  {
    title: "divider",
    icon: null,
    href: "",
    label: "Finance",
  },
  {
    title: "Settlements",
    icon: Receipt,
    href: "/admin/settlements",
  },
  {
    title: "Commission",
    icon: Percent,
    href: "/admin/commission",
  },
  {
    title: "GST Config",
    icon: FileText,
    href: "/admin/gst",
  },
  {
    title: "divider",
    icon: null,
    href: "",
    label: "Growth",
  },
  {
    title: "Referrals",
    icon: Gift,
    href: "/admin/referrals",
  },
  {
    title: "Marketing",
    icon: Megaphone,
    href: "/admin/marketing",
  },
  {
    title: "divider",
    icon: null,
    href: "",
    label: "Analytics",
  },
  {
    title: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
  },
  {
    title: "Performance",
    icon: TrendingUp,
    href: "/admin/performance",
  },
  {
    title: "divider",
    icon: null,
    href: "",
    label: "Delivery & Logistics",
  },
  {
    title: "Warehouses",
    icon: Warehouse,
    href: "/admin/warehouses",
  },
  {
    title: "Delivery Partners",
    icon: Truck,
    href: "/admin/delivery-partners",
  },
  {
    title: "Delivery Pay Config",
    icon: CreditCard,
    href: "/admin/delivery-pay-config",
  },
];

const bottomNavItems = [
  {
    title: "Settings",
    icon: Settings,
    href: "/admin/settings",
  },
  {
    title: "Help",
    icon: HelpCircle,
    href: "/admin/help",
  },
];

export function AdminSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (href: string) => {
    if (href === "/admin") {
      return location.pathname === "/admin";
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
        <Link to="/admin" className="flex items-center">
          <Logo size={collapsed ? "sm" : "md"} showText={!collapsed} />
        </Link>
        {!collapsed && (
          <div className="mt-2 flex items-center gap-2">
            <Shield size={14} className="text-primary" />
            <span className="text-xs font-medium text-primary">
              Admin Panel
            </span>
          </div>
        )}
      </div>

      {/* Collapse Button */}
      <Button
        variant="ghost"
        size="icon-sm"
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 w-6 h-6 rounded-full bg-card border border-border shadow-sm"
      >
        {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
      </Button>

      {/* Navigation */}
      <nav className="flex-1 p-3 overflow-y-auto">
        <ul className="space-y-1">
          {adminNavItems.map((item, index) => {
            if (item.title === "divider") {
              return (
                <li key={index} className="py-2">
                  <div
                    className={cn(
                      "border-t border-sidebar-border",
                      collapsed && "mx-2",
                    )}
                  />
                  {!collapsed && item.label && (
                    <p className="mt-3 mb-1 px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                      {item.label}
                    </p>
                  )}
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
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center shrink-0">
              <Shield size={18} className="text-primary-foreground" />
            </div>
            {!collapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Super Admin
                </p>
              </div>
            )}
            {!collapsed && (
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={() => logout()}
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
