'use client';

import React from 'react';
import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { QueryClientProvider } from '@tanstack/react-query';
import { store, persistor } from '@/shared/store';
import { queryClient } from '@/shared/services/queryClient';
import { ThemeProvider } from '@/shared/theme';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';
import { PreferencesHydrator } from '@/features/settings';
import { MotionProvider } from './MotionProvider';

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={<ColdStartSkeleton />} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <MotionProvider>
              <PreferencesHydrator />
              {children}
            </MotionProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  );
}
