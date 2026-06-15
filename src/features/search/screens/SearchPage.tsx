import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FeatureHeader, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { Input, EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useSearch } from '@/features/shared/hooks/useFeatures';

export function SearchPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const { data } = useSearch(query);

  const results = data?.transactions ?? [];

  return (
    <StickyHeaderFlatScreen
      header={<FeatureHeader title="Search" variant="stack" showBack footer={<Input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search transactions..." leftIcon="search" autoFocus />} />}
      data={query.length >= 2 ? results : []}
      keyExtractor={(item) => item.id}
      renderItem={(txn) => (
        <div onClick={() => navigate(`/expense/${txn.id}`)} style={{ cursor: 'pointer', backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: theme.shadows.sm }}>
          <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{txn.merchant || txn.category?.name || 'Transaction'}</span><span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{txn.date}{txn.notes ? ` · ${txn.notes}` : ''}</span></div>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
        </div>
      )}
      ListEmptyComponent={query.length >= 2 ? <EmptyState title="No results" subtitle="Try a different search term" icon="search" /> : query.length === 1 ? <EmptyState title="Keep typing..." subtitle="Enter at least 2 characters" icon="search" /> : null}
    />
  );
}
