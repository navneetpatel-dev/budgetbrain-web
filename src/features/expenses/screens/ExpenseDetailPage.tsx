import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChipList, OptionChips } from '@/shared/components/ui/feature-screen';
import { Button, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useExpenseDetail } from '../hooks/useExpenses';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { TagInput } from '../components/TagInput';
import { SplitWithFamilyField, type SplitPayload } from '@/features/family/components/SplitWithFamilyField';
import { useCreateSplit } from '@/features/shared/hooks/useFeatures';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import {
  maxLen,
  validateAmount,
  validateBoundedDate,
  validateOptionalText,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';
import { DateBounds } from '@/shared/utils/dateBounds';

type FieldErrors = {
  amount?: string;
  merchant?: string;
  date?: string;
  notes?: string;
  categoryId?: string;
};

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { txn, isLoading, isError, refetch, editing, error, setError, startEdit, cancelEdit, updateMutation, deleteMutation, duplicateMutation, showSuccess } = useExpenseDetail(id);
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [splitPayload, setSplitPayload] = useState<SplitPayload | null>(null);
  const [splitSaved, setSplitSaved] = useState(false);
  const createSplitMutation = useCreateSplit();

  if (isLoading) {
    return (
      <FormStackScreen title="Expense">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !txn) {
    return (
      <FormStackScreen title="Expense">
        <EmptyState
          icon="activity"
          title="Couldn’t load expense"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteExpense)) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const handleSave = (e?: FormEvent) => {
      e?.preventDefault();
      setError(null);
      const next: FieldErrors = {};
      const amountErr = validateAmount(amount);
      const merchantErr = validateText('merchant', merchant);
      const dateErr = validateBoundedDate('transaction', date);
      const notesErr = validateOptionalText('notes', notes);
      if (amountErr) next.amount = amountErr;
      if (merchantErr) next.merchant = merchantErr;
      if (dateErr) next.date = dateErr;
      if (notesErr) next.notes = notesErr;
      if (!categoryId) next.categoryId = ValidationMessages.categoryRequired;
      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate({
        amount: Number(amount),
        merchant,
        date,
        paymentMethod,
        categoryId,
        notes: notes || undefined,
        tags,
      });
    };
    return (
      <FormStackScreen title="Edit Expense" onBack={cancelEdit}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" leftIcon="dollar" disabled={isPending} error={fieldErrors.amount} />
          <Input label="Merchant" maxLength={maxLen('merchant')} value={merchant} onChange={(e) => { setMerchant(e.target.value); setFieldErrors((f) => ({ ...f, merchant: undefined })); }} placeholder="e.g. Starbucks" disabled={isPending} error={fieldErrors.merchant} />
          <Input
            label="Date"
            value={date}
            onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }}
            type="date"
            min={DateBounds.transaction(date).min}
            max={DateBounds.transaction(date).max}
            disabled={isPending}
            error={fieldErrors.date}
          />
          <FormFieldLabel>Payment Method</FormFieldLabel>
          <OptionChips
            options={PAYMENT_METHODS.map((p) => p.id)}
            value={paymentMethod}
            onChange={setPaymentMethod}
            getLabel={(v) => PAYMENT_METHODS.find((p) => p.id === v)?.label ?? v}
            disabled={isPending}
          />
          <FormFieldLabel>Category</FormFieldLabel>
          <OptionChipList
            items={(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined }))}
            selectedId={categoryId}
            onSelect={(id) => { setCategoryId(id); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
            disabled={isPending}
            error={fieldErrors.categoryId}
          />
          <Input label="Notes" maxLength={maxLen('notes')} value={notes} onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }} multiline disabled={isPending} error={fieldErrors.notes} />
          <TagInput value={tags} onChange={setTags} disabled={isPending} />
          {error ? <FormErrorBanner message={error} /> : null}
          <FormActions
            primaryTitle="Save Changes"
            onPrimary={handleSave}
            primaryLoading={isPending}
            secondaryTitle="Cancel"
            onSecondary={cancelEdit}
          />
        </form>
      </FormStackScreen>
    );
  }

  const title = txn.merchant || txn.category?.name || (txn.type === 'expense' ? 'Expense' : 'Income');
  const amountPrefix = txn.type === 'expense' ? '-' : '+';

  return (
    <>
      <FormStackScreen title={title} eyebrow={txn.type === 'expense' ? 'Expense' : 'Income'}>
        {showSuccess ? <FormSuccessBanner message="Changes saved" /> : null}
        <DetailHero
          amount={`${amountPrefix}${formatCurrency(txn.amount, txn.currency)}`}
          amountColor={txn.type === 'expense' ? theme.colors.danger : theme.colors.success}
          subtitle={txn.category?.name ?? undefined}
        />
        <DetailMetaList
          rows={[
            { label: 'Merchant', value: txn.merchant ?? '' },
            { label: 'Category', value: txn.category?.name ?? '' },
            { label: 'Date', value: txn.date },
            { label: 'Payment', value: txn.paymentMethod ? txn.paymentMethod.replace(/_/g, ' ') : '' },
            { label: 'Notes', value: txn.notes ?? '' },
            { label: 'Tags', value: (txn.tags ?? []).join(', ') },
          ]}
        />
        <DetailActions
          primaryTitle="Edit"
          onPrimary={() => {
            startEdit();
            setAmount(String(txn.amount));
            setMerchant(txn.merchant ?? '');
            setDate(txn.date);
            setPaymentMethod(txn.paymentMethod ?? 'cash');
            setCategoryId(txn.categoryId ?? txn.category?.id ?? '');
            setNotes(txn.notes ?? '');
            setTags(txn.tags ?? []);
            setFieldErrors({});
          }}
          secondaryTitle="Duplicate"
          onSecondary={() => duplicateMutation.mutate()}
          secondaryLoading={duplicateMutation.isPending}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
        {txn.type === 'expense' ? (
          <div style={{ marginTop: theme.spacing.xl }}>
            <SplitWithFamilyField amount={txn.amount} onSplitChange={setSplitPayload} disabled={createSplitMutation.isPending} />
            {splitPayload ? (
              <Button
                title={splitSaved ? 'Split saved' : 'Save split'}
                onPress={() => {
                  createSplitMutation.mutate(
                    { groupId: splitPayload.groupId, transactionId: txn.id, participants: splitPayload.participants },
                    { onSuccess: () => setSplitSaved(true) }
                  );
                }}
                loading={createSplitMutation.isPending}
                variant="outline"
              />
            ) : null}
          </div>
        ) : null}
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
