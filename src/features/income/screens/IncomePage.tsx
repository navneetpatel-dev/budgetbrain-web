import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useIncome } from '../hooks/useIncome';
import type { Transaction } from '@/shared/types';

export function IncomePage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data } = useIncome();
  const incomeList = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={<FeatureHeader title="Income" subtitle="Track your earnings" icon="trendingUp" actionIcon="add" onAction={() => navigate('/income/add')} actionLabel="Add Income" />}
      data={incomeList}
      keyExtractor={(txn: Transaction) => txn.id}
      renderItem={(txn) => (
        <div onClick={() => navigate(`/income/${txn.id}`)} style={{ cursor: 'pointer', backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.notes || 'Income'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}</span></div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.success }}>+{formatCurrency(txn.amount, txn.currency)}</span>
        </div>
      )}
      ListEmptyComponent={<EmptyState title="No income yet" subtitle="Record your first income" icon="trendingUp" action="Add Income" onAction={() => navigate('/income/add')} />}
    />
  );
}
