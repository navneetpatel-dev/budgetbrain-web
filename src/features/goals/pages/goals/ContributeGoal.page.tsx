'use client';

import { useState, type FormEvent } from 'react';
import { useParams } from 'next/navigation';
import { FormStackScreen } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner, FormSuccessBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useContributeGoal } from '../../hooks/goals/useGoals.hook';
import { maxLen, validateAmount, validateOptionalText } from '@/shared/validation/fieldLimits';

export function ContributeGoalPage({ id: propId }: { id?: string } = {}) {
  const nextParams = useParams();
  const id = propId ?? (nextParams?.id as string | undefined);
  const theme = useTheme();
  const { contributeMutation, error, setError, showSuccess } = useContributeGoal(id);
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [amountError, setAmountError] = useState<string>();
  const [notesError, setNotesError] = useState<string>();

  const isPending = contributeMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const amountErr = validateAmount(amount);
    const notesErr = validateOptionalText('notes', notes);
    setAmountError(amountErr);
    setNotesError(notesErr);
    if (amountErr || notesErr) return;
    setAmountError(undefined);
    setNotesError(undefined);
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
        <Input label="Notes (optional)" value={notes} onChange={(e) => { setNotes(e.target.value); setNotesError(undefined); }} maxLength={maxLen('notes')} error={notesError} placeholder="Optional note" multiline disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        {showSuccess ? <FormSuccessBanner message="Contribution added" /> : null}
        <Button title="Add Contribution" onPress={handleSubmit} loading={isPending || showSuccess} disabled={showSuccess} size="lg" />
      </form>
    </FormStackScreen>
  );
}
