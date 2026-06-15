import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

function roleLabel(role?: string) {
  switch (role) {
    case 'admin': return 'Admin';
    case 'premium': return 'Premium';
    case 'lifetime': return 'Lifetime';
    default: return 'Free plan';
  }
}

function roleColors(role: string | undefined, isDark: boolean, colors: ReturnType<typeof useTheme>['colors']) {
  switch (role) {
    case 'admin':
      return { bg: colors.warningSoft, text: colors.warning, border: colors.warning + '44' };
    case 'premium':
    case 'lifetime':
      return { bg: colors.primarySoft, text: colors.primary, border: colors.primary + '44' };
    default:
      return {
        bg: isDark ? 'rgba(255,255,255,0.08)' : colors.surfaceHover,
        text: colors.textSecondary,
        border: isDark ? 'rgba(255,255,255,0.1)' : colors.border,
      };
  }
}

export function ProfileHero({
  name,
  email,
  role,
  currency,
  onEditPress,
}: {
  name: string;
  email?: string;
  role?: string;
  currency?: string;
  onEditPress?: () => void;
}) {
  const theme = useTheme();
  const { tabBarPaddingX, contentMaxWidth, isDesktop } = useResponsive();
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const badge = roleColors(role, theme.isDark, theme.colors);

  return (
    <div style={{
      position: 'relative',
      overflow: 'hidden',
      paddingTop: isDesktop ? 28 : 16,
      paddingBottom: theme.spacing.lg,
      paddingLeft: tabBarPaddingX,
      paddingRight: tabBarPaddingX,
      borderBottomLeftRadius: theme.radii.xl,
      borderBottomRightRadius: theme.radii.xl,
      maxWidth: contentMaxWidth ?? '100%',
      marginLeft: 'auto',
      marginRight: 'auto',
      width: '100%',
    }}>
      <div style={{
        position: 'absolute', inset: 0,
        background: `linear-gradient(135deg, ${theme.colors.gradientStart}, ${theme.colors.primary}, ${theme.colors.gradientEnd})`,
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(180deg, rgba(255,255,255,0.14) 0%, transparent 70%)',
        pointerEvents: 'none',
      }} />
      <div style={{ position: 'absolute', width: 120, height: 120, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', top: -30, right: -40, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', width: 80, height: 80, borderRadius: '50%', backgroundColor: 'rgba(255,255,255,0.07)', bottom: -20, left: -20, pointerEvents: 'none' }} />

      <div style={{ position: 'relative', display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
        <div style={{ borderRadius: 999, padding: 2, background: 'linear-gradient(135deg, rgba(255,255,255,0.5), rgba(255,255,255,0.12))' }}>
          <div style={{
            width: 56, height: 56, borderRadius: 28,
            backgroundColor: 'rgba(255,255,255,0.18)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <span style={{ color: '#fff', fontSize: 22, fontWeight: 800, fontFamily: 'Inter, sans-serif' }}>{initial}</span>
          </div>
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <span style={{ display: 'block', color: '#fff', fontSize: 20, fontWeight: 800, letterSpacing: -0.3, fontFamily: 'Inter, sans-serif' }}>{name}</span>
          {email && (
            <span style={{ display: 'block', color: 'rgba(255,255,255,0.78)', fontSize: 13, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{email}</span>
          )}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
            <span style={{
              padding: '3px 8px', borderRadius: theme.radii.full,
              backgroundColor: badge.bg, border: `1px solid ${badge.border}`,
              fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: badge.text, fontFamily: 'Inter, sans-serif',
            }}>{roleLabel(role).toUpperCase()}</span>
            {currency && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 4,
                padding: '3px 8px', borderRadius: theme.radii.full,
                backgroundColor: 'rgba(255,255,255,0.14)',
                fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif',
              }}>
                <AppIcon name="piggyBank" size={11} color="rgba(255,255,255,0.85)" />
                {currency}
              </span>
            )}
          </div>
        </div>

        {onEditPress ? (
          <button
            type="button"
            onClick={onEditPress}
            aria-label="Edit profile"
            style={{
              width: 38, height: 38, borderRadius: 19, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              backgroundColor: 'rgba(255,255,255,0.14)', border: 'none', cursor: 'pointer',
            }}
          >
            <AppIcon name="settings" size={18} color="rgba(255,255,255,0.95)" />
          </button>
        ) : null}
      </div>
    </div>
  );
}
