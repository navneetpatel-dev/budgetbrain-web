import { AppIcon, type AppIconName } from './icons/AppIcon';
import { useTheme } from '@/shared/theme';

export function ListRow({ icon, label, value, onPress, destructive }: {
  icon?: AppIconName; label: string; value?: string;
  onPress?: () => void; destructive?: boolean;
}) {
  const theme = useTheme();

  return (
    <button
      onClick={onPress}
      style={{
        width: '100%', display: 'flex', alignItems: 'center', gap: theme.spacing.md,
        padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
        cursor: onPress ? 'pointer' : 'default', background: 'none', border: 'none',
        textAlign: 'left', fontFamily: 'Inter, sans-serif',
        borderBottom: `1px solid ${theme.colors.borderSubtle}`,
      }}
    >
      {icon && (
        <div style={{
          width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: destructive ? theme.colors.dangerSoft : theme.colors.primarySoft,
        }}>
          <AppIcon name={icon} size={18} color={destructive ? theme.colors.danger : theme.colors.primary} />
        </div>
      )}
      <span style={{
        flex: 1, fontSize: theme.typography.body.fontSize,
        fontWeight: Number(theme.typography.body.fontWeight),
        color: destructive ? theme.colors.danger : theme.colors.text,
      }}>{label}</span>
      {value && (
        <span style={{
          fontSize: theme.typography.bodyMedium.fontSize,
          fontWeight: Number(theme.typography.bodyMedium.fontWeight),
          color: theme.colors.textSecondary,
        }}>{value}</span>
      )}
      {onPress && <AppIcon name="chevronRight" size={16} color={theme.colors.textTertiary} />}
    </button>
  );
}
