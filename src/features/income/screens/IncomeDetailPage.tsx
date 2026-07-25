import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, DetailActions, DetailHero, DetailMetaList, EmptyState, FormActions, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useIncomeDetail } from '../hooks/useIncome';
import { maxLen, validateAmount, validateDate, validateOptionalText } from '@/shared/validation/fieldLimits';

export function IncomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const {
    income,
    isLoading,
    isError,
    refetch,
    editing,
    error,
    setError,
    setEditing,
    updateMutation,
    deleteMutation,
    duplicateMutation,
  } = useIncomeDetail(id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; date?: string; notes?: string }>({});

  if (isLoading) {
    return (
      <FormStackScreen title="Income">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  if (isError || !income) {
    return (
      <FormStackScreen title="Income">
        <EmptyState
          icon="income"
          title="Couldn’t load income"
          subtitle="Check your connection and try again"
          action="Retry"
          onAction={() => void refetch()}
        />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteIncome)) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = () => {
      setError(null);
      const next: typeof fieldErrors = {};
      const amountErr = validateAmount(amount);
      const dateErr = validateDate(date);
      const notesErr = validateOptionalText('notes', notes);
      if (amountErr) next.amount = amountErr;
      if (dateErr) next.date = dateErr;
      if (notesErr) next.notes = notesErr;

      setFieldErrors(next);
      if (Object.keys(next).length) return;
      updateMutation.mutate({ amount: Number(amount), date, notes: notes || undefined });
    };
    return (
      <FormStackScreen title="Edit Income" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" leftIcon="dollar" disabled={isPending} error={fieldErrors.amount} />
          <Input label="Date" value={date} onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }} type="date" disabled={isPending} error={fieldErrors.date} />
          <Input label="Notes" value={notes} onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }} placeholder="Optional note" multiline disabled={isPending} maxLength={maxLen('notes')} error={fieldErrors.notes} />
          {error ? <FormErrorBanner message={error} /> : null}
          <FormActions
            primaryTitle="Save Changes"
            onPrimary={save}
            primaryLoading={isPending}
            secondaryTitle="Cancel"
            onSecondary={() => setEditing(false)}
          />
        </form>
      </FormStackScreen>
    );
  }

  return (
    <>
      <FormStackScreen title={income.merchant || 'Income'} eyebrow="Income">
        <DetailHero
          amount={`+${formatCurrency(income.amount, income.currency)}`}
          amountColor={theme.colors.success}
          subtitle={income.date}
        />
        <DetailMetaList
          rows={[
            { label: 'Date', value: income.date },
            { label: 'Merchant', value: income.merchant ?? '' },
            { label: 'Notes', value: income.notes ?? '' },
          ]}
        />
        <DetailActions
          primaryTitle="Edit"
          onPrimary={() => { setAmount(String(income.amount)); setDate(income.date); setNotes(income.notes ?? ''); setEditing(true); }}
          secondaryTitle="Duplicate"
          onSecondary={() => duplicateMutation.mutate()}
          secondaryLoading={duplicateMutation.isPending}
          onDestructive={() => { void handleDelete(); }}
          destructiveLoading={deleteMutation.isPending}
        />
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}
