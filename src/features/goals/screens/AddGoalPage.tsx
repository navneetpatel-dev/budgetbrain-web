import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateGoal } from '../hooks/useGoals';
import { GOAL_TYPES } from '@/shared/constants/config';

type FieldErrors = { name?: string; targetAmount?: string };

export function AddGoalPage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateGoal();
  const [name, setName] = useState('');
  const [type, setType] = useState('emergency_fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    if (!name.trim()) next.name = 'Name is required';
    if (!targetAmount.trim()) next.targetAmount = 'Target amount is required';
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({ name, type, targetAmount: Number(targetAmount), targetDate: targetDate || undefined });
  };

  return (
    <FormStackScreen title="Create Goal" eyebrow="New Goal" icon="target">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Goal Name"
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="e.g. Vacation Fund"
          disabled={isPending}
          error={fieldErrors.name}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Type</label>
        <OptionChips options={GOAL_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => GOAL_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
        <Input
          label="Target Amount"
          value={targetAmount}
          onChange={(e) => { setTargetAmount(e.target.value); setFieldErrors((f) => ({ ...f, targetAmount: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.targetAmount}
        />
        <Input label="Target Date (optional)" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Create Goal" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
