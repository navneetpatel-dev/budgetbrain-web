import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState, ProgressBar } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
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

  if (isLoading) return <ListSkeleton count={4} variant="budget" />;
  const budgets = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="PLAN"
          title="Budgets"
          subtitle={`${budgets.length} active`}
          actionIcon="add"
          actionLabel="Create budget"
          onAction={() => navigate('/budget/add')}
        />
      }
      data={budgets}
      keyExtractor={(b: Budget) => b.id}
      renderItem={(b) => {
        const pct = toSafePercent(b.spent, b.amount);
        return (
          <div onClick={() => navigate(`/budget/${b.id}`)} style={{ cursor: 'pointer', backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
              <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.titleSm.fontSize, fontWeight: Number(theme.typography.titleSm.fontWeight), color: theme.colors.text }}>{b.name}</span><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{b.type}{b.category?.name ? ` · ${b.category.name}` : ''}</span></div>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>{formatCurrency(b.spent ?? 0, 'INR')}<span style={{ fontSize: theme.typography.caption.fontSize, fontWeight: 500, color: theme.colors.textTertiary }}> / {formatCurrency(b.amount, b.currency)}</span></span>
            </div>
            <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.danger : pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.success} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
              <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{pct}% used</span>
              {pct >= (b.alertThreshold ?? 80) && pct < 100 && <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.warning, fontFamily: 'Inter, sans-serif' }}>Near limit</span>}
              {pct >= 100 && <span style={{ fontSize: 12, fontWeight: 600, color: theme.colors.danger, fontFamily: 'Inter, sans-serif' }}>Over budget</span>}
            </div>
          </div>
        );
      }}
      ListEmptyComponent={<EmptyState title="No budgets yet" subtitle="Set spending limits to stay on track" icon="budgets" action="Create budget" onAction={() => navigate('/budget/add')} />}
    />
  );
}
