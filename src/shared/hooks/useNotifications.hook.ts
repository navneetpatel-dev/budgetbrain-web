'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPatch } from '@/shared/services/api';
import { usePaginatedList } from '@/shared/hooks/usePaginatedList';
import type { NotificationItem } from '@/shared/types';

export function useNotifications() {
  const queryClient = useQueryClient();
  const { data, isLoading } = usePaginatedList<NotificationItem, 'notifications'>({
    queryKey: ['notifications'],
    url: '/notifications',
    itemsKey: 'notifications',
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => apiPatch(`/notifications/${id}/read`, {}),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  return { notifications: data, isLoading, markAsRead: markAsReadMutation.mutate };
}