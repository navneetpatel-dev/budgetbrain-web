'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAppSelector, useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { getAccessToken, clearTokens, apiGet } from '@/shared/services/api';
import type { User } from '@/shared/types';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useTheme } from '@/shared/theme';
import { DesktopSidebar } from '@/shared/containers/DesktopSidebar';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const dispatch = useAppDispatch();
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);
  const { isDesktop } = useResponsive();
  const theme = useTheme();
  // Rendered even while unauthenticated — /privacy and /terms need to be readable by anyone,
  // and /family/accept-invite must render its own accept flow for a brand-new invitee who
  // has no session yet (the invite email links straight here).
  const isPublic = pathname === '/privacy' || pathname === '/terms' || pathname === '/family/accept-invite';

  // Session bootstrap from /users/me
  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        dispatch(setUser(null));
        return;
      }
      try {
        const currentUser = await apiGet<User>('/users/me');
        dispatch(setUser(currentUser));
      } catch {
        clearTokens();
        dispatch(setUser(null));
      }
    };
    bootstrap();
  }, [dispatch]);

  // Auth gate checks
  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated && !isPublic) {
      router.replace('/login');
      return;
    }
    if (user && !user.onboardingCompleted && pathname !== '/onboarding') {
      router.replace('/onboarding');
      return;
    }
  }, [isAuthenticated, isLoading, user, pathname, router, isPublic]);

  // Desktop keyboard shortcuts ('n' / 'N' to add expense)
  useEffect(() => {
    if (!isDesktop) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }
      if (e.key === 'n' || e.key === 'N') {
        e.preventDefault();
        router.push('/expenses/add');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isDesktop, router]);

  if (isLoading) {
    return <ColdStartSkeleton />;
  }

  if (!isAuthenticated && !isPublic) {
    return <ColdStartSkeleton />;
  }

  if (user && !user.onboardingCompleted && pathname !== '/onboarding') {
    return <ColdStartSkeleton />;
  }

  if (!isAuthenticated && isPublic) {
    return (
      <div id="main-content" tabIndex={-1} className="h-full outline-none">
        {children}
      </div>
    );
  }

  if (!isDesktop) {
    return (
      <div id="main-content" tabIndex={-1} className="h-full outline-none">
        {children}
      </div>
    );
  }

  return (
    <div
      className="flex h-full bg-background"
      style={{ backgroundColor: theme.colors.background }}
    >
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>
      <DesktopSidebar />
      <main
        id="main-content"
        tabIndex={-1}
        className="flex-1 min-w-0 h-full overflow-hidden flex flex-col outline-none"
      >
        {children}
      </main>
    </div>
  );
}
