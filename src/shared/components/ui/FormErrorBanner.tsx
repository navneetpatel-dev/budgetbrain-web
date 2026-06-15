import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';

/** Inline form / API error — matches auth banner styling. */
export function FormErrorBanner({ message }: { message: string }) {
  const theme = useTheme();

  return (
    <div
      role="alert"
      style={{
        display: 'flex', alignItems: 'center', gap: theme.spacing.md,
        backgroundColor: theme.colors.dangerSoft,
        borderRadius: theme.radii.lg,
        padding: theme.spacing.lg,
        border: `1px solid ${theme.colors.danger}33`,
        marginTop: theme.spacing.md,
        marginBottom: theme.spacing.lg,
      }}
    >
      <div style={{
        width: 40, height: 40, borderRadius: 20, flexShrink: 0,
        backgroundColor: theme.colors.danger + '22',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <AppIcon name="notification" size={20} color={theme.colors.danger} />
      </div>
      <p style={{
        fontSize: 15, fontWeight: 500, color: theme.colors.text,
        lineHeight: '22px', margin: 0, fontFamily: 'Inter, sans-serif',
      }}>{message}</p>
    </div>
  );
}
