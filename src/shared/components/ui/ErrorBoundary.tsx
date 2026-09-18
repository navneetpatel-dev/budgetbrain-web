'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { errorBoundaryStyles } from './ErrorBoundary.styles';

export interface ErrorBoundaryProps {
  error: Error & { digest?: string };
  reset: () => void;
  title?: string;
  description?: string;
  fullScreen?: boolean;
  showHomeAction?: boolean;
}

export function ErrorBoundary({
  error,
  reset,
  title = 'Something went wrong',
  description = 'An unexpected error occurred while loading this section. Please try again or return to the previous page.',
  fullScreen = false,
  showHomeAction = true,
}: ErrorBoundaryProps) {
  const theme = useTheme();
  const router = useRouter();

  const handleGoBack = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) {
      router.back();
    } else {
      router.push('/dashboard');
    }
  };

  const containerClass = fullScreen
    ? errorBoundaryStyles.fullScreenContainer
    : errorBoundaryStyles.container;

  return (
    <div className={containerClass} role="alert">
      <div className={errorBoundaryStyles.iconWrapper}>
        <AppIcon name="notification" size={32} color={theme.colors.danger} />
      </div>

      <h1 className={errorBoundaryStyles.title}>{title}</h1>

      <p className={errorBoundaryStyles.description}>{description}</p>

      <div className={errorBoundaryStyles.actions}>
        <button
          type="button"
          onClick={reset}
          className={errorBoundaryStyles.primaryButton}
        >
          <AppIcon name="refresh" size={16} color="currentColor" />
          <span>Try again</span>
        </button>

        <button
          type="button"
          onClick={handleGoBack}
          className={errorBoundaryStyles.secondaryButton}
        >
          <AppIcon name="arrowLeft" size={16} color="currentColor" />
          <span>Go back</span>
        </button>

        {showHomeAction ? (
          <Link
            href="/dashboard"
            className={errorBoundaryStyles.secondaryButton}
          >
            <AppIcon name="home" size={16} color="currentColor" />
            <span>Dashboard</span>
          </Link>
        ) : null}
      </div>

      {process.env.NODE_ENV === 'development' && error?.message ? (
        <pre className={errorBoundaryStyles.detailsBox}>
          <code>{error.message}</code>
          {error.digest ? (
            <div className="mt-2 text-text-secondary opacity-70">
              Digest: {error.digest}
            </div>
          ) : null}
        </pre>
      ) : null}
    </div>
  );
}
