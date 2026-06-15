import { useTheme } from '@/shared/theme';

export function AuthDivider({ label = 'or continue with' }: { label?: string }) {
  const theme = useTheme();

  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      margin: `${theme.spacing.lg}px 0`,
      gap: theme.spacing.md,
    }}>
      <div style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
      <span style={{
        fontSize: 12,
        fontWeight: 500,
        color: theme.colors.textTertiary,
        fontFamily: 'Inter, sans-serif',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 1, backgroundColor: theme.colors.border }} />
    </div>
  );
}
