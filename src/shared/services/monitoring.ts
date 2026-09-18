/**
 * Web monitoring service for error reporting.
 * Logs during development and forwards to Sentry or external monitoring if available.
 */
export function captureError(
  error: Error,
  context?: Record<string, string | number | boolean | undefined>
): void {
  if (process.env.NODE_ENV === 'development') {
    console.error('[Monitoring] Captured error:', error, context);
  }

  if (
    typeof window !== 'undefined' &&
    (window as unknown as { Sentry?: { captureException: (e: Error, opts?: unknown) => void } }).Sentry
  ) {
    (window as unknown as { Sentry: { captureException: (e: Error, opts?: unknown) => void } }).Sentry.captureException(
      error,
      { extra: context }
    );
  }
}
