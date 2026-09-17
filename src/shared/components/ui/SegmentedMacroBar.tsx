import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';

export interface MacroCategoryItem {
  id: string;
  name: string;
  amount: number;
  pct: number;
  color: string;
}

export interface SegmentedMacroBarProps {
  items: MacroCategoryItem[];
  currency?: string;
  onItemPress?: (id: string) => void;
  showLegend?: boolean;
}

export function SegmentedMacroBar({
  items,
  currency = 'INR',
  onItemPress,
  showLegend = true,
}: SegmentedMacroBarProps) {
  const theme = useTheme();

  if (!items.length) {
    return (
      <div style={{ padding: '16px 0', textAlign: 'center', color: theme.colors.textTertiary, fontSize: 13, fontFamily: 'Inter, sans-serif' }}>
        No category distribution yet
      </div>
    );
  }

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      {/* Segmented Bar */}
      <div style={{
        width: '100%',
        height: 10,
        borderRadius: 6,
        display: 'flex',
        overflow: 'hidden',
        backgroundColor: theme.colors.surfaceContainerHighest,
        gap: 2,
      }}>
        {items.map((item, index) => {
          const isFirst = index === 0;
          const isLast = index === items.length - 1;
          return (
            <div
              key={item.id}
              style={{
                width: `${Math.max(2, item.pct)}%`,
                height: '100%',
                backgroundColor: item.color,
                borderTopLeftRadius: isFirst ? 6 : 0,
                borderBottomLeftRadius: isFirst ? 6 : 0,
                borderTopRightRadius: isLast ? 6 : 0,
                borderBottomRightRadius: isLast ? 6 : 0,
                transition: 'width 0.4s ease',
              }}
              title={`${item.name}: ${formatCurrency(item.amount, currency)} (${item.pct}%)`}
            />
          );
        })}
      </div>

      {/* Category Legend Grid */}
      {showLegend && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
          gap: '8px 16px',
        }}>
          {items.map((item) => (
            <button
              key={item.id}
              onClick={() => onItemPress?.(item.id)}
              disabled={!onItemPress}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '6px 8px',
                borderRadius: 8,
                background: 'transparent',
                border: 'none',
                cursor: onItemPress ? 'pointer' : 'default',
                textAlign: 'left',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minWidth: 0 }}>
                <span style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: item.color,
                  flexShrink: 0,
                }} />
                <span style={{
                  fontFamily: 'Inter, sans-serif',
                  fontSize: 12,
                  fontWeight: 600,
                  color: theme.colors.textSecondary,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item.name}
                </span>
              </div>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
                fontWeight: 700,
                color: theme.colors.text,
                fontVariantNumeric: 'tabular-nums',
                marginLeft: 8,
                flexShrink: 0,
              }}>
                {formatCurrency(item.amount, currency)}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
