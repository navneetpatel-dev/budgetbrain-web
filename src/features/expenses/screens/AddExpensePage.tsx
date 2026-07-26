import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChipList, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateExpense } from '../hooks/useExpenses';
import { useCategories } from '@/features/categories/hooks/useCategories';
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

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateExpense();
  const { categories } = useCategories();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
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
    createMutation.mutate({
      type: 'expense',
      amount: Number(amount),
      merchant,
      date,
      paymentMethod,
      categoryId,
      notes: notes || undefined,
    });
  };

  return (
    <FormStackScreen title="Add Expense" eyebrow="New Transaction" icon="receipt">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <Input
          label="Amount"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.amount}
        />
        <Input
          label="Merchant"
          value={merchant}
          onChange={(e) => { setMerchant(e.target.value); setFieldErrors((f) => ({ ...f, merchant: undefined })); }}
          placeholder="e.g. Starbucks"
          maxLength={maxLen('merchant')}
          disabled={isPending}
          error={fieldErrors.merchant}
        />
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
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
        <OptionChips
          options={PAYMENT_METHODS.map((p) => p.id)}
          value={paymentMethod}
          onChange={setPaymentMethod}
          getLabel={(v) => PAYMENT_METHODS.find((p) => p.id === v)?.label ?? v}
          disabled={isPending}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Category</label>
        <OptionChipList
          items={(categories ?? []).map((c) => ({ id: c.id, label: c.name, color: c.color ?? undefined }))}
          selectedId={categoryId}
          onSelect={(id) => { setCategoryId(id); setFieldErrors((f) => ({ ...f, categoryId: undefined })); }}
          disabled={isPending}
          error={fieldErrors.categoryId}
        />
        <Input
          label="Notes"
          maxLength={maxLen('notes')}
          value={notes}
          onChange={(e) => { setNotes(e.target.value); setFieldErrors((f) => ({ ...f, notes: undefined })); }}
          placeholder="Optional note"
          multiline
          disabled={isPending}
          error={fieldErrors.notes}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Save Expense" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
