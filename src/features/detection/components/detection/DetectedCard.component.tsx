'use client';

import type { ReactNode } from 'react';
import { formatCurrency } from '@/shared/utils/currency';
import type { DetectedTransaction } from '../../types/detection.types';
import { amountSign, detectedTitle, reviewReasonLabel, sourceLabel, typeLabel } from '../../utils/detectionLabels';
import { cardStyles } from '../../styles/detection/detection.styles';

export interface DetectedCardProps {
  item: DetectedTransaction;
  /** Buttons and, for review items, the edit form. */
  children?: ReactNode;
}

/** One detected transaction: who, how much, when, where it came from and why it waits. */
export function DetectedCard({ item, children }: DetectedCardProps) {
  const subtitle = [
    typeLabel(item.transactionType),
    item.categoryName,
    item.accountTail ? `••• ${item.accountTail}` : item.financialAccountName,
    item.transactionDate,
  ]
    .filter(Boolean)
    .join(' · ');
  const reason = item.status === 'pending_review' ? reviewReasonLabel(item.reviewReason) : null;

  return (
    <div className={cardStyles.card}>
      <div className={cardStyles.topRow}>
        <div className={cardStyles.info}>
          <span className={cardStyles.title}>{detectedTitle(item)}</span>
          <span className={cardStyles.subtitle}>{subtitle}</span>
        </div>
        <span className={cardStyles.amount}>
          {amountSign(item.transactionType, item.direction)}
          {formatCurrency(Number(item.amount), item.currency)}
        </span>
      </div>
      <div className={cardStyles.pills}>
        <span className={cardStyles.pill}>{sourceLabel(item.source)}</span>
        {reason ? <span className={cardStyles.pillWarning}>{reason}</span> : null}
      </div>
      {children}
    </div>
  );
}
