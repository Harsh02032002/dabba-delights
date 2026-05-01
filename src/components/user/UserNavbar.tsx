import { Link, useLocation } from "react-router-dom";
import { Logo } from "@/components/shared/Logo";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { useQuery } from "@tanstack/react-query";
import { userAPI } from "@/lib/api";
import { Input } from "@/components/ui/input";
import {
  Search,
  MapPin,
  ShoppingCart,
  User,
  Heart,
  Bell,
  ChevronDown,
  LogOut,
  Settings,
  FileText,
  Wallet,
  Crown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useState } from "react";

interface UserNavbarProps {
  onSearch?: (query: string) => void;
}

export function UserNavbar({ onSearch }: UserNavbarProps) {
  const { user, isLoggedIn, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  const { data: orders = [] } = useQuery({
    queryKey: ['active-orders-count-nav'],
    queryFn: async () => {
      const res = await userAPI.getOrders();
      let orders = [];
      if (Array.isArray(res)) orders = res;
      else if (res?.orders) orders = res.orders;
      else if (res?.data) orders = res.data;
      return orders;
    },
    enabled: isLoggedIn,
    refetchInterval: 30000,
  });

  const activeOrdersCount = orders.filter((o: any) => 
    ['pending', 'confirmed', 'preparing', 'out_for_delivery'].includes(o.status)
  ).length;

  const [query, setQuery] = useState("");

  const storedLoc = (() => {
    try {
      const raw = localStorage.getItem("userLocation");
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  })();
  const displayLocation = storedLoc?.display || "Set Location";

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    setQuery(v);
    onSearch?.(v);
  };

  return (
    <header className="border-b< sticky top-0 z-50 border-border bg-background/60 backdrop-blur-sm">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <Logo />
          </Link>

          {/* Location (hidden on small screens) */}
          <button className="hidden items-center gap-2 rounded-xl bg-secondary px-4 py-2 transition-colors hover:bg-secondary/90 md:flex">
            <MapPin size={18} className="text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Deliver to</p>
              <p className="text-sm font-medium">{displayLocation}</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>

          {/* Search */}
          <div className="max-w-xl flex-1">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                size={18}
              />
              <Input
                value={query}
                onChange={handleSearchChange}
                type="search"
                placeholder="Search for dishes, cuisines, or restaurants..."
                className="h-11 w-full rounded-xl border-transparent bg-secondary pl-10 focus:border-primary"
              />
            </div>
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <Link to="/wishlist">
              <Button variant="ghost" size="icon" className="hidden md:flex">
                <Heart size={20} />
              </Button>
                      </Link>
              <Link to="/notifications">        
            <Button
              variant="ghost"
              size="icon"
              className="relative hidden md:flex"
            >
              <Bell size={20} />
              <span className="absolute right-0 top-0 h-2 w-2 rounded-full bg-destructive" />
            </Button>
                </Link>
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-4 min-w-[18px] items-center justify-center rounded-full bg-primary px-1 text-xs text-white">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User menu / Login */}
            {isLoggedIn ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                      <User size={16} />
                    </div>
                    <span className="hidden text-sm font-medium md:inline">
                      {user?.name?.split(" ")[0]}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-4 py-3">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                  <DropdownMenuSeparator />

                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <FileText size={16} />
                        My Orders
                      </div>
                      {activeOrdersCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-white">
                          {activeOrdersCount}
                        </span>
                      )}
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="flex items-center gap-2">
                      <Wallet size={16} />
                      Wallet (₹{(user as any)?.wallet || 0})
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/subscriptions" className="flex items-center gap-2">
                      <Crown size={16} />
                      Subscription Plans
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings size={16} />
                      Settings
                    </Link>
                  </DropdownMenuItem>

                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => logout()}
                    className="text-destructive"
                  >
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="gradient" className="gap-2">
                  <User size={16} />
                  <span>Login</span>
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
