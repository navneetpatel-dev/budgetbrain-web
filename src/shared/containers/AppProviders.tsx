'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { store, persistor } from '@/shared/store';
import { queryClient } from '@/shared/services/queryClient';
import { ThemeProvider } from '@/shared/theme';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';
import { PreferencesHydrator } from '@/features/settings';
import { MotionProvider } from './MotionProvider';

const googleClientId =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID;

function GoogleAuthProviderWrapper({ children }: { children: React.ReactNode }) {
  if (googleClientId) {
    return <GoogleOAuthProvider clientId={googleClientId}>{children}</GoogleOAuthProvider>;
  }
  return <>{children}</>;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<ColdStartSkeleton />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MotionProvider>
              <PreferencesHydrator />
              <GoogleAuthProviderWrapper>
                {children}
              </GoogleAuthProviderWrapper>
            </MotionProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
