'use client';

import { useQuery } from '@tanstack/react-query';
import { fetchSyncState } from '../../api/detection/detection.api';
import { DETECTION_KEY } from './useReviewInbox.hook';

/** How many detected transactions wait for review, for the chip on the transaction list. */
export function useReviewCount(): number {
  const status = useQuery({ queryKey: [...DETECTION_KEY, 'sync-state'], queryFn: fetchSyncState, staleTime: 60 * 1000 });
  return status.data?.pendingReviewCount ?? 0;
}
