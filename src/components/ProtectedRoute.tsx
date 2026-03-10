import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'seller' | 'admin' | 'user';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
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

  // Not logged in - redirect to appropriate login page
  if (!user) {
    if (requiredRole === 'seller') {
      return <Navigate to="/seller/login" replace />;
    } else if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // Logged in but wrong role - redirect to correct dashboard
  if (requiredRole && user.role !== requiredRole) {
    if (user.role === 'seller') {
      return <Navigate to="/seller" replace />;
    } else if (user.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // Authorized - render the component
  return <>{children}</>;
}
