'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { FeatureHeader, StickyHeaderFlatScreen, useStackBack } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { TransactionRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { FilterChipsRail, type FilterChipItem } from '@/shared/components/ui/FilterChipsRail';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { apiGet } from '@/shared/services/api';
import { useIncome } from '../../hooks/income/useIncome.hook';
import type { Transaction, IncomeSource } from '@/shared/types';

export function IncomePage() {
  const theme = useTheme();
  const router = useRouter();
  const goBack = useStackBack('/dashboard');
  const { data, total, isLoading, isError, refetch } = useIncome();
  const incomeList = data ?? [];
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { data: sources } = useQuery({
    queryKey: ['income-sources'],
    queryFn: async () => {
      try {
        const res = await apiGet<{ sources: IncomeSource[] }>('/income/sources');
        return res?.sources ?? [];
      } catch {
        return [];
      }
    },
  });

  const sourceList = sources ?? [];

  // Compute total inflow
  const { totalEarned, currency } = useMemo(() => {
    let sum = 0;
    let curr = 'INR';
    incomeList.forEach((t) => {
      curr = t.currency || curr;
      sum += Number(t.amount) || 0;
    });
    return { totalEarned: sum, currency: curr };
  }, [incomeList]);

  // Dynamic filter chips
  const filterChips: FilterChipItem[] = useMemo(() => {
    const chips: FilterChipItem[] = [
      { id: 'all', label: `All (${total || incomeList.length})` },
    ];
    sourceList.forEach((s) => {
      chips.push({ id: s.id, label: s.name });
    });
    return chips;
  }, [sourceList, total, incomeList.length]);

  // Filtered income list
  const filteredIncome = useMemo(() => {
    if (activeCategory === 'all') return incomeList;
    return incomeList.filter(
      (t) =>
        t.incomeSourceId === activeCategory ||
        t.category?.id === activeCategory ||
        t.category?.name === activeCategory,
    );
  }, [incomeList, activeCategory]);

  return (
    <StickyHeaderFlatScreen
      header={
        <FeatureHeader
          showBack
          onBack={goBack}
          eyebrow="Earn"
          title="Income"
          subtitle={isLoading ? 'Loading…' : `${incomeList.length} record${incomeList.length !== 1 ? 's' : ''}`}
          actionIcon="add"
          actionLabel="Add income"
          onAction={() => router.push('/income/add')}
        />
      }
      inset="tab"
      data={isLoading ? [] : filteredIncome}
      keyExtractor={(txn: Transaction) => txn.id}
      ListHeaderComponent={
        <div style={{ marginBottom: 16 }}>
          {/* Cash Flow Emerald Hero Banner */}
          <div
            style={{
              position: 'relative',
              backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
              borderRadius: theme.radii.card,
              padding: '22px',
              border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
              overflow: 'hidden',
              marginBottom: 16,
              background: `linear-gradient(135deg, rgba(78, 222, 163, 0.12), transparent)`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.18)' : 'rgba(78, 222, 163, 0.25)',
                  }}
                >
                  <AppIcon name="income" size={18} color={theme.colors.secondary} />
                </div>
                <span style={{ fontSize: 15, fontWeight: 700, color: theme.colors.text }}>Inflow Cash Stream</span>
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  backgroundColor: theme.isDark ? 'rgba(78, 222, 163, 0.12)' : theme.colors.secondaryContainer,
                  padding: '4px 10px',
                  borderRadius: 9999,
                  border: `1px solid ${theme.isDark ? 'rgba(78, 222, 163, 0.28)' : 'transparent'}`,
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: theme.colors.secondary }} />
                <span style={{ fontSize: 11, fontWeight: 700, color: theme.colors.secondary }}>
                  {sourceList.length} {sourceList.length === 1 ? 'Stream' : 'Streams'} Active
                </span>
              </div>
            </div>

            <div style={{ marginBottom: 12 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: theme.colors.textTertiary, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Total Inflow Recorded
              </span>
              <div style={{ fontSize: 32, fontWeight: 800, color: theme.colors.text, letterSpacing: '-0.8px', marginTop: 4 }}>
                {formatCurrency(totalEarned, currency)}
              </div>
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
              <span>Positive Cashflow · <strong style={{ color: theme.colors.text }}>Active Cycle</strong></span>
            </div>
          </div>

          {/* Income Sources Row */}
          {sourceList.length > 0 && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase' }}>
                  INCOME SOURCES
                </span>
                <span style={{ fontSize: 11, color: theme.colors.textTertiary }}>{sourceList.length} Configured</span>
              </div>

              <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 6 }}>
                {sourceList.map((src) => (
                  <div
                    key={src.id}
                    style={{
                      minWidth: 140,
                      backgroundColor: theme.colors.surfaceContainer ?? theme.colors.surface,
                      borderRadius: 14,
                      padding: '12px 14px',
                      border: `1px solid ${theme.isDark ? 'rgba(255,255,255,0.06)' : theme.colors.borderSubtle}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: 8,
                        backgroundColor: theme.isDark ? 'rgba(14, 165, 233, 0.14)' : 'rgba(14, 165, 233, 0.2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <AppIcon name="wallet" size={14} color={theme.colors.primary} />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: theme.colors.text }}>{src.name}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: theme.colors.textSecondary, textTransform: 'capitalize' }}>
                      {src.type.replace(/_/g, ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Filter Chips Rail */}
          <FilterChipsRail
            chips={filterChips}
            selectedId={activeCategory}
            onSelect={setActiveCategory}
          />
        </div>
      }
      renderItem={(txn) => (
        <TransactionRow transaction={txn} onPress={() => router.push(`/income/${txn.id}`)} />
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="transaction" />
        ) : isError ? (
          <EmptyState title="Couldn’t load income" subtitle="Check your connection and try again" icon="trendingUp" action="Retry" onAction={() => void refetch()} />
        ) : (
          <EmptyState title="No income yet" subtitle="Record your first income entry" icon="trendingUp" action="Add Income" onAction={() => router.push('/income/add')} />
        )
      }
    />
  );
}
