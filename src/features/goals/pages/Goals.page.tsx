'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { RingGauge } from '@/shared/components/ui/RingGauge';
import { FilterChipsRail, type FilterChipItem } from '@/shared/components/ui/FilterChipsRail';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { apiDelete } from '@/shared/services/api';
import { invalidateGoalQueries, removeGoalDetail } from '@/shared/services/queryInvalidation';
import { useGoals } from '../hooks/useGoals';
import type { Goal } from '@/shared/types';

export function GoalsPage() {
  const theme = useTheme();
  const router = useRouter();
  const queryClient = useQueryClient();
  const goBack = useStackBack('/dashboard');
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { data, isLoading, isError, refetch } = useGoals();
  const goals = useMemo(() => data ?? [], [data]);
  const [activeFilter, setActiveFilter] = useState<'all' | 'active' | 'achieved'>('all');

  // Compute summary savings metrics
  const { totalSaved, totalTarget, overallProgress, currency, activeCount, achievedCount } = useMemo(() => {
    let saved = 0;
    let target = 0;
    let curr = 'INR';
    let active = 0;
    let achieved = 0;

    goals.forEach((g) => {
      curr = g.currency || curr;
      const current = Number(g.currentAmount) || 0;
      const tgt = Number(g.targetAmount) || 0;
      saved += current;
      target += tgt;
      if (tgt > 0 && current >= tgt) {
        achieved += 1;
      } else {
        active += 1;
      }
    });

    const prog = target > 0 ? Math.min(100, Math.round((saved / target) * 100)) : 0;
    return {
      totalSaved: saved,
      totalTarget: target,
      overallProgress: prog,
      currency: curr,
      activeCount: active,
      achievedCount: achieved,
    };
  }, [goals]);

  // Filter goals
  const filteredGoals = useMemo(() => {
    if (activeFilter === 'active') {
      return goals.filter((g) => Number(g.currentAmount) < Number(g.targetAmount));
    }
    if (activeFilter === 'achieved') {
      return goals.filter((g) => Number(g.currentAmount) >= Number(g.targetAmount));
    }
    return goals;
  }, [goals, activeFilter]);

  const filterChips: FilterChipItem[] = [
    { id: 'all', label: `All (${goals.length})` },
    { id: 'active', label: `Active (${activeCount})` },
    { id: 'achieved', label: `Achieved (${achievedCount})` },
  ];

  const openGoal = (id: string) => router.push(`/goal/${id}`);

  const handleDelete = async (goal: Goal) => {
    if (!(await confirm(CONFIRM.deleteGoal))) return;
    try {
      await apiDelete(`/goals/${goal.id}`);
      removeGoalDetail(queryClient, goal.id);
      invalidateGoalQueries(queryClient);
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
            eyebrow="Save"
            title="Goals"
            subtitle={isLoading ? 'Loading…' : `${goals.length} active goal${goals.length !== 1 ? 's' : ''}`}
            actionIcon="add"
            actionLabel="Create goal"
            onAction={() => router.push('/goal/add')}
          />
        }
        inset="tab"
        data={isLoading ? [] : filteredGoals}
        keyExtractor={(g: Goal) => g.id}
        ListHeaderComponent={
          <div style={{ marginBottom: 16 }}>
            {/* Overview Radial Semi-Gauge Hero Card */}
            <div
              style={{
                position: 'relative',
                backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
                borderRadius: theme.radii.card,
                padding: '20px',
                border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                overflow: 'hidden',
                marginBottom: 16,
              }}
            >
              {/* Top Header Row */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <AppIcon name="goals" size={18} color={theme.colors.secondary} />
                  <span style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>Cumulative Savings</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.12)' : theme.colors.secondaryContainer,
                    padding: '4px 10px',
                    borderRadius: 9999,
                    border: `1px solid ${theme.isDark ? 'rgba(78, 222, 163, 0.3)' : 'transparent'}`,
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.secondary }} />
                  <span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.secondary }}>
                    {achievedCount > 0 ? `${achievedCount} Achieved` : 'Building Wealth'}
                  </span>
                </div>
              </div>

              {/* Meter and Metrics Row */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' }}>
                <RingGauge
                  size={120}
                  progress={overallProgress || (totalTarget > 0 ? 0 : 50)}
                  variant="semi"
                  icon="goals"
                  gradientColors={[theme.colors.secondary, theme.colors.primary]}
                />

                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                    Total Saved
                  </span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: theme.colors.text, letterSpacing: '-0.6px', margin: '2px 0 4px' }}>
                    {formatCurrency(totalSaved, currency)}
                  </div>
                  <div style={{ fontSize: 13, color: theme.colors.textTertiary, fontWeight: 500, marginBottom: 10 }}>
                    of {formatCurrency(totalTarget, currency)} Goal
                  </div>

                  <div
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.08)' : 'rgba(78, 222, 163, 0.15)',
                      padding: '4px 10px',
                      borderRadius: 8,
                      fontSize: 12,
                      color: theme.colors.textSecondary,
                    }}
                  >
                    <AppIcon name="trendingUp" size={14} color={theme.colors.secondary} />
                    <span>Progress: <strong style={{ color: theme.colors.secondary }}>{overallProgress}%</strong> achieved</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Filter Chips Rail */}
            <FilterChipsRail
              chips={filterChips}
              selectedId={activeFilter}
              onSelect={(id) => setActiveFilter(id as 'all' | 'active' | 'achieved')}
            />
          </div>
        }
        renderItem={(g) => {
          const pct = g.progressPercentage;
          const isCompleted = pct >= 100;
          return (
            <div
              key={g.id}
              style={{
                backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
                borderRadius: theme.radii.card,
                padding: '18px',
                marginBottom: 12,
                border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                display: 'flex',
                flexDirection: 'column',
                gap: 12,
              }}
            >
              {/* Card Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isCompleted ? theme.colors.secondary + '20' : theme.colors.primary + '18',
                      border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                    }}
                  >
                    <AppIcon name={isCompleted ? 'checkmark' : 'goals'} size={18} color={isCompleted ? theme.colors.secondary : theme.colors.primary} />
                  </div>
                  <div>
                    <span style={{ fontSize: 16, fontWeight: 700, color: theme.colors.text, display: 'block' }}>{g.name}</span>
                    <span style={{ fontSize: 12, color: theme.colors.textSecondary, textTransform: 'capitalize' }}>
                      {g.type.replace(/_/g, ' ')}{g.targetDate ? ` · Target: ${new Date(g.targetDate).toLocaleDateString(undefined, { month: 'short', year: 'numeric' })}` : ''}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6 }}>
                  <button
                    onClick={() => openGoal(g.id)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Edit goal"
                  >
                    <AppIcon name="edit" size={16} color={theme.colors.textSecondary} />
                  </button>
                  <button
                    onClick={() => void handleDelete(g)}
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 10,
                      border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.08)' : theme.colors.borderSubtle}`,
                      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.04)' : theme.colors.surface,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: 'pointer',
                    }}
                    title="Delete goal"
                  >
                    <AppIcon name="trash" size={16} color={theme.colors.danger} />
                  </button>
                </div>
              </div>

              {/* Amount and Percent */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                <div>
                  <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Saved</span>
                  <div style={{ fontSize: 22, fontWeight: 800, color: theme.colors.text, letterSpacing: '-0.4px' }}>
                    {formatCurrency(g.currentAmount, g.currency)}
                  </div>
                  <span style={{ fontSize: 12, color: theme.colors.textTertiary, fontWeight: 500 }}>
                    Target: {formatCurrency(g.targetAmount, g.currency)}
                  </span>
                </div>

                <div
                  style={{
                    padding: '4px 10px',
                    borderRadius: 9999,
                    backgroundColor: isCompleted ? theme.colors.secondary + '1F' : theme.colors.primary + '1A',
                    border: `1px solid ${isCompleted ? theme.colors.secondary + '44' : theme.colors.primary + '33'}`,
                    fontSize: 12,
                    fontWeight: 700,
                    color: isCompleted ? theme.colors.secondary : theme.colors.primary,
                  }}
                >
                  {isCompleted ? 'Achieved' : `${pct}%`}
                </div>
              </div>

              {/* Progress Bar */}
              <div
                style={{
                  height: 6,
                  borderRadius: 9999,
                  backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${Math.min(100, pct)}%`,
                    borderRadius: 9999,
                    background: isCompleted
                      ? `linear-gradient(90deg, ${theme.colors.secondary}, #6FFBBE)`
                      : `linear-gradient(90deg, ${theme.colors.primary}, ${theme.colors.ocean})`,
                  }}
                />
              </div>

              {/* Bottom Actions */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: theme.colors.textSecondary, fontWeight: 500 }}>
                  {isCompleted ? 'Goal completed! 🎉' : `${formatCurrency(Math.max(0, Number(g.targetAmount) - Number(g.currentAmount)), g.currency)} remaining`}
                </span>

                {!isCompleted ? (
                  <button
                    onClick={() => router.push(`/goal/${g.id}/contribute`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '6px 12px',
                      borderRadius: 10,
                      border: `1px solid ${theme.colors.primary}40`,
                      background: `linear-gradient(90deg, ${theme.colors.primary}20, ${theme.colors.secondary}15)`,
                      color: theme.colors.primary,
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: 'pointer',
                    }}
                  >
                    <AppIcon name="add" size={14} color={theme.colors.primary} />
                    <span>Contribute</span>
                  </button>
                ) : null}
              </div>
            </div>
          );
        }}
        ListEmptyComponent={
          isLoading ? (
            <ListRowsSkeleton count={3} variant="goal" />
          ) : isError ? (
            <EmptyState title="Couldn’t load goals" subtitle="Check your connection and try again" icon="goals" action="Retry" onAction={() => void refetch()} />
          ) : (
            <EmptyState title="No goals yet" subtitle="Set a financial goal to stay motivated" icon="goals" action="Create goal" onAction={() => router.push('/goal/add')} />
          )
        }
      />
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
