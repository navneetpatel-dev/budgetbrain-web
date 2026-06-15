import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateIncome, useIncomeSources } from '../hooks/useIncome';

const SOURCE_TYPES = [
  { id: 'salary', label: 'Salary' }, { id: 'freelancing', label: 'Freelancing' },
  { id: 'investments', label: 'Investments' }, { id: 'rental', label: 'Rental' }, { id: 'other', label: 'Other' },
];

export function AddIncomePage() {
  const theme = useTheme();
  const { createMutation, error, setError } = useCreateIncome();
  const { data: sources } = useIncomeSources();
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [sourceMode, setSourceMode] = useState<'existing' | 'new'>('existing');
  const [selectedSource, setSelectedSource] = useState('');
  const [newSourceName, setNewSourceName] = useState('');
  const [newSourceType, setNewSourceType] = useState('salary');

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!amount) { setError('Amount is required'); return; }
    createMutation.mutate({ amount, date, notes: notes || undefined, incomeSourceId: sourceMode === 'existing' ? selectedSource : undefined, newSourceName: sourceMode === 'new' ? newSourceName : undefined, newSourceType });
  };

  return (
    <FormStackScreen title="Add Income" eyebrow="Income" icon="trendingUp">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" type="number" leftIcon="dollar" disabled={isPending} />
        <Input label="Date" value={date} onChange={(e) => setDate(e.target.value)} type="date" disabled={isPending} />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Source</label>
        <OptionChips options={['existing', 'new'] as const} value={sourceMode} onChange={setSourceMode} getLabel={(v) => v === 'existing' ? 'Existing source' : 'New source'} disabled={isPending} />
        {sourceMode === 'existing' ? (
          <OptionChipList items={(sources ?? []).map((s) => ({ id: s.id, label: s.name }))} selectedId={selectedSource} onSelect={setSelectedSource} disabled={isPending} />
        ) : (
          <>
            <Input label="Source Name" value={newSourceName} onChange={(e) => setNewSourceName(e.target.value)} placeholder="e.g. Salary" disabled={isPending} />
            <OptionChips options={SOURCE_TYPES.map((t) => t.id)} value={newSourceType} onChange={setNewSourceType} getLabel={(v) => SOURCE_TYPES.find((t) => t.id === v)?.label ?? v} disabled={isPending} />
          </>
        )}
        <Input label="Notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Optional note" multiline disabled={isPending} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Save Income" onPress={handleSubmit} loading={isPending} size="lg" />
      </form>
    </FormStackScreen>
  );
}
