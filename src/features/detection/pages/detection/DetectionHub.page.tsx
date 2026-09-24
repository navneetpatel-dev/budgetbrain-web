'use client';

import { StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useDetectionHub } from '../../hooks/detection/useDetectionHub.hook';
import { SourcesPanel } from '../../components/detection/SourcesPanel.component';
import { HubLinks } from '../../components/detection/HubLinks.component';
import { PasteMessagePanel } from '../../components/detection/PasteMessagePanel.component';
import { PrivacyPanel } from '../../components/detection/PrivacyPanel.component';
import { hubStyles } from '../../styles/detection/detection.styles';

/** `/integrations`: auto-tracking status, pasting messages, and links to review, history, rules and import. */
export function DetectionHubPage() {
  const hub = useDetectionHub();
  return (
    <StackScrollScreen header={<StackNavHeader title="Auto-tracking & import" subtitle="Bank messages, emails and statements" />}>
      {hub.error ? <FormErrorBanner message={hub.error} /> : null}
      <div className={hubStyles.grid}>
        <SourcesPanel
          status={hub.status}
          serverEnabled={hub.serverEnabled}
          autoAddHighConfidence={hub.autoAddHighConfidence}
          onToggleAutoAdd={hub.setAutoAdd}
        />
        <HubLinks pendingCount={hub.status?.pendingReviewCount ?? 0} />
        <PasteMessagePanel {...hub.paste} />
        <PrivacyPanel isDeleting={hub.isDeleting} deletedCount={hub.deletedCount} onDelete={hub.deleteAll} />
      </div>
      <ConfirmDialog open={hub.dialog.open} copy={hub.dialog.copy} onCancel={hub.dialog.cancel} onConfirm={hub.dialog.accept} />
    </StackScrollScreen>
  );
}
