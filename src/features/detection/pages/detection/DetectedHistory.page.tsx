'use client';

import { StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { FilterChipsRail, FormErrorBanner } from '@/shared/components/ui/index';
import { HISTORY_FILTERS, useDetectedHistory } from '../../hooks/detection/useDetectedHistory.hook';
import { HistoryList } from '../../components/detection/HistoryList.component';

/** `/integrations/detected`: what detection added, including transfers, with Undo (plan T6.4). */
export function DetectedHistoryPage() {
  const history = useDetectedHistory();
  return (
    <StackScrollScreen header={<StackNavHeader title="Detected" subtitle="Added from messages and statements" />}>
      <FilterChipsRail chips={HISTORY_FILTERS} selectedId={history.filter} onSelect={history.setFilter} />
      {history.error ? <FormErrorBanner message={history.error} /> : null}
      <HistoryList
        items={history.items}
        isLoading={history.isLoading}
        isError={history.isError}
        busyId={history.busyId}
        onUndo={history.undoItem}
        onRetry={history.retry}
      />
    </StackScrollScreen>
  );
}
