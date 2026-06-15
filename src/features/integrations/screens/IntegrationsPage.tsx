import { FeatureHeader, StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useIntegrations } from '@/features/shared/hooks/useFeatures';

export function IntegrationsPage() {
  const theme = useTheme();
  const { pending, confirmMutation, rejectMutation } = useIntegrations();

  return (
    <StickyHeaderFlatScreen
      header={<FeatureHeader title="Integrations" subtitle="SMS & Email parsing" icon="globe" variant="stack" showBack />}
      data={pending}
      keyExtractor={(item) => item.id}
      renderItem={(item) => (
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${theme.colors.borderSubtle}`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 15, fontWeight: 600, color: theme.colors.text }}>{item.parsedMerchant ?? 'Unknown'}</span>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{item.source}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 17, fontWeight: 700, color: theme.colors.danger, fontFamily: 'Inter, sans-serif' }}>₹{item.parsedAmount}</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={() => confirmMutation.mutate(item.id)} style={{ padding: '6px 14px', borderRadius: theme.radii.full, backgroundColor: theme.colors.successSoft, color: theme.colors.success, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Confirm</button>
              <button onClick={() => rejectMutation.mutate(item.id)} style={{ padding: '6px 14px', borderRadius: theme.radii.full, backgroundColor: theme.colors.dangerSoft, color: theme.colors.danger, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>Reject</button>
            </div>
          </div>
        </div>
      )}
      ListEmptyComponent={<EmptyState title="No pending items" subtitle="Parsed SMS and email receipts appear here" icon="globe" />}
    />
  );
}
