import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useExpenseDetail } from '../hooks/useExpenses';
import { PAYMENT_METHODS } from '@/shared/constants/config';

export function ExpenseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { txn, isLoading, editing, error, setError, startEdit, cancelEdit, confirmDelete, updateMutation, deleteMutation, duplicateMutation } = useExpenseDetail(id);
  const [amount, setAmount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [date, setDate] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading || !txn) return null;

  if (editing) {
    const handleSave = (e: FormEvent) => { e.preventDefault(); updateMutation.mutate({ amount: Number(amount), merchant, date, paymentMethod, notes: notes || undefined }); };
    return (
      <FormStackScreen title="Edit Expense" onBack={cancelEdit}>
        <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" leftIcon="dollar" />
          <Input label="Merchant" value={merchant} onChange={(e) => setMerchant(e.target.value)} placeholder="e.g. Starbucks" />
          <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Payment Method</label>
          <OptionChipList items={PAYMENT_METHODS.map((p) => ({ id: p.id, label: p.label }))} selectedId={paymentMethod} onSelect={setPaymentMethod} />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} multiline />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Save Changes" onPress={handleSave} loading={updateMutation.isPending} size="lg" />
          <Button title="Cancel" onPress={cancelEdit} variant="outline" />
        </form>
      </FormStackScreen>
    );
  }

  return (
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
          <Button title="Edit" onPress={() => { startEdit(); setAmount(String(txn.amount)); setMerchant(txn.merchant ?? ''); setDate(txn.date); setPaymentMethod(txn.paymentMethod ?? 'cash'); setNotes(txn.notes ?? ''); }} variant="outline" size="lg" icon="edit" />
          <Button title="Duplicate" onPress={() => duplicateMutation.mutate()} variant="secondary" size="lg" loading={duplicateMutation.isPending} />
          <Button title="Delete" onPress={confirmDelete} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
        </div>
      </div>
    </FormStackScreen>
  );
}

function DetailRow({ theme, label, value }: { theme: ReturnType<typeof useTheme>; label: string; value: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: theme.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{label}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: theme.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{value}</span></div>;
}
