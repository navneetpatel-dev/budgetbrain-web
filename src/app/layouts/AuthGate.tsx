import { useEffect } from 'react';
import { Outlet, Navigate, useLocation } from 'react-router-dom';
import { useAppSelector } from '@/shared/store/hooks';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';

export function AuthGate() {
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);
  const location = useLocation();
  const pathname = location.pathname.split('/').filter(Boolean)[0];

  if (isLoading) return <ColdStartSkeleton />;

  // Allow auth routes and public routes
  const publicPaths = ['login', 'register', 'forgot-password', 'reset-password', 'otp-login', 'verify-email', 'privacy', 'terms'];
  const isPublicRoute = publicPaths.includes(pathname);

  if (!isAuthenticated) {
    if (isPublicRoute) return <Outlet />;
    return <Navigate to="/login" replace />;
  }

  // Authenticated user logic
  if (!user?.onboardingCompleted && pathname !== 'onboarding') {
    return <Navigate to="/onboarding" replace />;
  }

  // Don't redirect if user is on a valid authenticated route
  const authOnlyPaths = ['login', 'register', 'forgot-password', 'reset-password', 'otp-login', 'verify-email'];
  if (authOnlyPaths.includes(pathname)) {
    if (user?.onboardingCompleted) return <Navigate to="/dashboard" replace />;
    return <Navigate to="/onboarding" replace />;
  }

  if (pathname === 'onboarding' && user?.onboardingCompleted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
}
