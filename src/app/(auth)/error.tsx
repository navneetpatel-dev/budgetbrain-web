'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { captureError } from '@/shared/services/monitoring';

export default function AuthError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: 'auth-error-boundary' });
  }, [error]);

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Authentication error"
      description="We encountered an issue loading this authentication screen. Please try again or return to login."
      showHomeAction={false}
    />
  );
}
