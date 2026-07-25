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
}

export function CategoryChart({ data, currency }: Props) {
  const theme = useTheme();
  const items = useMemo(() => buildCategoryChartItems(data), [data]);

  if (!data.length) {
    return (
      <div style={{ padding: `${theme.spacing.xl}px 0`, textAlign: 'center' }}>
        <div style={{
          width: 52, height: 52, borderRadius: 26, margin: '0 auto 12px',
          backgroundColor: theme.colors.primarySoft,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <AppIcon name="chart" size={24} color={theme.colors.primary} />
        </div>
        <span style={{ display: 'block', ...bodyMedium(theme) }}>
          No spending data yet
        </span>
        <span style={{ display: 'block', ...caption(theme), marginTop: 4 }}>
          Add expenses to see your breakdown
        </span>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
      {items.map((item) => (
        <div key={item.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.sm, marginBottom: 8 }}>
            <div style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: item.color, flexShrink: 0 }} />
            <span style={{
              flex: 1, ...bodyMedium(theme),
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
            }}>{item.name}</span>
            <span style={{ ...caption(theme), fontWeight: 600 }}>
              {item.pct}%
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
            <div style={{ flex: 1 }}>
              <ProgressBar progress={item.pct} color={item.color} height={8} />
            </div>
            <span style={{
              ...caption(theme, theme.colors.textSecondary),
              fontWeight: 600, minWidth: 64, textAlign: 'right',
              fontVariantNumeric: 'tabular-nums',
            }}>
              {formatCurrency(item.total, currency)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
