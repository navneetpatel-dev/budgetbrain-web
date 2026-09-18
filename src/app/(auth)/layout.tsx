'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAppSelector } from '@/shared/store/hooks';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAppSelector((s) => s.auth);

  useEffect(() => {
    if (isLoading) return;
    if (isAuthenticated) {
      if (user?.onboardingCompleted) {
        router.replace('/dashboard');
      } else {
        router.replace('/onboarding');
      }
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return <ColdStartSkeleton />;
  }

  if (isAuthenticated) {
    return <ColdStartSkeleton />;
  }

  return <>{children}</>;
}
