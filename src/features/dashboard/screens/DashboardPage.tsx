import { useNavigate } from 'react-router-dom';
import { FeatureHeader, SearchField } from '@/shared/components/ui/feature-screen';
import { ScreenWrapper, ResponsiveGrid } from '@/shared/components/ui/layout';
import { SummaryCard, SectionHeader, EmptyState, Card, ProgressBar } from '@/shared/components/ui/index';
import { DashboardSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useDashboard } from '../hooks/useDashboard';

export function DashboardPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const { data, isLoading } = useDashboard();

  if (isLoading) return <DashboardSkeleton />;
  if (!data) return null;
  const { summary, recentTransactions, budgets, goals, categoryBreakdown } = data;

  return (
    <ScreenWrapper header={<FeatureHeader title="Dashboard" subtitle={`${summary.currency} overview`} icon="home" />} inset="tab">
      <SearchField placeholder="Search transactions..." onPress={() => navigate('/search')} />
      <div style={{ borderRadius: theme.radii.xl, padding: theme.spacing.xl, background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.gradientEnd})`, color: theme.colors.onPrimary }}>
        <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', opacity: 0.8, textTransform: 'uppercase' }}>Net Savings</span>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), marginTop: 4, marginBottom: 0 }}>{formatCurrency(summary.netSavings, summary.currency)}</p>
        <span style={{ fontSize: 13, fontWeight: 500, opacity: 0.85, fontFamily: 'Inter, sans-serif' }}>{summary.savingsRate.toFixed(1)}% savings rate</span>
      </div>
      <ResponsiveGrid>
        <SummaryCard title="Income" amount={formatCurrency(summary.totalIncome, summary.currency)} icon="trendingUp" color={theme.colors.success} />
        <SummaryCard title="Expenses" amount={formatCurrency(summary.totalExpenses, summary.currency)} icon="activity" color={theme.colors.danger} />
        <SummaryCard title="Goals" amount={String(goals.length)} icon="target" color={theme.colors.warning} subtitle="Active goals" />
        <SummaryCard title="Net Worth" amount={formatCurrency(summary.netSavings, summary.currency)} icon="piggyBank" />
      </ResponsiveGrid>
      {categoryBreakdown.length > 0 && (
        <div>
          <SectionHeader title="Categories" />
          <Card variant="elevated">
            {categoryBreakdown.slice(0, 5).map((item) => {
              const total = Number(item.total);
              const maxTotal = Math.max(...categoryBreakdown.map((c) => Number(c.total)), 1);
              const pct = Math.round((total / maxTotal) * 100);
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
          <SectionHeader title="Budgets" action="See all" onAction={() => navigate('/budgets')} />
          <ResponsiveGrid>
            {budgets.slice(0, 3).map((b) => {
              const pct = b.amount > 0 ? Math.round(((b.spent ?? 0) / b.amount) * 100) : 0;
              return (
                <Card key={b.id} variant="elevated" style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{b.name}</span>
                  <div style={{ marginTop: theme.spacing.xs }}>
                    <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>{formatCurrency(b.spent ?? 0, summary.currency)}</span>
                    <span style={{ fontSize: 13, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}> / {formatCurrency(b.amount, summary.currency)}</span>
                  </div>
                  <div style={{ marginTop: theme.spacing.sm }}><ProgressBar progress={pct} color={pct >= 100 ? theme.colors.danger : pct >= (b.alertThreshold ?? 80) ? theme.colors.warning : theme.colors.success} /></div>
                  <span style={{ fontSize: 11, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% used</span>
                </Card>
              );
            })}
          </ResponsiveGrid>
        </div>
      )}
      {goals.length > 0 && (
        <div>
          <SectionHeader title="Goals" action="See all" onAction={() => navigate('/goals')} />
          <ResponsiveGrid>
            {goals.slice(0, 2).map((g) => {
              const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
              return (
                <Card key={g.id} variant="elevated" style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{g.name}</span>
                  <div style={{ marginTop: theme.spacing.xs }}><span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>{formatCurrency(g.currentAmount, g.currency)}</span><span style={{ fontSize: 13, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}> / {formatCurrency(g.targetAmount, g.currency)}</span></div>
                  <div style={{ marginTop: theme.spacing.sm }}><ProgressBar progress={pct} color={theme.colors.success} /></div>
                </Card>
              );
            })}
          </ResponsiveGrid>
        </div>
      )}
      <div>
        <SectionHeader title="Recent Transactions" action="See all" onAction={() => navigate('/expenses')} />
        {recentTransactions.length === 0 ? (
          <EmptyState title="No transactions yet" subtitle="Add your first expense to start tracking" icon="receipt" action="Add Expense" onAction={() => navigate('/expense/add')} />
        ) : (
          <Card variant="elevated" style={{ padding: 0 }}>
            {recentTransactions.map((txn, i) => (
              <div key={txn.id} onClick={() => navigate(`/expense/${txn.id}`)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${theme.spacing.md}px ${theme.spacing.lg}px`, borderBottom: i < recentTransactions.length - 1 ? `1px solid ${theme.colors.borderSubtle}` : 'none', cursor: 'pointer' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: theme.spacing.md }}>
                  <div style={{ width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: txn.category?.color ? txn.category.color + '18' : theme.colors.primarySoft }}><span style={{ fontSize: 14, fontWeight: 700, color: txn.category?.color ?? theme.colors.primary }}>{(txn.category?.name ?? txn.merchant ?? 'T')[0].toUpperCase()}</span></div>
                  <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 500, color: theme.colors.text }}>{txn.merchant || txn.category?.name || 'Transaction'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}</span></div>
                </div>
                <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
              </div>
            ))}
          </Card>
        )}
      </div>
    </ScreenWrapper>
  );
}
