'use client';

import { StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { FormErrorBanner } from '@/shared/components/ui/index';
import { useReviewInbox } from '../../hooks/detection/useReviewInbox.hook';
import { useDetectionOptions } from '../../hooks/detection/useDetectionOptions.hook';
import { ReviewList } from '../../components/detection/ReviewList.component';

/** `/integrations/review`: detected transactions waiting for the user (plan T6.4). */
export function ReviewInboxPage() {
  const inbox = useReviewInbox();
  const options = useDetectionOptions();
  return (
    <StackScrollScreen header={<StackNavHeader title="Review" subtitle={inbox.total ? `${inbox.total} waiting` : 'Detected transactions'} />}>
      {inbox.error ? <FormErrorBanner message={inbox.error} /> : null}
      <ReviewList
        items={inbox.items}
        isLoading={inbox.isLoading}
        isError={inbox.isError}
        editingId={inbox.editingId}
        busyId={inbox.busyId}
        onConfirm={inbox.confirmItem}
        onReject={inbox.rejectItem}
        onEdit={inbox.startEdit}
        onCancelEdit={inbox.cancelEdit}
        onRetry={inbox.retry}
        {...options}
      />
    </StackScrollScreen>
  );
}
