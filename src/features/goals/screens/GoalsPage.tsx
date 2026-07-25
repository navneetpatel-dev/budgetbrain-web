import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ProgressEntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { caption } from '@/shared/theme/textStyles';
import { formatCurrency } from '@/shared/utils/currency';
import { toSafePercent } from '@/shared/utils/number';
import { useGoals } from '../hooks/useGoals';
import type { Goal } from '@/shared/types';

export function GoalsPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const goBack = useStackBack('/dashboard');
  const { data, isLoading, isError, refetch } = useGoals();
  const goals = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Save"
          title="Goals"
          subtitle={isLoading ? 'Loading…' : `${goals.length} active goal${goals.length !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Create goal"
          onAction={() => navigate('/goal/add')}
        />
      }
      inset="tab"
      data={isLoading ? [] : goals}
      keyExtractor={(g: Goal) => g.id}
      renderItem={(g) => {
        const pct = toSafePercent(g.currentAmount, g.targetAmount);
        const color = pct >= 100 ? theme.colors.success : theme.colors.primary;
        return (
          <ProgressEntityRow
            title={g.name}
            subtitle={`${g.type.replace(/_/g, ' ')}${g.targetDate ? ` · by ${g.targetDate}` : ''}`}
            value={formatCurrency(g.currentAmount, g.currency)}
            secondaryValue={`of ${formatCurrency(g.targetAmount, g.currency)}`}
            progress={pct}
            progressColor={color}
            footerLeft={`${pct}% achieved`}
            badge={pct >= 100 ? (
              <span style={{
                ...caption(theme, theme.colors.success),
                padding: '2px 10px', borderRadius: theme.radii.full, fontSize: 11, fontWeight: 700,
                backgroundColor: theme.colors.successSoft,
              }}>Done</span>
            ) : undefined}
            onPress={() => navigate(`/goal/${g.id}`)}
          />
        );
      }}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={3} variant="goal" />
        ) : isError ? (
          <EmptyState title="Couldn’t load goals" subtitle="Check your connection and try again" icon="target" action="Retry" onAction={() => void refetch()} />
        ) : (
          <EmptyState title="No goals yet" subtitle="Set a financial goal to stay motivated" icon="target" action="Create goal" onAction={() => navigate('/goal/add')} />
        )
      }
    />
  );
}
