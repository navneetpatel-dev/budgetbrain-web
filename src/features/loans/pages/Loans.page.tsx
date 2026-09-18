'use client';

import { useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, BentoCard } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { ProgressEntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { apiDelete } from '@/shared/services/api';
import { invalidateLoanQueries, removeLoanDetail } from '@/shared/services/queryInvalidation';
import { useLoans } from '../hooks/useLoans';
import type { Loan } from '@/shared/types';

export function LoansPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { data, isLoading, isError, refetch } = useLoans();
  const loans = data ?? [];

  // KNOWN-GAP(money-math): totals below sum already-server-computed per-loan
  // fields (principal, remainingBalance) into a page-level aggregate; the API
  // has no summary endpoint for the loans list yet (unlike Expenses, per
  // implementation-plan/backend/14 — that fix didn't add a loans equivalent).
  // See implementation-plan/web/18-money-math-lint-guardrail.md.
  const { totalOutstanding, totalPrincipal, currency } = useMemo(() => {
    let outstanding = 0;
    let principal = 0;
    let curr = 'INR';
    loans.forEach((l) => {
      curr = l.currency || curr;
      // eslint-disable-next-line no-restricted-syntax
      outstanding += l.remainingBalance;
      // eslint-disable-next-line no-restricted-syntax
      principal += l.principal;
    });
    return { totalOutstanding: outstanding, totalPrincipal: principal, currency: curr };
  }, [loans]);

  const openLoan = (id: string) => router.push(`/loans/${id}`);

  const handleDelete = async (loan: Loan) => {
    if (!(await confirm(CONFIRM.deleteLoan))) return;
    try {
      await apiDelete(`/loans/${loan.id}`);
      removeLoanDetail(queryClient, loan.id);
      invalidateLoanQueries(queryClient);
    } catch {
      // list refetch will surface stale errors on next load
    }
  };

  return (
    <>
      <StickyHeaderFlatScreen
        header={
          <ProfileStackHeader
            screen="loans"
            subtitle={isLoading ? 'Loading…' : `${loans.length} tracked`}
            actionIcon="add"
            actionLabel="Add loan"
            onAction={() => router.push('/loans/add')}
          />
        }
        inset="stack"
        data={isLoading ? [] : loans}
        keyExtractor={(l: Loan) => l.id}
        ListHeaderComponent={
          loans.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 14,
              marginBottom: theme.spacing.lg,
            }}>
              <BentoCard
                title="Total Outstanding"
                amount={formatCurrency(totalOutstanding, currency)}
                badgeText={`of ${formatCurrency(totalPrincipal, currency)}`}
                badgeColor={theme.colors.danger}
                icon="creditCard"
                iconColor={theme.colors.danger}
              />
              <BentoCard
                title="Active Loans"
                amount={`${loans.filter(l => !l.closed).length}`}
                badgeText={`${loans.filter(l => l.closed).length} paid off`}
                badgeColor={theme.colors.secondary}
                icon="target"
                iconColor={theme.colors.secondary}
              />
            </div>
          ) : null
        }
        renderItem={(l) => {
          // Server-computed (implementation-plan/backend/14) — not derived client-side.
          const pct = l.paidPercentage ?? 0;
          const color = l.closed ? theme.colors.success : theme.colors.primary;
          return (
            <ProgressEntityRow
              title={l.name}
              subtitle={`${l.type.replace(/_/g, ' ')}${l.interestRate ? ` · ${l.interestRate}% APR` : ''}`}
              value={formatCurrency(l.remainingBalance, l.currency)}
              secondaryValue={`remaining of ${formatCurrency(l.principal, l.currency)}`}
              progress={pct}
              progressColor={color}
              footerLeft={`${pct}% paid off`}
              footerRight={l.closed ? 'Paid off' : undefined}
              onPress={() => openLoan(l.id)}
              onDelete={() => { void handleDelete(l); }}
            />
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={3} variant="goal" />
          ) : isError ? (
            <EmptyState title="Couldn't load loans" subtitle="Check your connection and try again" icon="creditCard" action="Retry" onAction={() => void refetch()} />
          ) : (
            <EmptyState title="No debts tracked" subtitle="Track a loan, credit card, or EMI to stay on top of payoff" icon="creditCard" action="Add loan" onAction={() => router.push('/loans/add')} />
          )
        }
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
