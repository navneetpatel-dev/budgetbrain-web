'use client';

import { useMemo } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from '@/shared/theme';
import { useSocialAuth } from '@/features/auth/hooks/auth/useSocialAuth.hook';
import { AuthDivider } from './AuthDivider.component';
import { AuthErrorBanner } from './AuthBanners.component';

const GOOGLE_CLIENT_ID =
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
  process.env.VITE_GOOGLE_CLIENT_ID;
const googleEnabled = Boolean(GOOGLE_CLIENT_ID?.trim());

function GoogleMark() {
  return (
    <span style={{
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: '#fff',
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: 13,
      fontWeight: 700,
      color: '#4285F4',
      flexShrink: 0,
    }}>
      G
    </span>
  );
}

function Spinner({ color }: { color: string }) {
  return (
    <span style={{
      width: 18,
      height: 18,
      border: '2px solid transparent',
      borderTopColor: color,
      borderRadius: '50%',
      animation: 'spin 0.6s linear infinite',
      flexShrink: 0,
    }} />
  );
}

function ActiveGoogleLoginButton({
  isBusy,
  isGoogleLoading,
  shellStyle,
  theme,
  signInGoogle,
  reportProviderError,
}: {
  isBusy: boolean;
  isGoogleLoading: boolean;
  shellStyle: React.CSSProperties;
  theme: ReturnType<typeof useTheme>;
  signInGoogle: (token: string) => Promise<void>;
  reportProviderError: (provider: 'google' | 'apple', err: unknown) => void;
}) {
  const login = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        await signInGoogle(tokenResponse.access_token);
      } catch {
        // Handled in useSocialAuth
      }
    },
    onError: (errorResponse) => {
      reportProviderError(
        'google',
        new Error(errorResponse.error_description || 'Google sign-in was not completed.')
      );
    },
  });

  return (
    <button
      type="button"
      onClick={() => login()}
      disabled={isBusy}
      style={{
        ...shellStyle,
        margin: 0,
        appearance: 'none',
        WebkitAppearance: 'none',
        opacity: isBusy ? 0.6 : 1,
        cursor: isBusy ? 'not-allowed' : 'pointer',
      }}
    >
      {isGoogleLoading ? (
        <>
          <Spinner color={theme.colors.primary} />
          <span>Signing in…</span>
        </>
      ) : (
        <>
          <GoogleMark />
          <span>Google</span>
        </>
      )}
    </button>
  );
}

import { isAppleSignInConfigured } from '@/features/auth/api/appleAuth.api';

function AppleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 170 170" fill="currentColor">
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.74 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.08-7.61-7.85-11.74-14.3-6.09-9.5-10.84-20.2-14.26-32.08-3.41-11.89-5.13-23.01-5.13-33.37 0-14.1 3.51-26.04 10.53-35.83 7.02-9.79 16.03-14.77 27.03-14.95 5.17.1 10.74 1.48 16.71 4.12 5.97 2.65 9.77 4.02 11.4 4.13 1.25-.11 5.34-1.57 12.28-4.38 6.94-2.82 12.65-4.14 17.13-3.97 12.65.65 22.86 5.43 30.63 14.35-11.08 6.74-16.5 16.09-16.27 28.05.23 9.46 3.86 17.28 10.9 23.46 7.03 6.18 15.42 9.73 25.17 10.65-2.28 7.06-5.38 14.78-9.31 23.16zM119.22 33.74c0-7.28 2.61-14.24 7.83-20.89 5.22-6.65 11.74-11.13 19.56-13.45.22 1.09.33 2.06.33 2.93 0 7.39-2.77 14.51-8.31 21.36-5.54 6.85-12.17 11.09-19.89 12.72-.11-.87-.22-1.76-.22-2.67z" />
    </svg>
  );
}

function InactiveGoogleLoginButton({
  isBusy,
  isGoogleLoading,
  shellStyle,
  theme,
  onUnavailable,
}: {
  isBusy: boolean;
  isGoogleLoading: boolean;
  shellStyle: React.CSSProperties;
  theme: ReturnType<typeof useTheme>;
  onUnavailable: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUnavailable}
      disabled={isBusy}
      style={{
        ...shellStyle,
        margin: 0,
        appearance: 'none',
        WebkitAppearance: 'none',
        opacity: isBusy ? 0.6 : 1,
        cursor: 'pointer',
      }}
    >
      {isGoogleLoading ? (
        <>
          <Spinner color={theme.colors.primary} />
          <span>Signing in…</span>
        </>
      ) : (
        <>
          <GoogleMark />
          <span>Google</span>
        </>
      )}
    </button>
  );
}

export function SocialAuthButtons({ disabled: formDisabled }: { disabled?: boolean }) {
  const theme = useTheme();
  const { loading, error, clearError, signInGoogle, signInApple, reportProviderError } = useSocialAuth();
  const isGoogleLoading = loading === 'google';
  const isAppleLoading = loading === 'apple';
  const isBusy = formDisabled || Boolean(loading);
  const appleConfigured = isAppleSignInConfigured();

  const shellStyle = useMemo(() => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    padding: '14px 16px',
    borderRadius: theme.radii.lg,
    backgroundColor: theme.colors.surface,
    border: `1px solid ${theme.colors.border}`,
    color: theme.colors.text,
    fontSize: 15,
    fontWeight: 600,
    fontFamily: 'Inter, sans-serif',
    boxSizing: 'border-box' as const,
  }), [theme]);

  const onGoogleUnavailable = () => {
    clearError();
    reportProviderError(
      'google',
      new Error('VITE_GOOGLE_CLIENT_ID is not configured in web/.env')
    );
  };

  const onAppleClick = () => {
    if (!appleConfigured) {
      clearError();
      reportProviderError(
        'apple',
        new Error('Apple Sign-In is not configured in web/.env')
      );
      return;
    }
    void signInApple();
  };

  return (
    <div style={{ marginTop: 0 }}>
      <AuthDivider label="or sign in with" />
      <div style={{ display: 'flex', gap: theme.spacing.sm, width: '100%' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {googleEnabled ? (
            <ActiveGoogleLoginButton
              isBusy={isBusy}
              isGoogleLoading={isGoogleLoading}
              shellStyle={shellStyle}
              theme={theme}
              signInGoogle={signInGoogle}
              reportProviderError={reportProviderError}
            />
          ) : (
            <InactiveGoogleLoginButton
              isBusy={isBusy}
              isGoogleLoading={isGoogleLoading}
              shellStyle={shellStyle}
              theme={theme}
              onUnavailable={onGoogleUnavailable}
            />
          )}
        </div>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          <button
            type="button"
            onClick={onAppleClick}
            disabled={isBusy}
            style={{
              ...shellStyle,
              margin: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
              opacity: isBusy ? 0.6 : 1,
              cursor: isBusy ? 'not-allowed' : 'pointer',
            }}
          >
            {isAppleLoading ? (
              <>
                <Spinner color={theme.colors.text} />
                <span>Signing in…</span>
              </>
            ) : (
              <>
                <AppleMark />
                <span>Apple</span>
              </>
            )}
          </button>
        </div>
      </div>
      {error ? <AuthErrorBanner message={error} /> : null}
    </div>
  );
}