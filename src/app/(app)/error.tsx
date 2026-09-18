'use client';

import { useEffect } from 'react';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { captureError } from '@/shared/services/monitoring';

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: 'app-error-boundary' });
  }, [error]);

  return (
    <ErrorBoundary
      error={error}
      reset={reset}
      title="Application error"
      description="An error occurred while loading this page. You can try again, go back, or return to the dashboard."
      showHomeAction={true}
    />
  );
}
