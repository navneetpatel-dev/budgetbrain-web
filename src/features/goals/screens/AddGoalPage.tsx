import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateGoal } from '../hooks/useGoals';
import { GOAL_TYPES } from '@/shared/constants/config';

export function AddGoalPage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateGoal();
  const [name, setName] = useState('');
  const [type, setType] = useState('emergency_fund');
  const [targetAmount, setTargetAmount] = useState('');
  const [targetDate, setTargetDate] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !targetAmount) { setError('Name and target amount are required'); return; }
    createMutation.mutate({ name, type, targetAmount: Number(targetAmount), targetDate: targetDate || undefined });
  };

  return (
    <FormStackScreen title="Create Goal" eyebrow="New Goal" icon="target">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input label="Goal Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Vacation Fund" />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Type</label>
        <OptionChips options={GOAL_TYPES.map((t) => t.id)} value={type} onChange={setType} getLabel={(v) => GOAL_TYPES.find((t) => t.id === v)?.label ?? v} />
        <Input label="Target Amount" value={targetAmount} onChange={(e) => setTargetAmount(e.target.value)} placeholder="0.00" type="number" leftIcon="dollar" />
        <Input label="Target Date (optional)" value={targetDate} onChange={(e) => setTargetDate(e.target.value)} type="date" />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <Button title="Create Goal" onPress={handleSubmit} loading={createMutation.isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
