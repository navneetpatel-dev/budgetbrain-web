import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ProgressEntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useBudgets } from '../hooks/useBudgets';
import type { Budget } from '@/shared/types';

export function BudgetsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const goBack = useStackBack('/dashboard');
  const { data, isLoading } = useBudgets();
  const budgets = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Plan"
          title="Budgets"
          subtitle={isLoading ? 'Loading…' : `${budgets.length} active`}
          actionIcon="add"
          actionLabel="Create budget"
          onAction={() => navigate('/budget/add')}
        />
      }
      data={isLoading ? [] : budgets}
      keyExtractor={(b: Budget) => b.id}
      renderItem={(b) => {
        const pct = toSafePercent(b.spent, b.amount);
        const color = pct >= 100 ? theme.colors.danger : pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.success;
        const status = pct >= 100 ? 'Over budget' : pct >= (b.alertThreshold ?? 80) ? 'Near limit' : undefined;
        return (
          <ProgressEntityRow
            title={b.name}
            subtitle={`${b.type}${b.category?.name ? ` · ${b.category.name}` : ''}`}
            value={formatCurrency(b.spent ?? 0, b.currency)}
            secondaryValue={`/ ${formatCurrency(b.amount, b.currency)}`}
            progress={pct}
            progressColor={color}
            footerLeft={`${pct}% used`}
            footerRight={status}
            onPress={() => navigate(`/budget/${b.id}`)}
          />
        );
      }}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="budget" />
        ) : (
          <EmptyState title="No budgets yet" subtitle="Set spending limits to stay on track" icon="budgets" action="Create budget" onAction={() => navigate('/budget/add')} />
        )
      }
    />
  );
}
