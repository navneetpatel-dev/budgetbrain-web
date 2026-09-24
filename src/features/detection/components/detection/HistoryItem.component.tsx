'use client';

import type { DetectedTransaction } from '../../types/detection.types';
import { DetectedCard } from './DetectedCard.component';
import { cardStyles } from '../../styles/detection/detection.styles';

export interface HistoryItemProps {
  item: DetectedTransaction;
  busy: boolean;
  onUndo: (id: string) => void;
}

/** A detected transaction that was added; Undo removes the transaction it created. */
export function HistoryItem({ item, busy, onUndo }: HistoryItemProps) {
  const handleUndo = () => onUndo(item.id);
  return (
    <DetectedCard item={item}>
      <div className={cardStyles.actions}>
        <button type="button" className={cardStyles.button} onClick={handleUndo} disabled={busy} aria-label="Undo this detected transaction">
          {busy ? 'Undoing…' : 'Undo'}
        </button>
      </div>
    </DetectedCard>
  );
}
