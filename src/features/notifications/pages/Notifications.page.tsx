'use client';

import { ProfileStackHeader } from '@/features/settings/components/ProfileStackHeader';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { NotificationRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useNotifications } from '@/features/shared/hooks/useFeatures';

export function NotificationsPage() {
  const { notifications, isLoading, markAsRead } = useNotifications();

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="notifications" />}
      inset="stack"
      data={isLoading ? [] : notifications}
      keyExtractor={(item) => item.id}
      renderItem={(n) => (
        <NotificationRow
          title={n.title}
          body={n.body}
          date={new Date(n.sentAt).toLocaleDateString()}
          unread={!n.read}
          onPress={() => {
            if (!n.read) markAsRead(n.id);
          }}
        />
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
