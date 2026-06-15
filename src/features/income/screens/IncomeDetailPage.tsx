import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, FormErrorBanner } from '@/shared/components/ui/index';
import { ConfirmDialog } from '@/shared/components/ui/ConfirmDialog';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useConfirmDialog } from '@/shared/hooks/useConfirmDialog';
import { CONFIRM } from '@/shared/constants/confirmations';
import { useIncomeDetail } from '../hooks/useIncome';

export function IncomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { income, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useIncomeDetail(id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');

  if (isLoading) return <DetailSkeleton />;
  if (!income) return null;

  const handleDelete = async () => {
    if (await confirm(CONFIRM.deleteIncome)) deleteMutation.mutate();
  };

  if (editing) {
    const isPending = updateMutation.isPending;
    const save = () => updateMutation.mutate({ amount: Number(amount), date, notes: notes || undefined });
    return (
      <FormStackScreen title="Edit Income" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" leftIcon="dollar" disabled={isPending} />
          <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" disabled={isPending} />
          <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline disabled={isPending} />
          {error ? <FormErrorBanner message={error} /> : null}
          <Button title="Save Changes" onPress={save} loading={isPending} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" disabled={isPending} />
        </form>
      </FormStackScreen>
    );
  }

  return (
    <>
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
            <Button title="Delete" onPress={() => { void handleDelete(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
          </div>
        </div>
      </FormStackScreen>
      <ConfirmDialog open={open} copy={copy} onCancel={cancel} onConfirm={accept} />
    </>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
