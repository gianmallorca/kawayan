import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';

interface ProtectedRouteProps {
  permission?: string;
}

export function ProtectedRoute({ permission }: ProtectedRouteProps) {
  const { accessToken, user } = useAuthStore();

  if (!accessToken || !user) return <Navigate to="/login" replace />;
  if (permission && !(user.permissions ?? []).includes(permission))
    return <Navigate to="/" replace />;

  return <Outlet />;
}
