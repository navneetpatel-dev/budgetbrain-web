'use client';

import Link from 'next/link';
import { hubStyles } from '../../styles/detection/detection.styles';

export interface HubLinksProps {
  pendingCount: number;
}

export function HubLinks({ pendingCount }: HubLinksProps) {
  return (
    <section className={hubStyles.panel}>
      <span className={hubStyles.panelTitle}>Manage</span>
      <div className={hubStyles.links}>
        <Link href="/integrations/review" className={hubStyles.link}>
          <span>Review detected transactions</span>
          {pendingCount > 0 ? <span className={hubStyles.linkBadge}>{pendingCount}</span> : null}
        </Link>
        <Link href="/integrations/detected" className={hubStyles.link}>
          <span>Detected history and undo</span>
        </Link>
        <Link href="/integrations/rules" className={hubStyles.link}>
          <span>Learned merchant rules</span>
        </Link>
        <Link href="/integrations/import" className={hubStyles.link}>
          <span>Import a bank statement</span>
        </Link>
      </div>
    </section>
  );
}
