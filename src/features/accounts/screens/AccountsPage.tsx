import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import type { FinancialAccount } from '@/shared/types';

export function AccountsPage() {
  const theme = useTheme();

  const { data } = useQuery({
    queryKey: ['accounts'],
    queryFn: () => apiGet<FinancialAccount[]>('/accounts'),
  });

  const accounts = data ?? [];

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="accounts" subtitle="Bank accounts & cards" />}
      inset="stack"
      data={accounts}
      keyExtractor={(item) => item.id}
      renderItem={(acc) => (
        <div style={{
          backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg,
          border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm,
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{acc.name}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{acc.type.replace('_', ' ')}</span>
          </div>
          {acc.institution && <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, display: 'block', fontFamily: 'Inter, sans-serif' }}>{acc.institution}</span>}
          <span style={{ marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amount.fontSize, fontWeight: Number(theme.typography.amount.fontWeight), color: theme.colors.text }}>
            {formatCurrency(acc.balance, acc.currency)}
          </span>
        </div>
      )}
      ListEmptyComponent={<EmptyState title="No accounts" subtitle="Add your bank accounts and cards" icon="creditCard" />}
    />
  );
}
