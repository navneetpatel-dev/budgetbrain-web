'use client';

import { useRouter } from 'next/navigation';
import { ProfileStackHeader } from '@/features/settings';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { EntityRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useRecurringSeriesList, useDismissRecurringSeries, useDeleteRecurringSeries } from '../../hooks/subscriptions/useSubscriptions.hook';
import type { RecurringSeries } from '@/shared/types';
import { interactiveStyles } from '@/shared/styles/interactive/interactive.styles';

export function SubscriptionsPage() {
  const theme = useTheme();
  const router = useRouter();
  const { data, isLoading, isError, refetch } = useRecurringSeriesList();
  const series = data ?? [];
  const dismissMutation = useDismissRecurringSeries();
  const deleteMutation = useDeleteRecurringSeries();

  return (
    <StickyHeaderFlatScreen
      header={
        <ProfileStackHeader
          screen="subscriptions"
          subtitle={isLoading ? 'Loading…' : `${series.length} active`}
          actionIcon="add"
          actionLabel="Add subscription"
          onAction={() => router.push('/subscriptions/add')}
        />
      }
      inset="stack"
      data={isLoading ? [] : series}
      keyExtractor={(s: RecurringSeries) => s.id}
      renderItem={(s) => (
        <EntityRow
          title={s.merchant}
          subtitle={`${s.cadence} · due ${s.nextDueDate}${s.source === 'detected' ? ' · auto-detected' : ''}`}
          value={formatCurrency(s.amount, s.currency)}
        >
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: theme.spacing.sm }}>
            <button
              type="button"
              className={interactiveStyles.control}
              onClick={() => dismissMutation.mutate(s.id)}
              disabled={dismissMutation.isPending}
              style={{ padding: '6px 14px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.surfaceHover, color: theme.colors.textSecondary, border: 'none', cursor: 'pointer', fontSize: theme.typography.caption.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), fontFamily: 'Inter, sans-serif' }}
            >
              Not a bill
            </button>
            <button
              type="button"
              className={interactiveStyles.control}
              onClick={() => deleteMutation.mutate(s.id)}
              disabled={deleteMutation.isPending}
              style={{ padding: '6px 14px', borderRadius: theme.radii.lg, backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger, border: 'none', cursor: 'pointer', fontSize: theme.typography.caption.fontSize, fontWeight: Number(theme.typography.bodySemibold.fontWeight), fontFamily: 'Inter, sans-serif' }}
            >
              Delete
            </button>
          </div>
        </EntityRow>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="generic" />
        ) : isError ? (
          <EmptyState title="Couldn't load subscriptions" subtitle="Check your connection and try again" icon="calendar" action="Retry" onAction={() => void refetch()} />
        ) : (
          <EmptyState title="No recurring bills yet" subtitle="Mark an expense as recurring and it'll show up here, or add one manually" icon="calendar" action="Add subscription" onAction={() => router.push('/subscriptions/add')} />
        )
      }
    />
  );
}
