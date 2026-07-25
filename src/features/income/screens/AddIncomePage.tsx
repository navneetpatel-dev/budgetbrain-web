import { useState, type FormEvent } from 'react';
import { FormStackScreen, OptionChips, OptionChipList } from '@/shared/components/ui/feature-screen';
import { Input, Button, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useCreateIncome, useIncomeSources } from '../hooks/useIncome';

const SOURCE_TYPES = [
  { id: 'salary', label: 'Salary' }, { id: 'freelancing', label: 'Freelancing' },
  { id: 'investments', label: 'Investments' }, { id: 'rental', label: 'Rental' }, { id: 'other', label: 'Other' },
];

type FieldErrors = { amount?: string; date?: string; selectedSource?: string; newSourceName?: string };

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
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const isPending = createMutation.isPending;

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const next: FieldErrors = {};
    if (!amount.trim()) next.amount = 'Amount is required';
    if (!date) next.date = 'Date is required';
    if (sourceMode === 'existing' && !selectedSource) next.selectedSource = 'Select an income source';
    if (sourceMode === 'new' && !newSourceName.trim()) next.newSourceName = 'Source name is required';
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    createMutation.mutate({
      amount,
      date,
      notes: notes || undefined,
      incomeSourceId: sourceMode === 'existing' ? selectedSource : undefined,
      newSourceName: sourceMode === 'new' ? newSourceName : undefined,
      newSourceType,
    });
  };

  return (
    <FormStackScreen title="Add Income" eyebrow="Income" icon="trendingUp">
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
        <Input
          label="Amount"
          value={amount}
          onChange={(e) => { setAmount(e.target.value); setFieldErrors((f) => ({ ...f, amount: undefined })); }}
          placeholder="0.00"
          type="number"
          leftIcon="dollar"
          disabled={isPending}
          error={fieldErrors.amount}
        />
        <Input
          label="Date"
          value={date}
          onChange={(e) => { setDate(e.target.value); setFieldErrors((f) => ({ ...f, date: undefined })); }}
          type="date"
          disabled={isPending}
          error={fieldErrors.date}
        />
        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' }}>Source</label>
        <OptionChips
          options={['existing', 'new'] as const}
          value={sourceMode}
          onChange={(mode) => {
            setSourceMode(mode);
            setFieldErrors((f) => ({ ...f, selectedSource: undefined, newSourceName: undefined }));
          }}
          getLabel={(v) => v === 'existing' ? 'Existing source' : 'New source'}
          disabled={isPending}
        />
        {sourceMode === 'existing' ? (
          <OptionChipList
            items={sources.map((s) => ({ id: s.id, label: s.name }))}
            selectedId={selectedSource}
            onSelect={(id) => {
              setSelectedSource(id);
              setFieldErrors((f) => ({ ...f, selectedSource: undefined }));
            }}
            error={fieldErrors.selectedSource}
            disabled={isPending}
          />
        ) : (
          <>
            <Input
              label="Source Name"
              value={newSourceName}
              onChange={(e) => { setNewSourceName(e.target.value); setFieldErrors((f) => ({ ...f, newSourceName: undefined })); }}
              placeholder="e.g. Salary"
              disabled={isPending}
              error={fieldErrors.newSourceName}
            />
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
