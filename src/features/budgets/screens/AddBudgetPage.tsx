import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateBudget } from '../hooks/useBudgets';
import { BUDGET_TYPES } from '@/shared/constants/config';

export function AddBudgetPage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateBudget();
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'weekly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [alertThreshold, setAlertThreshold] = useState('80');

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !amount) { setError('Name and amount are required'); return; }
    createMutation.mutate({ name, type, amount: Number(amount), startDate, alertThreshold: Number(alertThreshold) });
  };

  return (
    <FormStackScreen title="Create Budget" eyebrow="New Budget" icon="budgets">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input label="Budget Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Groceries" disabled={isPending} />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Type</label>
        <OptionChips options={BUDGET_TYPES.map((t) => t.id as 'monthly' | 'weekly' | 'category')} value={type} onChange={setType} getLabel={(v) => BUDGET_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
        <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" leftIcon="dollar" disabled={isPending} />
        <Input label="Start Date" value={startDate} onChange={(e) => setStartDate(e.target.value)} type="date" disabled={isPending} />
        <Input label="Alert Threshold (%)" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} placeholder="80" type="number" helperText="Get notified when spending reaches this percentage" disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Create Budget" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
