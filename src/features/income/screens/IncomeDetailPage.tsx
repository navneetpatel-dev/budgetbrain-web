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
import { maxLen, validateAmount, validateDate, validateOptionalText } from '@/shared/validation/fieldLimits';

export function IncomeDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { confirm, accept, cancel, copy, open } = useConfirmDialog();
  const { income, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useIncomeDetail(id);
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState('');
  const [notes, setNotes] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ amount?: string; date?: string; notes?: string }>({});

  if (isLoading || !income) {
    return (
      <FormStackScreen title="Income">
        <DetailSkeleton />
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
  return <div><span style={{ display: 'block', fontSize: 12, fontWeight: 600, letterSpacing: '0.2px', color: t.colors.textTertiary, fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
