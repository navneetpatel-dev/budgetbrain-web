'use client';

import { memo, useCallback } from 'react';
import { ProfileStackHeader } from '@/features/settings';
import { StickyHeaderFlatScreen } from '@/shared/components/ui/feature-screen';
import { EmptyState } from '@/shared/components/ui/index';
import { NotificationRow } from '@/shared/components/ui/list-rows';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import { useNotifications } from '@/shared/hooks';
import type { NotificationItem } from '@/shared/types';

// Approximate row height (title + body + date, per list-rows.tsx's NotificationRow) —
// enables StickyHeaderFlatScreen's virtualization past its 30-item threshold, matching
// Expenses/Income; notification history is the one list here with unbounded growth.
const ESTIMATED_ROW_HEIGHT = 88;

const NotificationListRow = memo(function NotificationListRow({
  notification: n,
  onPress,
}: {
  notification: NotificationItem;
  onPress: (notification: NotificationItem) => void;
}) {
  const handlePress = useCallback(() => onPress(n), [onPress, n]);

  return (
    <NotificationRow
      title={n.title}
      body={n.body}
      date={new Date(n.sentAt).toLocaleDateString()}
      unread={!n.read}
      onPress={handlePress}
    />
  );
});

export function NotificationsPage() {
  const { notifications, isLoading, isError, refetch, markAsRead } = useNotifications();

  const handleNotificationPress = useCallback(
    (n: NotificationItem) => {
      if (!n.read) markAsRead(n.id);
    },
    [markAsRead]
  );

  return (
    <StickyHeaderFlatScreen
      header={<ProfileStackHeader screen="notifications" />}
      inset="stack"
      data={isLoading ? [] : notifications}
      keyExtractor={(item) => item.id}
      estimateItemHeight={ESTIMATED_ROW_HEIGHT}
      renderItem={(n) => <NotificationListRow notification={n} onPress={handleNotificationPress} />}
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
