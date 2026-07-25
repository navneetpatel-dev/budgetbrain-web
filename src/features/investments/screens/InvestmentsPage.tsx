import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ListSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useInvestments } from '@/features/shared/hooks/useFeatures';

export function InvestmentsPage() {
  const theme = useTheme();
  const { investments, isLoading } = useInvestments();

  if (isLoading) return <ListSkeleton count={4} variant="account" />;

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="investments" subtitle="Your portfolio" />}
      inset="stack"
      data={investments}
      keyExtractor={(item) => item.id}
      renderItem={(inv) => (
        <div style={{
          backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg,
          border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{inv.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{inv.type.replace('_', ' ')}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>
              {formatCurrency(inv.currentValue ?? (inv.quantity * inv.currentPrice), inv.currency)}
            </span>
            {(inv.gainLoss !== undefined) && (
              <span style={{
                fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif',
                color: inv.gainLoss >= 0 ? theme.colors.success : theme.colors.danger,
              }}>
                {inv.gainLoss >= 0 ? '+' : ''}{formatCurrency(inv.gainLoss, inv.currency)}
              </span>
            )}
          </div>
        </div>
      )}
      ListEmptyComponent={<EmptyState title="No investments" subtitle="Track stocks, mutual funds, and more" icon="chart" />}
    />
  );
}
