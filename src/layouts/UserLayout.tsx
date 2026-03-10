import { ReactNode } from 'react';
import { UserNavbar } from '@/components/user/UserNavbar';
import Footer from '@/components/shared/Footer';

interface UserLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
}

export function UserLayout({ children, onSearch }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UserNavbar onSearch={onSearch} />
      
      <main className="flex-1">
        {children}
      </main>
      
      <Footer />
    </div>
  );
}
