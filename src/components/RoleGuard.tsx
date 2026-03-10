import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'user' | 'seller' | 'admin';
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not logged in or wrong role, redirect to appropriate login
  if (!user || user.role !== allowedRole) {
    if (allowedRole === 'user') {
      return <Navigate to="/login" replace />;
    } else if (allowedRole === 'seller') {
      return <Navigate to="/seller/login" replace />;
    } else if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    }
  }

  return <>{children}</>;
}
