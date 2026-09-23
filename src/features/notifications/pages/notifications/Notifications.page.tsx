'use client';

import { ProfileStackHeader } from '@/features/settings';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { NotificationRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useNotifications } from '@/shared/hooks';

export function NotificationsPage() {
  const { notifications, isLoading, isError, refetch, markAsRead } = useNotifications();

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
        ) : isError ? (
          <EmptyState
            title="Couldn’t load notifications"
            subtitle="Check your connection and try again"
            icon="notification"
            action="Retry"
            onAction={() => void refetch()}
          />
        ) : (
          <EmptyState title="No notifications" subtitle="You're all caught up" icon="notification" />
        )
      }
    />
  );
}
