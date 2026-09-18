import { useMemo } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { useTheme } from '@/shared/theme';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth';
import { AuthDivider } from './AuthDivider';
import { AuthErrorBanner } from './AuthBanners';

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
  const { loading, error, clearError, signInGoogle, reportProviderError } = useSocialAuth();
  const isGoogleLoading = loading === 'google';
  const isBusy = formDisabled || Boolean(loading);

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
      </div>
      {error ? <AuthErrorBanner message={error} /> : null}
    </div>
  );
}
