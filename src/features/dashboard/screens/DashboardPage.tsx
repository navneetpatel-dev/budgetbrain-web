import { useNavigate } from 'react-router-dom';
import { ScreenWrapper, SummaryMetricsGrid } from '@/shared/components/ui/layout';
import { SummaryCard, SectionHeader, Card, ProgressBar } from '@/shared/components/ui/index';
import { AppIcon } from '@/shared/components/ui/icons/AppIcon';
import { DashboardContentSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useAppSelector } from '@/shared/store/hooks';
import { DashboardHero } from '../components/DashboardHero';
import { useDashboard } from '../hooks/useDashboard';
import { ensureArray } from '@/shared/utils/listData';
import { toSafeNumber, toSafePercent } from '@/shared/utils/number';
import type { Budget, Goal, Transaction } from '@/shared/types';

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const user = useAppSelector((s) => s.auth.user);
  const { data, isLoading } = useDashboard();

  const summary = data?.summary;
  const recentTransactions = ensureArray<Transaction>(data?.recentTransactions);
  const budgets = ensureArray<Budget>(data?.budgets);
  const goals = ensureArray<Goal>(data?.goals);
  const categoryBreakdown = ensureArray<{
    categoryId: string;
    total: string;
    category?: import('@/shared/types').Category;
  }>(data?.categoryBreakdown);

  return (
    <ScreenWrapper
      header={
        <DashboardHero
          name={user?.name?.split(' ')[0] ?? 'there'}
          netSavings={summary ? formatCurrency(summary.netSavings, summary.currency) : '—'}
          currency={summary?.currency ?? 'INR'}
          savingsRate={summary ? Math.round(toSafeNumber(summary.savingsRate)) : undefined}
        />
      }
      inset="tab"
    >
      {isLoading || !data || !summary ? (
        <DashboardContentSkeleton />
      ) : (
        <>
          <SummaryMetricsGrid>
            <SummaryCard title="Income" amount={formatCurrency(summary.totalIncome, summary.currency)} icon="trendingUp" color={theme.colors.success} />
            <SummaryCard title="Expenses" amount={formatCurrency(summary.totalExpenses, summary.currency)} icon="activity" color={theme.colors.danger} />
            <SummaryCard title="Goals" amount="Track" subtitle="Savings targets" icon="target" color={theme.colors.primary} onPress={() => navigate('/goals')} />
            <SummaryCard title="Net Worth" amount="Overview" subtitle="Assets & liabilities" icon="piggyBank" color={theme.colors.primary} onPress={() => navigate('/net-worth')} />
          </SummaryMetricsGrid>
          {categoryBreakdown.length > 0 && (
            <div>
              <SectionHeader title="Spending by Category" />
              <Card variant="elevated">
                {categoryBreakdown.slice(0, 5).map((item) => {
                  const total = toSafeNumber(item.total);
                  const maxTotal = Math.max(...categoryBreakdown.map((c) => toSafeNumber(c.total)), 1);
                  const pct = toSafePercent(total, maxTotal);
                  return (
                    <div key={item.categoryId} style={{ marginBottom: theme.spacing.sm }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>{item.category?.name ?? 'Unknown'}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.text, fontFamily: 'Inter, sans-serif' }}>{formatCurrency(total, summary.currency)}</span>
                      </div>
                      <ProgressBar progress={pct} color={item.category?.color ?? theme.colors.primary} height={6} />
                    </div>
                  );
                })}
              </Card>
            </div>
          )}
          {budgets.length > 0 && (
            <div>
              <SectionHeader title="Budget Progress" action="See all" onAction={() => navigate('/budgets')} />
              <Card variant="elevated">
                {budgets.slice(0, 3).map((b, i) => {
                  const pct = toSafePercent(b.spent, b.amount);
                  return (
                    <div key={b.id} style={{ padding: `${theme.spacing.md}px 0`, borderBottom: i < Math.min(budgets.length, 3) - 1 ? `1px solid ${theme.colors.borderSubtle}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.text, fontFamily: 'Inter, sans-serif' }}>{b.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>{pct}%</span>
                      </div>
                      <ProgressBar progress={pct} color={pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.primary} />
                      <span style={{ fontSize: 12, color: theme.colors.textTertiary, marginTop: 6, display: 'block', fontFamily: 'Inter, sans-serif' }}>{formatCurrency(b.spent ?? 0, summary.currency)} / {formatCurrency(b.amount, b.currency)}</span>
                    </div>
                  );
                })}
              </Card>
            </div>
          )}
          {goals.length > 0 && (
            <div>
              <SectionHeader title="Goal Progress" action="See all" onAction={() => navigate('/goals')} />
              <Card variant="elevated">
                {goals.slice(0, 2).map((g, i) => {
                  const pct = toSafePercent(g.currentAmount, g.targetAmount);
                  return (
                    <div key={g.id} style={{ padding: `${theme.spacing.md}px 0`, borderBottom: i < Math.min(goals.length, 2) - 1 ? `1px solid ${theme.colors.borderSubtle}` : 'none' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                        <span style={{ fontSize: 15, fontWeight: 600, color: theme.colors.text, fontFamily: 'Inter, sans-serif' }}>{g.name}</span>
                        <span style={{ fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>{pct}%</span>
                      </div>
                      <ProgressBar progress={pct} color={theme.colors.success} />
                      <span style={{ fontSize: 12, color: theme.colors.textTertiary, marginTop: 6, display: 'block', fontFamily: 'Inter, sans-serif' }}>{formatCurrency(g.currentAmount, g.currency)} / {formatCurrency(g.targetAmount, g.currency)}</span>
                    </div>
                  );
                })}
              </Card>
            </div>
          )}
          <div style={{ marginTop: theme.spacing.sm }}>
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
              <Card
                variant="elevated"
                style={{
                  padding: `${theme.spacing.xl}px ${theme.spacing.lg}px`,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  textAlign: 'center',
                  gap: theme.spacing.md,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: theme.colors.primarySoft,
                    border: `1px solid ${theme.colors.primary}28`,
                  }}
                >
                  <AppIcon name="receipt" size={22} color={theme.colors.primary} />
                </div>
                <div>
                  <span style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 15,
                    fontWeight: 600,
                    color: theme.colors.text,
                    marginBottom: 4,
                  }}>No activity yet</span>
                  <span style={{
                    display: 'block',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 500,
                    color: theme.colors.textSecondary,
                    lineHeight: '18px',
                    maxWidth: 260,
                  }}>Log an expense or income to start tracking your spending.</span>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/expense/add')}
                  style={{
                    marginTop: 4,
                    padding: '10px 16px',
                    borderRadius: theme.radii.full,
                    border: 'none',
                    backgroundColor: theme.colors.primary,
                    color: theme.colors.onPrimary,
                    fontFamily: 'Inter, sans-serif',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Add expense
                </button>
              </Card>
            ) : (
              <Card variant="elevated" style={{ padding: 0, overflow: 'hidden' }}>
                {recentTransactions.map((txn, i) => (
                  <div
                    key={txn.id}
                    onClick={() => navigate(`/expense/${txn.id}`)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: `${theme.spacing.md}px ${theme.spacing.lg}px`,
                      borderBottom: i < recentTransactions.length - 1 ? `1px solid ${theme.colors.borderSubtle}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md, minWidth: 0 }}>
                      <div style={{
                        width: 40,
                        height: 40,
                        borderRadius: 12,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                        backgroundColor: txn.category?.color ? txn.category.color + '18' : theme.colors.primarySoft,
                      }}>
                        <span style={{ fontSize: 15, fontWeight: 700, color: txn.category?.color ?? theme.colors.primary }}>
                          {(txn.category?.name ?? txn.merchant ?? 'T')[0].toUpperCase()}
                        </span>
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <span style={{
                          display: 'block',
                          fontFamily: 'Inter, sans-serif',
                          fontSize: 15,
                          fontWeight: 600,
                          color: theme.colors.text,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}>{txn.merchant || txn.category?.name || 'Transaction'}</span>
                        <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}</span>
                      </div>
                    </div>
                    <span style={{
                      fontFamily: 'Inter, sans-serif',
                      fontSize: 15,
                      fontWeight: 700,
                      flexShrink: 0,
                      marginLeft: theme.spacing.md,
                      color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success,
                    }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
                  </div>
                ))}
              </Card>
            )}
          </div>
        </>
      )}
    </ScreenWrapper>
  );
}
