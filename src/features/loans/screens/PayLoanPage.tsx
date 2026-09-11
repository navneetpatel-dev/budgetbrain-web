import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { usePayLoan } from '../hooks/useLoans';
import { maxLen, validateAmount, validateOptionalText } from '@/shared/validation/fieldLimits';

export function PayLoanPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { payMutation, error, setError } = usePayLoan(id);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [notesError, setNotesError] = useState<string>();

  const isPending = payMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountErr = validateAmount(amount);
    const notesErr = validateOptionalText('notes', notes);
    setAmountError(amountErr);
    setNotesError(notesErr);
    if (amountErr || notesErr) return;
    payMutation.mutate({ amount: Number(amount), notes: notes || undefined });
  };

  return (
    <FormStackScreen title="Make a Payment" eyebrow="Loan" icon="creditCard">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Amount"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setAmountError(undefined); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={amountError}
        />
        <Input label="Notes (optional)" value={notes} onChange={(e) => { setNotes(e.target.value); setNotesError(undefined); }} maxLength={maxLen('notes')} error={notesError} placeholder="Optional note" multiline disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Record Payment" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
