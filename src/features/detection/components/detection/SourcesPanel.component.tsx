'use client';

import { Toggle } from '@/shared/components/ui/index';
import type { SyncState } from '../../types/detection.types';
import { sourceLabel } from '../../utils/detectionLabels';
import { hubStyles } from '../../styles/detection/detection.styles';

export interface SourcesPanelProps {
  status: SyncState | null;
  serverEnabled: boolean;
  autoAddHighConfidence: boolean;
  onToggleAutoAdd: (value: boolean) => void;
}

/** Where detections come from, and when each source last sent one (plan T6.4 status page). */
export function SourcesPanel({ status, serverEnabled, autoAddHighConfidence, onToggleAutoAdd }: SourcesPanelProps) {
  return (
    <section className={hubStyles.panel}>
      <span className={hubStyles.panelTitle}>Auto-tracking</span>
      {!serverEnabled ? <span className={hubStyles.resultError}>Automatic detection is paused for everyone right now.</span> : null}
      <div className={hubStyles.stats}>
        <div className={hubStyles.stat}>
          <span className={hubStyles.statValue}>{status?.totalDetectedCount ?? 0}</span>
          <span className={hubStyles.statLabel}>Detected in total</span>
        </div>
        <div className={hubStyles.stat}>
          <span className={hubStyles.statValue}>{status?.pendingReviewCount ?? 0}</span>
          <span className={hubStyles.statLabel}>Waiting for review</span>
        </div>
      </div>
      {/* A handful of sources at most (phone, email, statement formats). */}
      {(status?.sources ?? []).map((s) => (
        <div key={s.source} className={hubStyles.sourceRow}>
          <span className={hubStyles.sourceName}>{sourceLabel(s.source)}</span>
          <span className={hubStyles.sourceMeta}>
            {s.count} · last {new Date(s.lastReceivedAt).toLocaleString()}
          </span>
        </div>
      ))}
      {status && status.sources.length === 0 ? (
        <span className={hubStyles.panelText}>Nothing detected yet. Turn on SMS tracking in the Android app, paste a message, or import a statement.</span>
      ) : null}
      <div className={hubStyles.toggleRow}>
        <div className={hubStyles.toggleText}>
          <span className={hubStyles.sourceName}>Add clear transactions automatically</span>
          <span className={hubStyles.sourceMeta}>Off: every detected transaction waits for your review.</span>
        </div>
        <Toggle value={autoAddHighConfidence} onChange={onToggleAutoAdd} label="Add clear transactions automatically" />
      </div>
    </section>
  );
}
