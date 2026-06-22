import { ReactNode } from "react";
import { UserNavbar } from "@/components/user/UserNavbar";
import Footer from "@/components/shared/Footer";
import { MobileBottomNav } from "@/components/MobileBottomNav";

interface UserLayoutProps {
  children: ReactNode;
  onSearch?: (query: string) => void;
}

export function UserLayout({ children, onSearch }: UserLayoutProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <UserNavbar onSearch={onSearch} />

      <main className="flex-1 pb-16 md:pb-0">{children}</main>

      {/* Footer — visible on all screens; extra bottom padding on mobile for the fixed bottom nav */}
      <div className="pb-16 md:pb-0">
        <Footer />
      </div>

      <MobileBottomNav />
    </div>
  );
}
