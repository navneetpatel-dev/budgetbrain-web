import { Link, useNavigate } from 'react-router-dom';
import { BackButton } from '@/shared/components/ui/feature-screen';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';
import { useAuthHeroHeight } from '@/shared/hooks/useSafeAreaInsets';
import { AuthHeroHeader } from './AuthHeroHeader';

const PHONE_SAFE_BOTTOM = 'max(calc(env(safe-area-inset-bottom, 0px) + 24px), 24px)';

function PanelEyebrow({ children }: { children: string }) {
  const theme = useTheme();
  return (
    <span style={{
      display: 'block',
      fontSize: theme.typography.label.fontSize, fontWeight: Number(theme.typography.label.fontWeight),
      letterSpacing: theme.typography.label.letterSpacing,
      color: theme.colors.primary, textTransform: 'capitalize',
      marginBottom: theme.spacing.lg,
      fontFamily: 'Inter, sans-serif',
    }}>{children}</span>
  );
}

function AuthSplitLayout({
  tagline,
  children,
  footer,
  panelTitle,
  leading,
}: {
  tagline?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelTitle?: string;
  leading?: React.ReactNode;
}) {
  const theme = useTheme();

  return (
    <div style={{
      minHeight: '100dvh',
      height: '100%',
      display: 'flex',
      backgroundColor: theme.colors.background,
    }}>
      <div style={{
        flex: '0 0 44%',
        maxWidth: 580,
        minWidth: 280,
        display: 'flex',
        flexDirection: 'column',
        alignSelf: 'stretch',
      }}>
        <AuthHeroHeader tagline={tagline} fullHeight branded />
      </div>
      <div style={{
        flex: 1,
        minWidth: 0,
        backgroundColor: theme.colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: `${theme.spacing.xxl}px ${theme.spacing.xl}px`,
        overflowY: 'auto',
      }}>
        <div style={{ width: '100%', maxWidth: 440 }}>
          {leading}
          {panelTitle ? <PanelEyebrow>{panelTitle}</PanelEyebrow> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            {children}
          </div>
          {footer && <div style={{ marginTop: theme.spacing.lg, display: 'flex', justifyContent: 'center' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

function PhoneHeroLayout({
  tagline,
  panelTitle,
  children,
  footer,
  leading,
}: {
  tagline?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  panelTitle?: string;
  leading?: React.ReactNode;
}) {
  const theme = useTheme();
  const heroHeight = useAuthHeroHeight();

  return (
    <div style={{
      minHeight: '100dvh',
      height: '100dvh',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: theme.colors.background,
      overflow: 'hidden',
    }}>
      <AuthHeroHeader tagline={tagline} height={heroHeight} compact branded />
      <div style={{
        flex: 1,
        minHeight: 0,
        backgroundColor: theme.colors.background,
        borderTopLeftRadius: 24,
        borderTopRightRadius: 24,
        boxShadow: '0 -8px 24px rgba(0,0,0,0.16)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          backgroundColor: theme.colors.border,
          margin: `${theme.spacing.md}px auto ${theme.spacing.sm}px`,
          flexShrink: 0,
        }} />
        <div style={{
          flex: 1,
          minHeight: 0,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
          padding: `${theme.spacing.lg}px ${theme.spacing.xl}px 0`,
          paddingBottom: PHONE_SAFE_BOTTOM,
        }}>
          {leading}
          {panelTitle ? <PanelEyebrow>{panelTitle}</PanelEyebrow> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
            {children}
          </div>
          {footer && <div style={{ marginTop: theme.spacing.lg, display: 'flex', justifyContent: 'center' }}>{footer}</div>}
        </div>
      </div>
    </div>
  );
}

export function AuthShell({
  children,
  footer,
  tagline,
  backHref,
  panelTitle,
}: {
  children: React.ReactNode;
  footer?: React.ReactNode;
  tagline?: string;
  backHref?: string;
  panelTitle?: string;
}) {
  const navigate = useNavigate();
  const { isTablet } = useResponsive();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else if (backHref) {
      navigate(backHref, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  };

  const leading = backHref ? (
    <div style={{ marginBottom: 16 }}>
      <BackButton onPress={handleBack} />
    </div>
  ) : undefined;

  if (isTablet) {
    return (
      <AuthSplitLayout tagline={tagline} panelTitle={panelTitle} footer={footer} leading={leading}>
        {children}
      </AuthSplitLayout>
    );
  }

  return (
    <PhoneHeroLayout tagline={tagline} panelTitle={panelTitle} footer={footer} leading={leading}>
      {children}
    </PhoneHeroLayout>
  );
}

export function AuthFooter({
  text,
  linkText,
  href,
  centered = true,
}: {
  text?: string;
  linkText: string;
  href: string;
  centered?: boolean;
}) {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'row',
      justifyContent: centered ? 'center' : 'flex-start',
      alignItems: 'center',
      flexWrap: 'wrap',
      gap: 4,
    }}>
      {text && (
        <span style={{ fontSize: theme.typography.bodyMedium.fontSize, fontWeight: Number(theme.typography.bodyMedium.fontWeight), color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
          {text}
        </span>
      )}
      <Link to={href} style={{ fontSize: theme.typography.bodySemibold.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>
        {linkText}
      </Link>
    </div>
  );
}

export function AuthLink({
  to,
  children,
  align = 'left',
}: {
  to: string;
  children: string;
  align?: 'left' | 'center' | 'right';
}) {
  const theme = useTheme();

  return (
    <Link
      to={to}
      style={{
        fontSize: theme.typography.bodySemibold.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), color: theme.colors.primary,
        fontFamily: 'Inter, sans-serif',
        display: 'block',
        textAlign: align,
        alignSelf: align === 'right' ? 'flex-end' : align === 'center' ? 'center' : 'flex-start',
        marginBottom: align === 'right' ? theme.spacing.sm : 0,
        marginTop: align === 'center' ? theme.spacing.md : 0,
      }}
    >
      {children}
    </Link>
  );
}
