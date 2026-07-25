import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { useResponsive } from '@/shared/hooks/useResponsive';

export function ProfileHero({
  name,
  email,
  role,
  currency,
}: {
  name: string;
  email?: string;
  role?: string;
  currency?: string;
}) {
  const theme = useTheme();
  const { tabBarPaddingX, contentMaxWidth, isDesktop } = useResponsive();
  const initial = name?.[0]?.toUpperCase() ?? '?';
  const isAdmin = role === 'admin';

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
          {(isAdmin || currency) && (
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
              {isAdmin && (
                <span style={{
                  padding: '3px 8px', borderRadius: theme.radii.full,
                  backgroundColor: theme.colors.warningSoft, border: `1px solid ${theme.colors.warning}44`,
                  fontSize: 10, fontWeight: 800, letterSpacing: 0.6, color: theme.colors.warning, fontFamily: 'Inter, sans-serif',
                }}>ADMIN</span>
              )}
              {currency && (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', gap: 4,
                  padding: '3px 8px', borderRadius: theme.radii.full,
                  backgroundColor: 'rgba(255,255,255,0.14)',
                  fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.9)', fontFamily: 'Inter, sans-serif',
                }}>
                  <AppIcon name="wallet" size={11} color="rgba(255,255,255,0.85)" />
                  {currency}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
