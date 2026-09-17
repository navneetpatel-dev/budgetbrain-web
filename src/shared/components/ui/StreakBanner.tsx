import { useTheme } from '@/shared/theme';

export interface StreakBannerProps {
  streakDays: number;
  tier?: string;
  message?: string;
}

export function StreakBanner({
  streakDays,
  tier = 'Tier 2',
  message,
}: StreakBannerProps) {
  const theme = useTheme();
  const defaultMessage = 'You are on a roll! Keep zero-spend habits going strong.';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 16,
        padding: '16px 20px',
        borderRadius: theme.radii.card,
        background: `linear-gradient(135deg, ${theme.colors.surface}, ${theme.colors.surfaceContainerHigh})`,
        border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
        boxShadow: theme.shadows.sm,
      }}
    >
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: 12,
          backgroundColor: theme.colors.warning + '24',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 22,
          flexShrink: 0,
        }}
      >
        🔥
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, marginBottom: 4 }}>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 14,
              fontWeight: 700,
              color: theme.colors.text,
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {streakDays} Days Zero-Spend Streak!
          </span>
          <span
            style={{
              fontFamily: 'Inter, sans-serif',
              fontSize: 10,
              fontWeight: 800,
              color: theme.colors.warning,
              backgroundColor: theme.colors.warning + '20',
              padding: '2px 8px',
              borderRadius: 9999,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              flexShrink: 0,
            }}
          >
            {tier}
          </span>
        </div>
        <p
          style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 12,
            color: theme.colors.textTertiary,
            margin: 0,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {message ?? defaultMessage}
        </p>
      </div>
    </div>
  );
}
