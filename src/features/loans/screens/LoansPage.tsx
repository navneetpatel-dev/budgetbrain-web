import { useNavigate } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
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
import { invalidateLoanQueries, removeLoanDetail } from '@/shared/services/queryInvalidation';
import { useLoans } from '../hooks/useLoans';
import type { Loan } from '@/shared/types';

export function LoansPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { data, isLoading, isError, refetch } = useLoans();
  const loans = data ?? [];

  const openLoan = (id: string) => navigate(`/loan/${id}`);

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
            onAction={() => navigate('/loan/add')}
          />
        }
        inset="stack"
        data={isLoading ? [] : loans}
        keyExtractor={(l: Loan) => l.id}
        renderItem={(l) => {
          const paid = l.principal - l.remainingBalance;
          const pct = toSafePercent(paid, l.principal);
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
            <EmptyState title="No debts tracked" subtitle="Track a loan, credit card, or EMI to stay on top of payoff" icon="creditCard" action="Add loan" onAction={() => navigate('/loan/add')} />
          )
        }
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
