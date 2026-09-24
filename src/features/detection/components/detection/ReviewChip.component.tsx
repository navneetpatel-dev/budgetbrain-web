'use client';

import Link from 'next/link';
import { chipStyles } from '../../styles/detection/detection.styles';

export interface ReviewChipProps {
  count: number;
}

/** "N to review" on the transaction list (plan T6.4); hidden when nothing waits. */
export function ReviewChip({ count }: ReviewChipProps) {
  if (count <= 0) return null;
  return (
    <Link href="/integrations/review" className={chipStyles.chip}>
      {count} to review
    </Link>
  );
}
