'use client';

import { EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import type { DetectedTransaction } from '../../types/detection.types';
import { HistoryItem } from './HistoryItem.component';
import { listStyles } from '../../styles/detection/detection.styles';

export interface HistoryListProps {
  items: DetectedTransaction[];
  isLoading: boolean;
  isError: boolean;
  busyId: string | undefined;
  onUndo: (id: string) => void;
  onRetry: () => void;
}

export function HistoryList({ items, isLoading, isError, busyId, onUndo, onRetry }: HistoryListProps) {
  if (isLoading) return <ListRowsSkeleton count={5} variant="transaction" />;
  if (isError) return <EmptyState title="Couldn’t load detected transactions" subtitle="Check your connection and try again" icon="activity" action="Retry" onAction={onRetry} />;
  if (items.length === 0) return <EmptyState title="Nothing here yet" subtitle="Transactions added from messages and statements appear here" icon="activity" />;
  return (
    <div className={listStyles.list}>
      {items.map((item) => (
        <HistoryItem key={item.id} item={item} busy={busyId === item.id} onUndo={onUndo} />
      ))}
    </div>
  );
}
