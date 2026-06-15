import { useNavigate } from 'react-router-dom';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, ProgressBar } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useGoals } from '../hooks/useGoals';
import type { Goal } from '@/shared/types';

export function GoalsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useGoals();

  if (isLoading) return <ListSkeleton count={3} />;
  const goals = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={
        <ProfileStackHeader
          screen="goals"
          subtitle={`${goals.length} active goal${goals.length !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Create goal"
          onAction={() => navigate('/goal/add')}
        />
      }
      inset="tab"
      data={goals}
      keyExtractor={(g: Goal) => g.id}
      renderItem={(g) => {
        const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
        return (
          <div onClick={() => navigate(`/goal/${g.id}`)} style={{ cursor: 'pointer', backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: theme.spacing.md }}>
              <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.titleSm.fontSize, fontWeight: Number(theme.typography.titleSm.fontWeight), color: theme.colors.text }}>{g.name}</span><span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{g.type.replace(/_/g, ' ')}{g.targetDate ? ` · by ${g.targetDate}` : ''}</span></div>
              {pct >= 100 && <span style={{ padding: '2px 10px', borderRadius: theme.radii.full, fontSize: 11, fontWeight: 700, backgroundColor: theme.colors.successSoft, color: theme.colors.success, fontFamily: 'Inter, sans-serif' }}>Done</span>}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: theme.spacing.sm }}>
              <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>{formatCurrency(g.currentAmount, g.currency)}</span>
              <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>of {formatCurrency(g.targetAmount, g.currency)}</span>
            </div>
            <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.success : theme.colors.primary} />
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% achieved</span>
          </div>
        );
      }}
      ListEmptyComponent={<EmptyState title="No goals yet" subtitle="Set a financial goal to stay motivated" icon="target" action="Create goal" onAction={() => navigate('/goal/add')} />}
    />
  );
}
