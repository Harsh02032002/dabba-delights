import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'seller' | 'admin' | 'user' | 'delivery';
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isRoleLoggedIn, getRoleUser, isLoading } = useAuth();
  const location = useLocation();

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

  // STRICT ROLE CHECK: Only check the specific role's token
  const targetRole = requiredRole || 'user';
  const hasRoleToken = isRoleLoggedIn(targetRole);
  const roleUser = getRoleUser(targetRole);

  // Not logged in for this specific role - redirect to appropriate login
  if (!hasRoleToken || !roleUser) {
    if (requiredRole === 'seller') {
      return <Navigate to="/seller/login" replace />;
    } else if (requiredRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else if (requiredRole === 'delivery') {
      return <Navigate to="/delivery/login" replace />;
    } else {
      return <Navigate to="/login" replace />;
    }
  }

  // STRICT: Logged in but trying to access different role's panel
  // e.g., Seller trying to access /admin, or User trying to access /seller
  if (requiredRole && roleUser.role !== requiredRole) {
    // Redirect to their correct dashboard
    if (roleUser.role === 'seller') {
      return <Navigate to="/seller" replace />;
    } else if (roleUser.role === 'admin') {
      return <Navigate to="/admin" replace />;
    } else if (roleUser.role === 'delivery') {
      return <Navigate to="/delivery" replace />;
    } else {
      return <Navigate to="/home" replace />;
    }
  }

  // Authorized - render the component
  return <>{children}</>;
}
