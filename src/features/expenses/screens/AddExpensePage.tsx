import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateExpense } from '../hooks/useExpenses';
import { PAYMENT_METHODS } from '@/shared/constants/config';

type FieldErrors = { amount?: string; merchant?: string; date?: string };

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateExpense();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    if (!amount.trim()) next.amount = 'Amount is required';
    if (!merchant.trim()) next.merchant = 'Merchant is required';
    if (!date) next.date = 'Date is required';
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({ type: 'expense', amount: Number(amount), merchant, date, paymentMethod, notes: notes || undefined });
  };

  return (
    <FormStackScreen title="Add Expense" eyebrow="New Transaction" icon="receipt">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
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
          disabled={isPending}
          error={fieldErrors.merchant}
        />
        <Input
          label="Date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }}
          type="date"
          disabled={isPending}
          error={fieldErrors.date}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
        <OptionChipList items={PAYMENT_METHODS.map((p) => ({ id: p.id, label: p.label }))} selectedId={paymentMethod} onSelect={setPaymentMethod} disabled={isPending} />
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Save Expense" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
