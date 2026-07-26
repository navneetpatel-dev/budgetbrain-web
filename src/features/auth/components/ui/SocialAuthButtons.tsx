import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useTheme } from '@/shared/theme';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth';
// import { isAppleSignInConfigured } from '@/features/auth/services/appleAuth.service';
import { AuthDivider } from './AuthDivider';
import { AuthErrorBanner } from './AuthBanners';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const googleEnabled = Boolean(GOOGLE_CLIENT_ID?.trim());
// const appleEnabled = isAppleSignInConfigured();
const appleEnabled = false; // temporarily hide Apple login

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

/* restore with Apple button
function AppleMark({ color }: { color: string }) {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill={color} aria-hidden>
      <path d="M16.365 1.43c0 1.14-.42 2.2-1.2 3.03-.9.97-2.4 1.72-3.66 1.62-.15-1.1.4-2.28 1.18-3.1.9-.96 2.45-1.66 3.68-1.55zM20.9 17.3c-.55 1.27-.82 1.84-1.54 2.96-1 1.56-2.4 3.5-4.15 3.52-1.55.03-1.95-1.02-4.06-1.01-2.1.01-2.55 1.04-4.1 1.01-1.74-.03-3.07-1.77-4.07-3.33C1.1 17.6.1 13.4 1.86 10.4c.98-1.68 2.73-2.74 4.63-2.77 1.72-.03 3.34 1.16 4.05 1.16.7 0 2.7-1.43 4.56-1.22.78.03 2.96.31 4.36 2.36-3.7 2.03-3.1 7.3.44 7.37z" />
    </svg>
  );
}
*/

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

export function SocialAuthButtons({ disabled: formDisabled }: { disabled?: boolean }) {
  const theme = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const { loading, error, clearError, signInGoogle, reportProviderError } = useSocialAuth();
  // const { signInApple } = useSocialAuth(); // restore with Apple button
  const isGoogleLoading = loading === 'google';
  // const isAppleLoading = loading === 'apple';
  const isBusy = formDisabled || !!loading;

  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      setWidth(Math.floor(entry.contentRect.width));
    });
    ro.observe(el);
    setWidth(el.offsetWidth);
    return () => ro.disconnect();
  }, []);

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

  const onGoogleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) return;
    clearError();
    try {
      await signInGoogle(response.credential);
    } catch {
      // Error message is set in useSocialAuth
    }
  };

  const onGoogleUnavailable = () => {
    reportProviderError('google', new Error('VITE_GOOGLE_CLIENT_ID is not configured'));
  };

  // const onAppleUnavailable = () => {
  //   reportProviderError('apple', new Error('VITE_APPLE_CLIENT_ID is not configured'));
  // };

  const onGoogleError = () => {
    reportProviderError('google', new Error('popup_closed'));
  };

  // const onAppleClick = () => {
  //   if (!appleEnabled) {
  //     onAppleUnavailable();
  //     return;
  //   }
  //   if (isBusy) return;
  //   clearError();
  //   void signInApple();
  // };

  // Google overlay needs full row width when Apple is absent; half when both show.
  const googleOverlayWidth = appleEnabled
    ? Math.max(Math.floor((width - 8) / 2), 140)
    : Math.max(width, 240);

  return (
    <div ref={wrapRef} style={{ marginTop: theme.spacing.lg }}>
      <AuthDivider label="or sign in with" />
      <div style={{ display: 'flex', gap: theme.spacing.sm, width: '100%' }}>
        <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
          {googleEnabled ? (
            <div style={{
              position: 'absolute',
              inset: 0,
              zIndex: 2,
              opacity: 0.01,
              overflow: 'hidden',
              pointerEvents: isBusy ? 'none' : 'auto',
            }}>
              <GoogleLogin
                onSuccess={onGoogleSuccess}
                onError={onGoogleError}
                useOneTap={false}
                theme={theme.isDark ? 'filled_black' : 'outline'}
                size="large"
                text="signin_with"
                width={String(googleOverlayWidth)}
              />
            </div>
          ) : null}
          <button
            type="button"
            onClick={googleEnabled ? undefined : onGoogleUnavailable}
            disabled={isBusy}
            style={{
              ...shellStyle,
              margin: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
              opacity: isBusy ? 0.6 : 1,
              cursor: googleEnabled ? 'default' : 'pointer',
              pointerEvents: googleEnabled ? 'none' : 'auto',
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
        </div>

        {/* Apple login temporarily disabled
        <button
          type="button"
          onClick={onAppleClick}
          disabled={isBusy}
          style={{
            ...shellStyle,
            flex: 1,
            minWidth: 0,
            margin: 0,
            appearance: 'none',
            WebkitAppearance: 'none',
            opacity: isBusy ? 0.6 : 1,
            cursor: isBusy ? 'not-allowed' : 'pointer',
          }}
        >
          {isAppleLoading ? (
            <>
              <Spinner color={theme.colors.primary} />
              <span>Signing in…</span>
            </>
          ) : (
            <>
              <AppleMark color={theme.colors.text} />
              <span>Apple</span>
            </>
          )}
        </button>
        */}
      </div>
      {error ? <AuthErrorBanner message={error} /> : null}
    </div>
  );
}
