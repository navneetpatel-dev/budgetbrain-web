import { useMemo } from 'react';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { AuthFeatureTickerRail } from '../ui/AuthFeatureTicker';

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

export function AuthHeroHeader({
  fullHeight = false,
  compact = false,
  branded = true,
  tagline,
  height,
}: {
  fullHeight?: boolean;
  compact?: boolean;
  branded?: boolean;
  tagline?: string;
  height?: string;
  topInset?: number;
}) {
  const theme = useTheme();
  const greeting = useMemo(() => getGreeting(), []);
  const heroTagline = tagline ?? `${greeting} · Welcome back`;

  const padX = branded ? (compact ? theme.spacing.lg : theme.spacing.xxl) : compact ? theme.spacing.lg : theme.spacing.xl;
  const logoSize = branded ? (compact ? 40 : 52) : compact ? 44 : 60;
  const logoRadius = branded ? (compact ? 12 : 15) : compact ? 14 : 18;
  const ringRadius = branded ? (compact ? 16 : 20) : compact ? 18 : 24;
  const iconSize = branded ? (compact ? 20 : 26) : compact ? 22 : 28;
  const titleSize = branded ? (compact ? 22 : 28) : compact ? 26 : 32;
  const taglineSize = branded ? (compact ? 11 : 13) : 13;

  const logo = (
    <div style={{
      padding: 2,
      borderRadius: ringRadius,
      border: '1px solid rgba(255,255,255,0.22)',
      flexShrink: 0,
    }}>
      <div style={{
        width: logoSize, height: logoSize, borderRadius: logoRadius,
        backgroundColor: 'rgba(255,255,255,0.16)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AppIcon name="piggyBank" size={iconSize} color="#fff" />
      </div>
    </div>
  );

  const titleEl = (
    <h1 style={{
      fontSize: titleSize,
      fontWeight: 800,
      color: '#fff',
      letterSpacing: -0.5,
      textAlign: 'center',
      margin: 0,
      fontFamily: 'Inter, sans-serif',
      lineHeight: 1.1,
    }}>
      Budget<span style={{ color: 'rgba(255,255,255,0.92)' }}>Brain</span>
    </h1>
  );

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      width: '100%',
      height: fullHeight ? '100%' : height,
      minHeight: fullHeight ? '100%' : undefined,
      flexShrink: fullHeight ? undefined : 0,
      display: 'flex',
      flexDirection: 'column',
      flex: fullHeight ? 1 : undefined,
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.gradientEnd})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 65%)',
        pointerEvents: 'none',
      }} />
      {branded && (
        <div style={{ position: 'absolute', width: 140, height: 140, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.06)', top: -50, right: -40, pointerEvents: 'none' }} />
      )}

      <div style={{
        position: 'relative',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: branded ? 'stretch' : 'center',
        justifyContent: 'center',
        paddingLeft: padX,
        paddingRight: padX,
        paddingTop: fullHeight
          ? theme.spacing.xxl
          : `calc(env(safe-area-inset-top, 0px) + 10px)`,
        paddingBottom: branded ? (compact ? theme.spacing.lg : theme.spacing.xl) : theme.spacing.xxl + 8,
        width: '100%',
      }}>
        {branded ? (
          <>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              alignSelf: 'center',
              width: '100%',
              maxWidth: fullHeight ? 320 : undefined,
              gap: compact ? 6 : 8,
            }}>
              {logo}
              {titleEl}
              <p style={{
                margin: 0,
                fontSize: taglineSize,
                fontWeight: 500,
                color: 'rgba(255,255,255,0.75)',
                fontFamily: 'Inter, sans-serif',
                lineHeight: 1.3,
                textAlign: 'center',
                letterSpacing: 0.15,
              }}>
                {heroTagline}
              </p>
            </div>
            <div style={{ marginTop: compact ? theme.spacing.md : theme.spacing.lg }}>
              <AuthFeatureTickerRail padX={padX} compact={compact} />
            </div>
          </>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            width: '100%',
          }}>
            {logo}
            {titleEl}
          </div>
        )}
      </div>
    </div>
  );
}
