'use client';

import { Input } from '@/shared/components/ui/index';
import { OptionChips, SheetSelect } from '@/shared/components/ui/feature-screen';
import type { ConfirmOverrides, DetectedTransaction, DetectedType } from '../../types/detection.types';
import { useDetectedEditForm } from '../../hooks/detection/useDetectedEditForm.hook';
import { typeLabel } from '../../utils/detectionLabels';
import { cardStyles, editStyles } from '../../styles/detection/detection.styles';

export interface DetectedEditFormProps {
  item: DetectedTransaction;
  saving: boolean;
  categoryIds: string[];
  accountIds: string[];
  categoryLabel: (id: string) => string;
  categoryColor: (id: string) => string | undefined;
  accountLabel: (id: string) => string;
  onSave: (item: DetectedTransaction, overrides: ConfirmOverrides) => void;
  onCancel: () => void;
}

/** Fix what detection got wrong, then add it (plan T5.1 on the web). Only changed fields are sent. */
export function DetectedEditForm(props: DetectedEditFormProps) {
  const form = useDetectedEditForm(props.item, props.onSave);
  return (
    <div className={editStyles.form}>
      <Input label="Merchant" value={form.values.merchant} onChange={form.setMerchant} placeholder="Who was paid" />
      <OptionChips<DetectedType> options={form.typeOptions} value={form.values.transactionType} onChange={form.setTransactionType} getLabel={typeLabel} />
      <div className={editStyles.row}>
        {form.showCategory ? (
          <SheetSelect
            value={form.values.categoryId}
            options={props.categoryIds}
            onChange={form.setCategoryId}
            getLabel={props.categoryLabel}
            getColor={props.categoryColor}
            title="Category"
            placeholder="Choose a category"
          />
        ) : null}
        <SheetSelect
          value={form.values.financialAccountId}
          options={props.accountIds}
          onChange={form.setFinancialAccountId}
          getLabel={props.accountLabel}
          title="Account"
          placeholder="No account"
        />
      </div>
      <Input label="Note" value={form.values.notes} onChange={form.setNotes} placeholder="Optional" />
      <div className={editStyles.footer}>
        <button type="button" className={cardStyles.button} onClick={props.onCancel} disabled={props.saving}>
          Cancel
        </button>
        <button type="button" className={cardStyles.buttonPrimary} onClick={form.save} disabled={props.saving}>
          {props.saving ? 'Adding…' : 'Save and add'}
        </button>
      </div>
    </div>
  );
}
