import { AppIcon, type AppIconName } from '@/shared/components/ui/icons/AppIcon';

export const AUTH_FEATURES: { icon: AppIconName; text: string }[] = [
  { icon: 'shield', text: 'Bank-grade security' },
  { icon: 'chart', text: 'Smart spending insights' },
  { icon: 'target', text: 'Reach your goals' },
  { icon: 'sparkles', text: 'AI budgeting tips' },
];

const COMPACT_LABELS: Record<string, string> = {
  'Bank-grade security': 'Secure',
  'Smart spending insights': 'Insights',
  'Reach your goals': 'Goals',
  'AI budgeting tips': 'AI tips',
};

export function AuthFeatureTicker({ compact = false }: { compact?: boolean }) {
  const items = [...AUTH_FEATURES, ...AUTH_FEATURES];

  return (
    <div
      className="auth-feature-ticker"
      style={{
        width: '100%',
        overflow: 'hidden',
        marginTop: compact ? 12 : 16,
      }}
    >
      <div className="auth-feature-ticker-track" style={{ gap: compact ? 14 : 22 }}>
        {items.map((item, i) => (
          <span
            key={`${item.text}-${i}`}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 5,
              flexShrink: 0,
              padding: compact ? '4px 10px' : '5px 12px',
              borderRadius: 999,
              backgroundColor: 'rgba(255,255,255,0.11)',
              border: '1px solid rgba(255,255,255,0.15)',
              fontSize: compact ? 11 : 12,
              fontWeight: 600,
              color: 'rgba(255,255,255,0.9)',
              fontFamily: 'Inter, sans-serif',
              whiteSpace: 'nowrap',
            }}
          >
            <AppIcon name={item.icon} size={compact ? 12 : 13} color="rgba(255,255,255,0.95)" />
            {compact ? COMPACT_LABELS[item.text] ?? item.text : item.text}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Breaks out of parent horizontal padding so the ticker spans the full hero width. */
export function AuthFeatureTickerRail({
  padX,
  compact = false,
}: {
  padX: number;
  compact?: boolean;
}) {
  return (
    <div
      style={{
        alignSelf: 'stretch',
        width: `calc(100% + ${padX * 2}px)`,
        marginLeft: -padX,
        marginRight: -padX,
        overflow: 'hidden',
      }}
    >
      <AuthFeatureTicker compact={compact} />
    </div>
  );
}
