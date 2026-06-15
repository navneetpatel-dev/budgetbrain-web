import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useIncomeDetail } from '../hooks/useIncome';

export function IncomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { income, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useIncomeDetail(id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading || !income) return null;

  if (editing) {
    const save = () => updateMutation.mutate({ amount: Number(amount), date, notes: notes || undefined });
    return (
      <FormStackScreen title="Edit Income" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" leftIcon="dollar" />
          <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Save Changes" onPress={save} loading={updateMutation.isPending} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" />
        </form>
      </FormStackScreen>
    );
  }

  return (
    <FormStackScreen title="Income Detail" eyebrow="Income">
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <div style={{ textAlign: 'center', padding: `${theme.spacing.xl}px 0` }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: theme.colors.success }}>+{formatCurrency(income.amount, income.currency)}</span>
        </div>
        <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Row t={theme} l="Date" v={income.date} />
          <Row t={theme} l="Merchant" v={income.merchant ?? '-'} />
          {income.notes && <Row t={theme} l="Notes" v={income.notes} />}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <Button title="Edit" onPress={() => { setAmount(String(income.amount)); setDate(income.date); setNotes(income.notes ?? ''); setEditing(true); }} variant="outline" size="lg" icon="edit" />
          <Button title="Delete" onPress={() => { if (window.confirm('Delete this income entry?')) deleteMutation.mutate(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
        </div>
      </div>
    </FormStackScreen>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
