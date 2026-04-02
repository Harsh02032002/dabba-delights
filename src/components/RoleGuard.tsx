import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

interface RoleGuardProps {
  children: React.ReactNode;
  allowedRole: 'user' | 'seller' | 'admin' | 'delivery';
}

export function RoleGuard({ children, allowedRole }: RoleGuardProps) {
  const { isRoleLoggedIn, getRoleUser, isLoading } = useAuth();

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

  // STRICT: Check if the SPECIFIC role is logged in (not just any role)
  const hasRoleToken = isRoleLoggedIn(allowedRole);
  const roleUser = getRoleUser(allowedRole);

  // If not logged in with the specific role token, redirect to appropriate login
  if (!hasRoleToken || !roleUser) {
    if (allowedRole === 'user') {
      return <Navigate to="/login" replace />;
    } else if (allowedRole === 'seller') {
      return <Navigate to="/seller/login" replace />;
    } else if (allowedRole === 'admin') {
      return <Navigate to="/admin/login" replace />;
    } else if (allowedRole === 'delivery') {
      return <Navigate to="/delivery/login" replace />;
    }
  }

  // STRICT: Even if logged in, verify the user has the correct role
  if (roleUser && roleUser.role !== allowedRole) {
    // Wrong role - redirect to their correct panel
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

  return <>{children}</>;
}
