'use client';

import { useState, useEffect, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { FormStackScreen, OptionChipList, OptionChips } from '@/shared/components/ui/feature-screen';
import { Button, Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useExpenseDetail } from '../../hooks/expenses/useExpenses.hook';
import { useCategories } from '@/features/categories';
import { TagInput } from '../../components/expenses/TagInput.component';
import { SplitWithFamilyField, type SplitPayload } from '@/features/family';
import { useCreateSplit } from '@/shared/hooks';
import { ReceiptUploader } from '../../components/expenses/ReceiptUploader.component';
import { useReceiptAttachment, type Attachment, type ReceiptExtraction } from '../../hooks/expenses/useReceiptAttachment.hook';
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

export function ExpenseDetailPage({ id: propId }: { id?: string } = {}) {
  const nextParams = useParams();
  const id = propId ?? (nextParams?.id as string | undefined);
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

  const { uploadReceipt, fetchAttachments, fetchSuggestion, deleteReceipt } = useReceiptAttachment();
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [checkingScan, setCheckingScan] = useState(false);
  const [scanMessage, setScanMessage] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      setLoadingAttachments(true);
      fetchAttachments(id)
        .then(setAttachments)
        .finally(() => setLoadingAttachments(false));
    }
  }, [id, fetchAttachments]);

  const handleUploadNew = async (file: File | null) => {
    if (!file || !id) return;
    try {
      const uploaded = await uploadReceipt(id, file);
      setAttachments((prev) => [...prev, uploaded]);
    } catch {
      // error handled in hook
    }
  };

  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!id) return;
    try {
      await deleteReceipt(id, attachmentId);
      setAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      // error handled in hook
    }
  };

  const handleCheckScan = async () => {
    if (!id || !txn || attachments.length === 0) return;
    setCheckingScan(true);
    setScanMessage(null);
    try {
      const latest = attachments[attachments.length - 1];
      const suggestion: ReceiptExtraction | null = await fetchSuggestion(id, latest.id);

      const diffs: string[] = [];
      if (suggestion?.merchant && suggestion.merchant !== txn.merchant) {
        diffs.push(`Merchant: "${suggestion.merchant}"`);
      }
      if (suggestion?.amount != null && Number(suggestion.amount) !== Number(txn.amount)) {
        diffs.push(`Amount: ${formatCurrency(suggestion.amount, txn.currency)}`);
      }
      if (suggestion?.date && suggestion.date !== txn.date) {
        diffs.push(`Date: ${suggestion.date}`);
      }

      if (!suggestion || diffs.length === 0) {
        setScanMessage(
          suggestion
            ? 'Scanned details match what you already entered.'
            : "No scan available yet — receipt scanning finishes shortly after upload. Try again in a moment."
        );
        return;
      }

      const shouldApply = await confirm({
        title: 'Apply scanned details?',
        message: `We scanned this receipt and found:\n${diffs.join('\n')}\n\nApply these to the expense?`,
        confirmLabel: 'Apply',
        cancelLabel: 'Not now',
      });
      if (!shouldApply) return;

      updateMutation.mutate({
        amount: suggestion.amount != null ? Number(suggestion.amount) : Number(txn.amount),
        merchant: suggestion.merchant ?? txn.merchant ?? '',
        date: suggestion.date ?? txn.date,
        paymentMethod: txn.paymentMethod ?? 'cash',
        categoryId: txn.categoryId ?? txn.category?.id ?? '',
        notes: txn.notes ?? undefined,
        tags: txn.tags ?? [],
      });
    } finally {
      setCheckingScan(false);
    }
  };

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
          <ReceiptUploader
            existingAttachments={attachments}
            onFileSelect={handleUploadNew}
            onDeleteExisting={handleDeleteAttachment}
            disabled={loadingAttachments || isPending}
          />
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
        <div style={{ marginTop: theme.spacing.lg }}>
          <ReceiptUploader
            existingAttachments={attachments}
            onFileSelect={handleUploadNew}
            onDeleteExisting={handleDeleteAttachment}
            disabled={loadingAttachments}
          />
          {attachments.length > 0 ? (
            <div style={{ marginTop: theme.spacing.sm }}>
              <Button
                title="Check for scanned details"
                onPress={() => { void handleCheckScan(); }}
                loading={checkingScan}
                variant="outline"
              />
              {scanMessage ? (
                <p style={{ marginTop: theme.spacing.xs, color: theme.colors.textSecondary, fontSize: 13 }}>
                  {scanMessage}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
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
