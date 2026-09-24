'use client';

import { StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { Button, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { useDetectionRules } from '../../hooks/detection/useDetectionRules.hook';
import { useDetectionOptions } from '../../hooks/detection/useDetectionOptions.hook';
import { RuleList } from '../../components/detection/RuleList.component';

/** `/integrations/rules`: merchant → category rules learned from corrections (plan T6.4). */
export function DetectionRulesPage() {
  const rules = useDetectionRules();
  const options = useDetectionOptions();
  return (
    <StackScrollScreen header={<StackNavHeader title="Learned rules" subtitle="Categories remembered per merchant" />}>
      {rules.error ? <FormErrorBanner message={rules.error} /> : null}
      <RuleList
        rules={rules.rules}
        isLoading={rules.isLoading}
        isError={rules.isError}
        categoryIds={options.categoryIds}
        categoryLabel={options.categoryLabel}
        categoryColor={options.categoryColor}
        onChange={rules.changeCategory}
        onRemove={rules.removeRule}
        onRetry={rules.retry}
      />
      {rules.rules.length > 0 ? <Button title="Forget all rules" variant="dangerGhost" onPress={rules.resetAll} loading={rules.isResetting} /> : null}
      <ConfirmDialog open={rules.dialog.open} copy={rules.dialog.copy} onCancel={rules.dialog.cancel} onConfirm={rules.dialog.accept} />
    </StackScrollScreen>
  );
}
