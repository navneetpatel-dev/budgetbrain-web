import { useEffect, useMemo, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useTheme } from '@/shared/theme';
import { useSocialAuth } from '@/features/auth/hooks/useSocialAuth';
import { AuthDivider } from './AuthDivider';
import { AuthErrorBanner } from './AuthBanners';

const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
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

function SocialAuthError({ message }: { message: string }) {
  return <AuthErrorBanner message={message} />;
}

export function SocialAuthButtons() {
  const theme = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(320);
  const { loading, error, clearError, signInGoogle, reportProviderError } = useSocialAuth();
  const isGoogleLoading = loading === 'google';

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
    opacity: isGoogleLoading ? 0.6 : 1,
    pointerEvents: googleEnabled ? ('none' as const) : undefined,
    cursor: googleEnabled ? undefined : 'pointer',
  }), [theme, isGoogleLoading]);

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

  const onGoogleError = () => {
    reportProviderError('google', new Error('popup_closed'));
  };

  return (
    <div ref={wrapRef} style={{ marginTop: theme.spacing.lg }}>
      <AuthDivider label="or sign in with" />
      <div style={{ position: 'relative', width: '100%' }}>
        {googleEnabled ? (
          <div style={{
            position: 'absolute',
            inset: 0,
            zIndex: 2,
            opacity: 0.01,
            overflow: 'hidden',
          }}>
            <GoogleLogin
              onSuccess={onGoogleSuccess}
              onError={onGoogleError}
              useOneTap={false}
              theme={theme.isDark ? 'filled_black' : 'outline'}
              size="large"
              text="signin_with"
              width={String(Math.max(width, 240))}
            />
          </div>
        ) : (
          <button
            type="button"
            onClick={onGoogleUnavailable}
            style={{
              ...shellStyle,
              margin: 0,
              appearance: 'none',
              WebkitAppearance: 'none',
            }}
          >
            <GoogleMark />
            <span>Google</span>
          </button>
        )}
        {googleEnabled ? (
          <div style={shellStyle}>
            {isGoogleLoading ? (
              <span style={{ color: theme.colors.primary, fontSize: 14 }}>Signing in…</span>
            ) : (
              <>
                <GoogleMark />
                <span>Google</span>
              </>
            )}
          </div>
        ) : null}
      </div>
      {error ? <SocialAuthError message={error} /> : null}
    </div>
  );
}
