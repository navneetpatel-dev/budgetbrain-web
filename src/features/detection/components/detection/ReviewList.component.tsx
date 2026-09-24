'use client';

import { EmptyState } from '@/shared/components/ui/index';
import { ListRowsSkeleton } from '@/shared/components/ui/skeleton';
import type { ConfirmOverrides, DetectedTransaction } from '../../types/detection.types';
import { ReviewItem } from './ReviewItem.component';
import { listStyles } from '../../styles/detection/detection.styles';

export interface ReviewListProps {
  items: DetectedTransaction[];
  isLoading: boolean;
  isError: boolean;
  editingId: string | null;
  busyId: string | undefined;
  categoryIds: string[];
  accountIds: string[];
  categoryLabel: (id: string) => string;
  categoryColor: (id: string) => string | undefined;
  accountLabel: (id: string) => string;
  onConfirm: (item: DetectedTransaction, overrides?: ConfirmOverrides) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
  onRetry: () => void;
}

export function ReviewList({ items, isLoading, isError, editingId, busyId, onRetry, ...rest }: ReviewListProps) {
  if (isLoading) return <ListRowsSkeleton count={4} variant="transaction" />;
  if (isError) return <EmptyState title="Couldn’t load your review list" subtitle="Check your connection and try again" icon="activity" action="Retry" onAction={onRetry} />;
  if (items.length === 0) {
    return <EmptyState title="Nothing to review" subtitle="Detected transactions that need a look appear here" icon="checkmark" />;
  }
  return (
    <div className={listStyles.list}>
      {items.map((item) => (
        <ReviewItem key={item.id} item={item} editing={editingId === item.id} busy={busyId === item.id} {...rest} />
      ))}
    </div>
  );
}
