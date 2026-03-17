import { ReactNode, useState } from 'react';
import { SellerSidebar } from '@/components/seller/SellerSidebar';
import { Button } from '@/components/ui/button';
import { Bell, Search, Menu } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface SellerLayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  headerActions?: ReactNode;
}

export function SellerLayout({ children, title, subtitle, headerActions }: SellerLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-background">
      <SellerSidebar />
      
      <div className="lg:ml-[260px] transition-all duration-300">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 glass-effect border-b border-border/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h1 className="text-2xl font-display font-bold text-foreground">
                  {title}
                </h1>
              )}
              {subtitle && (
                <p className="text-muted-foreground">{subtitle}</p>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block relative w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={16} />
                <Input
                  type="search"
                  placeholder="Search..."
                  className="pl-9 bg-secondary border-transparent h-9"
                />
              </div>
              
              {/* Custom header actions */}
              {headerActions && (
                <div className="flex items-center">
                  {headerActions}
                </div>
              )}
              
              <Button variant="ghost" size="icon" className="relative">
                <Bell size={20} />
                <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full" />
              </Button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
