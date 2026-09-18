'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState, RingGauge, FilterChipsRail } from '@/shared/components/ui/index';
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
  const router = useRouter();
  const queryClient = useQueryClient();
  const goBack = useStackBack('/dashboard');
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { data, isLoading, isError, refetch } = useBudgets();
  const budgets = data ?? [];

  const goToEdit = (id: string) => router.push(`/budget/${id}?edit=1`);

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

  const [activeFilter, setActiveFilter] = useState('active');

  // KNOWN-GAP(money-math): this page-level spent/limit summary (and the
  // overallProgress/dailySafe figures derived from it below) is computed
  // client-side from the fetched budget list; the Budget model has no
  // server-computed aggregate/percentage field (unlike Goal's
  // progressPercentage). See implementation-plan/web/18-money-math-lint-guardrail.md.
  const { totalSpent, totalLimit, overallProgress, currency } = useMemo(() => {
    let spent = 0;
    let limit = 0;
    let curr = 'INR';

    budgets.forEach((b) => {
      curr = b.currency || curr;
      // eslint-disable-next-line no-restricted-syntax
      spent += b.spent ?? 0;
      limit += Number(b.effectiveAmount ?? b.amount) || 0;
    });

    // eslint-disable-next-line no-restricted-syntax
    const prog = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
    return { totalSpent: spent, totalLimit: limit, overallProgress: prog, currency: curr };
  }, [budgets]);

  // eslint-disable-next-line no-restricted-syntax
  const dailySafe = totalLimit > totalSpent ? (totalLimit - totalSpent) / 30 : 0;

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
            onAction={() => router.push('/budget/add')}
            footer={
              <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
                <div style={{
                  position: 'relative',
                  borderRadius: theme.radii.card,
                  padding: '20px',
                  backgroundColor: theme.colors.surface,
                  border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                  boxShadow: theme.shadows.md,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  overflow: 'hidden',
                }}>
                  <div>
                    <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>
                      Total Budget Consumed
                    </span>
                    <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 4 }}>
                      <span style={{ fontSize: 24, fontWeight: 800, color: theme.colors.text, fontVariantNumeric: 'tabular-nums', fontFamily: 'Inter, sans-serif' }}>
                        {formatCurrency(totalSpent, currency)}
                      </span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>
                        / {formatCurrency(totalLimit, currency)}
                      </span>
                    </div>
                    <span style={{ display: 'block', fontSize: 11, fontWeight: 600, color: theme.colors.secondaryFixed, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>
                      Safe daily spend: ~{formatCurrency(dailySafe, currency)}/day
                    </span>
                  </div>

                  <RingGauge
                    size={68}
                    strokeWidth={5.5}
                    progress={overallProgress}
                    centerText={`${overallProgress}%`}
                    gradientColors={overallProgress >= 100 ? [theme.colors.danger, theme.colors.warning] : [theme.colors.secondary, theme.colors.primary]}
                  />
                </div>

                <FilterChipsRail
                  chips={[
                    { id: 'active', label: `Active (${budgets.length})` },
                    { id: 'custom', label: 'Custom' },
                    { id: 'archived', label: 'Archived' },
                  ]}
                  selectedId={activeFilter}
                  onSelect={setActiveFilter}
                />
              </div>
            }
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
            <EmptyState title="No budgets yet" subtitle="Set spending limits to stay on track" icon="budgets" action="Create budget" onAction={() => router.push('/budget/add')} />
          )
        }
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
