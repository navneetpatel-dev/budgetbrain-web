import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { useNotifications } from '@/features/shared/hooks/useFeatures';

export function NotificationsPage() {
  const theme = useTheme();
  const { notifications, isLoading } = useNotifications();

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="notifications" />}
      inset="stack"
      data={isLoading ? [] : notifications}
      keyExtractor={(item) => item.id}
      renderItem={(n) => (
        <div style={{ backgroundColor: theme.colors.surface, borderRadius: theme.radii.lg, border: `1px solid ${n.read ? theme.colors.borderSubtle : theme.colors.primary}33`, padding: theme.spacing.lg, boxShadow: theme.shadows.sm, opacity: n.read ? 0.7 : 1 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: theme.spacing.md }}>
            {!n.read && <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: theme.colors.primary, marginTop: 6, flexShrink: 0 }} />}
            <div><span style={{ display: 'block', fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: theme.colors.text }}>{n.title}</span><span style={{ display: 'block', fontSize: 12, fontWeight: 500, color: theme.colors.textSecondary, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{n.body}</span><span style={{ fontSize: 11, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{new Date(n.sentAt).toLocaleDateString()}</span></div>
          </div>
        </div>
      )}
      ListEmptyComponent={
        isLoading ? (
          <ListRowsSkeleton count={5} variant="notification" />
        ) : (
          <EmptyState title="No notifications" subtitle="You're all caught up" icon="notification" />
        )
      }
    />
  );
}
