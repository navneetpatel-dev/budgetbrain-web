import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateExpense } from '../hooks/useExpenses';
import { PAYMENT_METHODS } from '@/shared/constants/config';

export function AddExpensePage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateExpense();
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [notes, setNotes] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount || !merchant) { setError('Amount and merchant are required'); return; }
    createMutation.mutate({ type: 'expense', amount: Number(amount), merchant, date, paymentMethod, notes: notes || undefined });
  };

  return (
    <FormStackScreen title="Add Expense" eyebrow="New Transaction" icon="receipt">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" leftIcon="dollar" />
        <Input label="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Starbucks" />
        <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
        <OptionChipList items={PAYMENT_METHODS.map((p) => ({ id: p.id, label: p.label }))} selectedId={paymentMethod} onSelect={setPaymentMethod} />
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <Button title="Save Expense" onPress={handleSubmit} loading={createMutation.isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
