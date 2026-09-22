'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAppSelector } from '@/shared/store/hooks';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID;

function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
  }
  return <>{children}</>;
}

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

  return <GoogleAuthProviderWrapper>{children}</GoogleAuthProviderWrapper>;
}
