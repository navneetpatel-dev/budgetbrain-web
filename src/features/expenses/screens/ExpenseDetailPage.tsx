import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useExpenseDetail } from '../hooks/useExpenses';
import { useCategories } from '@/features/categories/hooks/useCategories';
import { PAYMENT_METHODS } from '@/shared/constants/config';
import {
  maxLen,
  validateAmount,
  validateDate,
  validateOptionalText,
  validateText,
  ValidationMessages,
} from '@/shared/validation/fieldLimits';

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
  const { txn, isLoading, editing, error, setError, startEdit, cancelEdit, updateMutation, deleteMutation, duplicateMutation } = useExpenseDetail(id);
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  if (isLoading || !txn) {
    return (
      <FormStackScreen title="Expense">
        <DetailSkeleton />
      </FormStackScreen>
    );
  }

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteExpense)) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const handleSave = (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      const next: FieldErrors = {};
      const amountErr = validateAmount(amount);
      const merchantErr = validateText('merchant', merchant);
      const dateErr = validateDate(date);
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
      });
    };
    return (
      <FormStackScreen title="Edit Expense" onBack={cancelEdit}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }} type="number" leftIcon="dollar" disabled={isPending} error={fieldErrors.amount} />
          <Input label="Merchant" maxLength={maxLen('merchant')} value={merchant} onChange={(e) => { setMerchant(e.target.value); setFieldErrors((f) => ({ ...f, merchant: undefined })); }} placeholder="e.g. Starbucks" disabled={isPending} error={fieldErrors.merchant} />
          <Input label="Date" value={date} onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }} type="date" disabled={isPending} error={fieldErrors.date} />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
          <OptionChipList items={PAYMENT_METHODS.map((p) => ({ id: p.id, label: p.label }))} selectedId={paymentMethod} onSelect={setPaymentMethod} disabled={isPending} />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Category</label>
          <OptionChipList
            items={(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined }))}
            selectedId={categoryId}
            onSelect={(id) => { setCategoryId(id); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
            disabled={isPending}
            error={fieldErrors.categoryId}
          />
          <Input label="Notes" maxLength={maxLen('notes')} value={notes} onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }} multiline disabled={isPending} error={fieldErrors.notes} />
          {error ? <FormErrorBanner message={error} /> : null}
          <Button title="Save Changes" onPress={handleSave} loading={isPending} size="lg" />
          <Button title="Cancel" onPress={cancelEdit} variant="outline" disabled={isPending} />
        </form>
      </FormStackScreen>
    );
  }

  return (
    <>
      <FormStackScreen title="Expense Detail" eyebrow={txn.type}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
          <div style={{ textAlign: 'center', padding: `${theme.spacing.xl}px 0` }}>
            <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: txn.type === 'expense' ? theme.colors.danger : theme.colors.success }}>{txn.type === 'expense' ? '-' : '+'}{formatCurrency(txn.amount, txn.currency)}</span>
          </div>
          <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
            <DetailRow theme={theme} label="Merchant" value={txn.merchant ?? '-'} />
            <DetailRow theme={theme} label="Category" value={txn.category?.name ?? '-'} />
            <DetailRow theme={theme} label="Date" value={txn.date} />
            <DetailRow theme={theme} label="Payment" value={txn.paymentMethod ? txn.paymentMethod.replace('_', ' ') : '-'} />
            {txn.notes && <DetailRow theme={theme} label="Notes" value={txn.notes} />}
          </Card>
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
            <Button
              title="Edit"
              onPress={() => {
                startEdit();
                setAmount(String(txn.amount));
                setMerchant(txn.merchant ?? '');
                setDate(txn.date);
                setPaymentMethod(txn.paymentMethod ?? 'cash');
                setCategoryId(txn.categoryId ?? txn.category?.id ?? '');
                setNotes(txn.notes ?? '');
                setFieldErrors({});
              }}
              variant="outline"
              size="lg"
              icon="edit"
            />
            <Button title="Duplicate" onPress={() => duplicateMutation.mutate()} variant="secondary" size="lg" loading={duplicateMutation.isPending} />
            <Button title="Delete" onPress={() => { void handleDelete(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
          </div>
        </div>
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function DetailRow({ theme, label, value }: { theme: ReturnType<typeof useTheme>; label: string; value: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{label}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: theme.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{value}</span></div>;
}
