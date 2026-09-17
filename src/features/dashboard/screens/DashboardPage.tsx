import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ScreenWrapper, SummaryMetricsGrid } from '@/shared/components/ui/layout';
import { SummaryCard, SectionHeader, Card, EmptyState } from '@/shared/components/ui/index';
import { EntityRow, ProgressEntityRow, TransactionRow } from '@/shared/components/ui/list-rows';
import { DashboardContentSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useScreenInsets } from '@/shared/hooks/useScreenInsets';
import { formatCurrency } from '@/shared/utils/currency';
import { useAppSelector } from '@/shared/store/hooks';
import { apiGet } from '@/shared/services/api';
import { DashboardHero } from '../components/DashboardHero';
import { CategoryChart } from '../components/CategoryChart';
import { useDashboard } from '../hooks/useDashboard';
import { ensureArray } from '@/shared/utils/listData';
import { toSafeNumber, toSafePercent } from '@/shared/utils/number';
import type { Budget, Goal, Transaction } from '@/shared/types';

interface NetWorthSummary {
  summary: { netWorth: number; currency: string };
}

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { stackGap } = useScreenInsets();
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading, isError, refetch } = useDashboard();
  const { data: netWorthData } = useQuery({
    queryKey: ['net-worth'],
    queryFn: () => apiGet<NetWorthSummary>('/net-worth'),
  });

  const summary = data?.summary;
  const recentTransactions = ensureArray<Transaction>(data?.recentTransactions);
  const budgets = ensureArray<Budget>(data?.budgets);
  const goals = ensureArray<Goal>(data?.goals);
  const upcomingBills = ensureArray<NonNullable<typeof data>['upcomingBills'][number]>(data?.upcomingBills);
  const goalsProgress = goals.length
    ? Math.round(goals.reduce((sum, g) => sum + toSafePercent(g.currentAmount, g.targetAmount), 0) / goals.length)
    : null;
  const netWorthAmount = netWorthData?.summary
    ? formatCurrency(netWorthData.summary.netWorth, netWorthData.summary.currency || summary?.currency || 'INR')
    : '—';
  const categoryBreakdown = ensureArray<{
    categoryId: string;
    total: string;
    category?: import('@/shared/types').Category;
  }>(data?.categoryBreakdown);

  const sectionStack = { display: 'flex' as const, flexDirection: 'column' as const, gap: stackGap };

  return (
    <ScreenWrapper
      header={
        <DashboardHero
          name={user?.name?.split(' ')[0] ?? 'there'}
          amount={summary ? toSafeNumber(summary.netSavings) : 0}
          currency={summary?.currency ?? 'INR'}
          savingsRate={summary ? Math.round(toSafeNumber(summary.savingsRate)) : undefined}
          loading={isLoading && !summary}
        />
      }
      inset="tab"
    >
      {isLoading && !data ? (
        <DashboardContentSkeleton />
      ) : isError || !data || !summary ? (
        <EmptyState
          icon="home"
          title="Couldn’t load dashboard"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.section }}>
          <SummaryMetricsGrid>
            <SummaryCard
              title="Income"
              amount={formatCurrency(summary.totalIncome, summary.currency)}
              subtitle="This month"
              icon="trendingUp"
              color={theme.colors.success}
              onPress={() => navigate('/income')}
            />
            <SummaryCard
              title="Expenses"
              amount={formatCurrency(summary.totalExpenses, summary.currency)}
              subtitle="This month"
              icon="activity"
              color={theme.colors.danger}
              onPress={() => navigate('/expenses')}
            />
            <SummaryCard
              title="Goals"
              amount={goalsProgress != null ? `${goalsProgress}%` : '—'}
              subtitle={goals.length > 0 ? `${goals.length} active goal${goals.length !== 1 ? 's' : ''}` : 'Set a savings target'}
              icon="target"
              color={theme.colors.primary}
              onPress={() => navigate('/goals')}
            />
            <SummaryCard
              title="Net Worth"
              amount={netWorthAmount}
              subtitle="Assets & liabilities"
              icon="piggyBank"
              color={theme.colors.primary}
              onPress={() => navigate('/net-worth')}
            />
          </SummaryMetricsGrid>

          {data.noSpendStreak > 0 && (
            <Card variant="elevated" style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
              <span style={{ fontSize: 28 }}>🔥</span>
              <div>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 16, fontWeight: 700, color: theme.colors.text }}>
                  {data.noSpendStreak}-day no-spend streak
                </span>
                <span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary }}>
                  Keep it up!
                </span>
              </div>
            </Card>
          )}

          {upcomingBills.length > 0 && (
            <div>
              <SectionHeader title="Upcoming bills" action="See all" onAction={() => navigate('/subscriptions')} />
              <div style={sectionStack}>
                {upcomingBills.map((bill) => (
                  <EntityRow
                    key={bill.id}
                    title={bill.merchant}
                    subtitle={`Due ${bill.nextDueDate}`}
                    value={formatCurrency(bill.amount, bill.currency)}
                    onPress={() => navigate('/subscriptions')}
                  />
                ))}
              </div>
            </div>
          )}

          {categoryBreakdown.length > 0 && (
            <div>
              <SectionHeader
                title="Spending by Category"
                action="See all"
                onAction={() => navigate('/expenses?type=expense')}
              />
              <Card variant="elevated" style={{ padding: 0, overflow: 'hidden' }}>
                <CategoryChart
                  data={categoryBreakdown}
                  currency={summary.currency}
                  onCategoryPress={(categoryId) =>
                    navigate(`/expenses?type=expense&categoryId=${encodeURIComponent(categoryId)}`)
                  }
                />
              </Card>
            </div>
          )}

          {budgets.length > 0 && (
            <div>
              <SectionHeader title="Budget Progress" action="See all" onAction={() => navigate('/budgets')} />
              <div style={sectionStack}>
                {budgets.map((b) => {
                  const effectiveAmount = b.effectiveAmount ?? b.amount;
                  const pct = toSafePercent(b.spent, effectiveAmount);
                  const color = pct >= 100 ? theme.colors.danger : pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.primary;
                  return (
                    <ProgressEntityRow
                      key={b.id}
                      title={b.name}
                      value={formatCurrency(b.spent ?? 0, summary.currency)}
                      secondaryValue={`/ ${formatCurrency(effectiveAmount, b.currency)}`}
                      progress={pct}
                      progressColor={color}
                      footerRight={`${pct}%`}
                      onPress={() => navigate(`/budget/${b.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {goals.length > 0 && (
            <div>
              <SectionHeader title="Goal Progress" action="See all" onAction={() => navigate('/goals')} />
              <div style={sectionStack}>
                {goals.map((g) => {
                  const pct = toSafePercent(g.currentAmount, g.targetAmount);
                  return (
                    <ProgressEntityRow
                      key={g.id}
                      title={g.name}
                      value={formatCurrency(g.currentAmount, g.currency)}
                      secondaryValue={`/ ${formatCurrency(g.targetAmount, g.currency)}`}
                      progress={pct}
                      progressColor={theme.colors.success}
                      footerRight={`${pct}%`}
                      onPress={() => navigate(`/goal/${g.id}`)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <SectionHeader
              title="Recent Activity"
              subtitle={
                recentTransactions.length === 0
                  ? 'Your latest transactions will show up here'
                  : `${recentTransactions.length} recent transaction${recentTransactions.length !== 1 ? 's' : ''}`
              }
              action="See all"
              onAction={() => navigate('/expenses')}
            />
            {recentTransactions.length === 0 ? (
              <EmptyState
                icon="receipt"
                title="No activity yet"
                subtitle="Log an expense or income to start tracking your spending."
                action="Add expense"
                onAction={() => navigate('/expense/add')}
              />
            ) : (
              <div style={sectionStack}>
                {recentTransactions.map((txn) => (
                  <TransactionRow
                    key={txn.id}
                    transaction={txn}
                    onPress={() => navigate(txn.type === 'income' ? `/income/${txn.id}` : `/expense/${txn.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </ScreenWrapper>
  );
}
