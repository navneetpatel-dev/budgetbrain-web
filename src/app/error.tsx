'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { captureError } from '@/shared/services/monitoring';

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: 'root-error-boundary' });
  }, [error]);

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Something went wrong"
      description="An unexpected error occurred. Please try again or return to the dashboard."
      showHomeAction={true}
    />
  );
}
