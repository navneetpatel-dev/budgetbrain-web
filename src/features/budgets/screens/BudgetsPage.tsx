import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ProgressEntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { apiDelete } from '@/shared/services/api';
import { invalidateBudgetQueries, removeBudgetDetail } from '@/shared/services/queryInvalidation';
import { useBudgets } from '../hooks/useBudgets';
import type { Budget } from '@/shared/types';

export function BudgetsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const goBack = useStackBack('/dashboard');
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { data, isLoading, isError, refetch } = useBudgets();
  const budgets = data ?? [];

  const goToEdit = (id: string) => navigate(`/budget/${id}?edit=1`);

  const handleDelete = async (budget: Budget) => {
    if (!(await confirm(CONFIRM.deleteBudget(budget.name)))) return;
    try {
      await apiDelete(`/budgets/${budget.id}`);
      removeBudgetDetail(queryClient, budget.id);
      invalidateBudgetQueries(queryClient);
    } catch {
      // list refetch will surface stale errors on next load
    }
  };

  return (
    <>
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
          const effectiveAmount = b.effectiveAmount ?? b.amount;
          const pct = toSafePercent(b.spent, effectiveAmount);
          const color = pct >= 100 ? theme.colors.danger : pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.primary;
          const rolloverAmount = b.rolloverAmount ?? 0;
          const status = pct >= 100 ? 'Over budget' : pct >= (b.alertThreshold ?? 80) ? 'Near limit' : rolloverAmount !== 0 ? `${rolloverAmount > 0 ? '+' : '-'}${formatCurrency(Math.abs(rolloverAmount), b.currency)} rollover` : undefined;
          return (
            <ProgressEntityRow
              title={b.name}
              subtitle={`${b.type.charAt(0).toUpperCase()}${b.type.slice(1)}${b.category?.name ? ` · ${b.category.name}` : ' · All spending'}`}
              value={formatCurrency(b.spent ?? 0, b.currency)}
              secondaryValue={`/ ${formatCurrency(effectiveAmount, b.currency)}`}
              progress={pct}
              progressColor={color}
              footerLeft={`${pct}% used`}
              footerRight={status}
              onEdit={() => goToEdit(b.id)}
              onDelete={() => { void handleDelete(b); }}
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={4} variant="budget" />
          ) : isError ? (
            <EmptyState title="Couldn’t load budgets" subtitle="Check your connection and try again" icon="budgets" action="Retry" onAction={() => void refetch()} />
          ) : (
            <EmptyState title="No budgets yet" subtitle="Set spending limits to stay on track" icon="budgets" action="Create budget" onAction={() => navigate('/budget/add')} />
          )
        }
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
