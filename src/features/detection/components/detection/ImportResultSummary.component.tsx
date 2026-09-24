'use client';

import Link from 'next/link';
import type { ImportResult } from '../../types/detection.types';
import { hubStyles } from '../../styles/detection/detection.styles';

export interface ImportResultSummaryProps {
  result: ImportResult;
}

export function ImportResultSummary({ result }: ImportResultSummaryProps) {
  const parts = [
    `${result.created} added`,
    result.needsReview ? `${result.needsReview} waiting for review` : null,
    result.alreadyImported ? `${result.alreadyImported} already imported` : null,
    result.skippedDuplicates ? `${result.skippedDuplicates} skipped as duplicates` : null,
    result.invalid ? `${result.invalid} could not be read` : null,
  ].filter(Boolean);
  return (
    <span className={hubStyles.resultSuccess}>
      Import finished: {parts.join(', ')}.{' '}
      {result.needsReview > 0 ? <Link href="/integrations/review">Review them now</Link> : null}
    </span>
  );
}
