'use client';

import { useEffect } from 'react';
import './globals.css';
import { ErrorBoundary } from '@/shared/components/ui/ErrorBoundary';
import { captureError } from '@/shared/services/monitoring';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    captureError(error, { boundary: 'global-error-boundary' });
  }, [error]);

  return (
    <html lang="en">
      <body className="font-sans antialiased h-full w-full bg-background text-text">
        <ErrorBoundary
          error={error}
          reset={reset}
          title="Critical system error"
          description="A critical error occurred while initializing the application. Please reload or try again."
          fullScreen={true}
          showHomeAction={true}
        />
      </body>
    </html>
  );
}
