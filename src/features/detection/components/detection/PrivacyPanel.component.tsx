'use client';

import { Button } from '@/shared/components/ui/index';
import { hubStyles } from '../../styles/detection/detection.styles';

export interface PrivacyPanelProps {
  isDeleting: boolean;
  deletedCount: number | null;
  onDelete: () => void;
}

export function PrivacyPanel({ isDeleting, deletedCount, onDelete }: PrivacyPanelProps) {
  return (
    <section className={hubStyles.panel}>
      <span className={hubStyles.panelTitle}>Your detected data</span>
      <span className={hubStyles.panelText}>
        Deletes every detected transaction waiting for review or in your history. Transactions you already added stay.
      </span>
      {deletedCount !== null ? <span className={hubStyles.resultSuccess}>Deleted {deletedCount} detected transactions.</span> : null}
      <Button title="Delete my detected data" variant="dangerGhost" onPress={onDelete} loading={isDeleting} />
    </section>
  );
}
