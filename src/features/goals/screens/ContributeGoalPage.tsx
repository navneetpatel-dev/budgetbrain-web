import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useContributeGoal } from '../hooks/useGoals';

export function ContributeGoalPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { contributeMutation, error, setError } = useContributeGoal(id);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState<string>();

  const isPending = contributeMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount.trim()) {
      setAmountError('Amount is required');
      return;
    }
    setAmountError(undefined);
    contributeMutation.mutate({ amount: Number(amount), notes: notes || undefined });
  };

  return (
    <FormStackScreen title="Contribute" eyebrow="Goal" icon="add">
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
        <Input label="Notes (optional)" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Add Contribution" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
