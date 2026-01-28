import { Link, useLocation } from 'react-router-dom';
import { Logo } from '@/components/shared/Logo';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';
import { Input } from '@/components/ui/input';
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
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface UserNavbarProps {
  onSearch?: (query: string) => void;
}

export function UserNavbar({ onSearch }: UserNavbarProps) {
  const { user, isAuthenticated, logout } = useAuth();
  const { itemCount } = useCart();
  const location = useLocation();

  return (
    <header className="sticky top-0 z-50 glass-effect border-b border-border/50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link to="/">
            <Logo size="sm" />
          </Link>

          {/* Location Selector */}
          <button className="hidden md:flex items-center gap-2 px-4 py-2 bg-secondary rounded-xl hover:bg-secondary/80 transition-colors">
            <MapPin size={18} className="text-primary" />
            <div className="text-left">
              <p className="text-xs text-muted-foreground">Deliver to</p>
              <p className="text-sm font-medium">Mumbai, Maharashtra</p>
            </div>
            <ChevronDown size={16} className="text-muted-foreground" />
          </button>

          {/* Search Bar */}
          <div className="flex-1 max-w-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input
                type="search"
                placeholder="Search for dishes, cuisines, or restaurants..."
                className="pl-10 bg-secondary border-transparent focus:border-primary h-11 rounded-xl"
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            {/* Favorites */}
            <Button variant="ghost" size="icon" className="hidden md:flex">
              <Heart size={20} />
            </Button>

            {/* Notifications */}
            <Button variant="ghost" size="icon" className="hidden md:flex relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
            </Button>

            {/* Cart */}
            <Link to="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart size={20} />
                {itemCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-primary-foreground text-xs font-bold rounded-full flex items-center justify-center">
                    {itemCount}
                  </span>
                )}
              </Button>
            </Link>

            {/* User Menu */}
            {isAuthenticated ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="gap-2 px-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <User size={16} className="text-primary" />
                    </div>
                    <span className="hidden md:inline text-sm font-medium">
                      {user?.name?.split(' ')[0]}
                    </span>
                    <ChevronDown size={14} className="text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2">
                    <p className="font-medium">{user?.name}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/orders" className="flex items-center gap-2">
                      <FileText size={16} />
                      My Orders
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/wallet" className="flex items-center gap-2">
                      <Wallet size={16} />
                      Wallet (₹{user?.wallet || 0})
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/settings" className="flex items-center gap-2">
                      <Settings size={16} />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="text-destructive">
                    <LogOut size={16} className="mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/login">
                <Button variant="gradient" className="gap-2">
                  <User size={16} />
                  Login
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
