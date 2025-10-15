import { Navigate } from 'react-router';
import { useAquaTrackingAuth } from '@/features/auth/hooks/useAquaTrackingAuth';
import Loading from '@/components/shared/Loading';
import type { ReactNode } from 'react';

interface AquaTrackingProtectedRouteProps {
  children: ReactNode;
  requireAdmin?: boolean;
}

const AquaTrackingProtectedRoute = ({ 
  children, 
  requireAdmin = false 
}: AquaTrackingProtectedRouteProps) => {
  const { currentUser, loading, isAuthenticated, isAdmin } = useAquaTrackingAuth();

  if (loading) {
    return <Loading loading={true} />;
  }

  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }

  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/user/overview" replace />;
  }

  return <>{children}</>;
};

export default AquaTrackingProtectedRoute;
