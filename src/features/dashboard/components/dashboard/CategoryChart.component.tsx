import { useMemo } from 'react';
import { ProgressBar } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { caption, bodyMedium } from '@/shared/theme/textStyles';
import { formatCurrency } from '@/shared/utils/currency';
import { buildCategoryChartItems, type CategoryChartInput } from '@/shared/utils/categoryChart';

interface Props {
  data: CategoryChartInput[];
  currency: string;
  onCategoryPress?: (categoryId: string) => void;
}

export function CategoryChart({ data, currency, onCategoryPress }: Props) {
  const theme = useTheme();
  const items = useMemo(() => buildCategoryChartItems(data), [data]);

  if (!data.length) {
    return (
      <div style={{ padding: `${theme.spacing.lg}px`, textAlign: 'center' }}>
        <div style={{
          width: 48, height: 48, borderRadius: 24, margin: '0 auto 8px',
          backgroundColor: theme.colors.primarySoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AppIcon name="chart" size={22} color={theme.colors.primary} />
        </div>
        <span style={{ display: 'block', ...bodyMedium(theme), fontWeight: 600 }}>
          No spending data yet
        </span>
        <span style={{ display: 'block', ...caption(theme), marginTop: 4 }}>
          Add expenses to see your breakdown
        </span>
      </div>
    );
  }

  return (
    <div>
      {items.map((item, i) => {
        const content = (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, flexShrink: 0 }} />
              <span style={{
                flex: 1,
                fontFamily: 'Inter, sans-serif',
                fontSize: 15,
                fontWeight: 600,
                letterSpacing: -0.1,
                color: theme.colors.text,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}>{item.name}</span>
              <span style={{
                fontFamily: 'Inter, sans-serif',
                fontSize: 13,
                fontWeight: 600,
                color: theme.colors.textSecondary,
                fontVariantNumeric: 'tabular-nums',
              }}>
                {item.pct}%
              </span>
            </div>
            <ProgressBar progress={item.pct} color={item.color} height={6} />
            <span style={{
              display: 'block',
              marginTop: 8,
              fontFamily: 'Inter, sans-serif',
              fontSize: 12,
              fontWeight: 500,
              color: theme.colors.textTertiary,
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCurrency(item.total, currency)}
            </span>
          </>
        );

        const rowStyle = {
          padding: `${i === 0 || i === items.length - 1 ? theme.spacing.md : 14}px ${theme.spacing.lg}px`,
          paddingTop: i === 0 ? theme.spacing.md : 14,
          paddingBottom: i === items.length - 1 ? theme.spacing.md : 14,
          borderBottom: i < items.length - 1 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
        } as const;

        if (!onCategoryPress) {
          return <div key={item.id} style={rowStyle}>{content}</div>;
        }

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onCategoryPress(item.id)}
            style={{
              ...rowStyle,
              width: '100%',
              borderTop: 'none',
              borderLeft: 'none',
              borderRight: 'none',
              background: 'none',
              textAlign: 'left',
              cursor: 'pointer',
              font: 'inherit',
            }}
            aria-label={`View ${item.name} transactions`}
          >
            {content}
          </button>
        );
      })}
    </div>
  );
}
