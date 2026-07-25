import { useState } from 'react';
import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState, FormErrorBanner } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useIntegrations } from '@/features/shared/hooks/useFeatures';
import { useCategories } from '@/features/categories/hooks/useCategories';

export function IntegrationsPage() {
  const theme = useTheme();
  const { pending, isLoading, confirmMutation, rejectMutation } = useIntegrations();
  const { categories } = useCategories();
  const [categoryById, setCategoryById] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="integrations" subtitle="SMS & Email parsing" />}
      inset="stack"
      data={isLoading ? [] : pending}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={error ? <FormErrorBanner message={error} /> : null}
      renderItem={(item) => (
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{item.parsedMerchant ?? 'Unknown'}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{item.source}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: theme.colors.danger, fontFamily: 'Inter, sans-serif' }}>₹{item.parsedAmount}</span>
            <select
              value={categoryById[item.id] ?? ''}
              onChange={(e) => setCategoryById((prev) => ({ ...prev, [item.id]: e.target.value }))}
              style={{
                minWidth: 140,
                padding: '6px 10px',
                borderRadius: theme.radii.md,
                border: `1px solid ${theme.colors.borderSubtle}`,
                backgroundColor: theme.colors.background,
                color: theme.colors.text,
                fontFamily: 'Inter, sans-serif',
                fontSize: 12,
              }}
            >
              <option value="">Select category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => {
                  const categoryId = categoryById[item.id];
                  if (!categoryId) {
                    setError('Choose a category before confirming.');
                    return;
                  }
                  setError(null);
                  confirmMutation.mutate({ id: item.id, categoryId });
                }}
                style={{ padding: '6px 14px', borderRadius: theme.radii.full, backgroundColor: theme.colors.successSoft, color: theme.colors.success, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  setError(null);
                  rejectMutation.mutate(item.id);
                }}
                style={{ padding: '6px 14px', borderRadius: theme.radii.full, backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}
              >
                Reject
              </button>
            </div>
          </div>
        </div>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={4} variant="transaction" />
        ) : (
          <EmptyState title="No pending items" subtitle="Parsed SMS and email receipts appear here" icon="globe" />
        )
      }
    />
  );
}
