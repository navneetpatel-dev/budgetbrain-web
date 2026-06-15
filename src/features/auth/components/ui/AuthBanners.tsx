import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

export function AuthSuccessBanner({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: theme.spacing.md,
      backgroundColor: theme.colors.successSoft,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      border: `1px solid ${theme.colors.success}33`,
      marginBottom: theme.spacing.lg,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
        backgroundColor: theme.colors.success + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AppIcon name="checkmark" size={22} color={theme.colors.success} />
      </div>
      <p style={{
        fontSize: 15, fontWeight: 500, color: theme.colors.text,
        lineHeight: '22px', margin: 0, fontFamily: 'Inter, sans-serif',
      }}>{message}</p>
    </div>
  );
}

export function AuthInfoBanner({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: theme.spacing.md,
      backgroundColor: theme.colors.primarySoft,
      borderRadius: theme.radii.lg,
      padding: theme.spacing.lg,
      border: `1px solid ${theme.colors.primary}22`,
      marginBottom: theme.spacing.lg,
    }}>
      <div style={{
        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
        backgroundColor: theme.colors.primary + '18',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AppIcon name="notification" size={20} color={theme.colors.primary} />
      </div>
      <p style={{
        fontSize: 15, fontWeight: 500, color: theme.colors.text,
        lineHeight: '22px', margin: 0, fontFamily: 'Inter, sans-serif',
      }}>{message}</p>
    </div>
  );
}
