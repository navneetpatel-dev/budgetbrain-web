'use client';

import type { ConfirmOverrides, DetectedTransaction } from '../../types/detection.types';
import { DetectedCard } from './DetectedCard.component';
import { DetectedEditForm } from './DetectedEditForm.component';
import { cardStyles } from '../../styles/detection/detection.styles';

export interface ReviewItemProps {
  item: DetectedTransaction;
  editing: boolean;
  busy: boolean;
  categoryIds: string[];
  accountIds: string[];
  categoryLabel: (id: string) => string;
  categoryColor: (id: string) => string | undefined;
  accountLabel: (id: string) => string;
  onConfirm: (item: DetectedTransaction, overrides?: ConfirmOverrides) => void;
  onReject: (id: string) => void;
  onEdit: (id: string) => void;
  onCancelEdit: () => void;
}

export function ReviewItem({ item, editing, busy, onConfirm, onReject, onEdit, onCancelEdit, ...options }: ReviewItemProps) {
  const handleConfirm = () => onConfirm(item);
  const handleReject = () => onReject(item.id);
  const handleEdit = () => onEdit(item.id);

  return (
    <DetectedCard item={item}>
      {editing ? (
        <DetectedEditForm item={item} saving={busy} onSave={onConfirm} onCancel={onCancelEdit} {...options} />
      ) : (
        <div className={cardStyles.actions}>
          <button type="button" className={cardStyles.buttonDanger} onClick={handleReject} disabled={busy} aria-label="Delete detected transaction">
            Delete
          </button>
          <button type="button" className={cardStyles.button} onClick={handleEdit} disabled={busy} aria-label="Edit detected transaction before adding">
            Edit
          </button>
          <button type="button" className={cardStyles.buttonPrimary} onClick={handleConfirm} disabled={busy} aria-label="Confirm detected transaction">
            {busy ? 'Adding…' : 'Confirm'}
          </button>
        </div>
      )}
    </DetectedCard>
  );
}
