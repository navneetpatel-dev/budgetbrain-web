import { useState, type FormEvent } from 'react';
import { useParams } from 'react-router-dom';
import { FormStackScreen, OptionChips } from '@/shared/components/ui/feature-screen';
import { Input, Button, Card, ProgressBar } from '@/shared/components/ui/index';
import { DetailSkeleton } from '@/shared/components/ui/skeleton';
import { useTheme } from '@/shared/theme';
import { formatCurrency } from '@/shared/utils/currency';
import { useBudgetDetail } from '../hooks/useBudgets';
import { BUDGET_TYPES } from '@/shared/constants/config';

export function BudgetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const theme = useTheme();
  const { budget, isLoading, editing, error, setError, setEditing, updateMutation, deleteMutation } = useBudgetDetail(id);
  const [name, setName] = useState('');
  const [type, setType] = useState<'monthly' | 'weekly' | 'category'>('monthly');
  const [amount, setAmount] = useState('');
  const [alertThreshold, setAlertThreshold] = useState('');

  if (isLoading || !budget) return <DetailSkeleton />;

  if (editing) {
    const save = () => updateMutation.mutate({ name, type, amount: Number(amount), alertThreshold: Number(alertThreshold) });
    return (
      <FormStackScreen title="Edit Budget" onBack={() => setEditing(false)}>
        <form onSubmit={(e: FormEvent) => { e.preventDefault(); save(); }} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xs }}>
          <Input label="Budget Name" value={name} onChange={(e) => setName(e.target.value)} />
          <OptionChips options={BUDGET_TYPES.map((t) => t.id as 'monthly' | 'weekly' | 'category')} value={type} onChange={setType} getLabel={(v) => BUDGET_TYPES.find((t) => t.id === v)?.label ?? v} />
          <Input label="Amount" value={amount} onChange={(e) => setAmount(e.target.value)} type="number" />
          <Input label="Alert Threshold (%)" value={alertThreshold} onChange={(e) => setAlertThreshold(e.target.value)} type="number" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Save Changes" onPress={save} loading={updateMutation.isPending} size="lg" />
          <Button title="Cancel" onPress={() => setEditing(false)} variant="outline" />
        </form>
      </FormStackScreen>
    );
  }

  const spent = budget.spent ?? 0;
  const pct = budget.amount > 0 ? Math.round((spent / budget.amount) * 100) : 0;

  return (
    <FormStackScreen title="Budget Detail" eyebrow={budget.type}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <Card variant="elevated">
          <div style={{ textAlign: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Spent</span>
            <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.amountLg.fontSize, fontWeight: Number(theme.typography.amountLg.fontWeight), color: theme.colors.text, margin: '4px 0' }}>{formatCurrency(spent, budget.currency)}<span style={{ fontSize: theme.typography.caption.fontSize, fontWeight: 500, color: theme.colors.textTertiary }}> / {formatCurrency(budget.amount, budget.currency)}</span></p>
            <ProgressBar progress={pct} color={pct >= 100 ? theme.colors.danger : pct >= budget.alertThreshold ? theme.colors.warning : theme.colors.success} />
            <span style={{ fontSize: 12, fontWeight: 500, color: theme.colors.textTertiary, marginTop: 4, display: 'block', fontFamily: 'Inter, sans-serif' }}>{pct}% used</span>
          </div>
        </Card>
        <Card variant="elevated" style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <Row t={theme} l="Name" v={budget.name} /><Row t={theme} l="Type" v={budget.type} /><Row t={theme} l="Alert" v={`${budget.alertThreshold}%`} /><Row t={theme} l="Started" v={budget.startDate} />{budget.endDate && <Row t={theme} l="Ends" v={budget.endDate} />}
        </Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm }}>
          <Button title="Edit" onPress={() => { setName(budget.name); setType(budget.type); setAmount(String(budget.amount)); setAlertThreshold(String(budget.alertThreshold)); setEditing(true); }} variant="outline" size="lg" icon="edit" />
          <Button title="Delete" onPress={() => { if (window.confirm('Delete this budget?')) deleteMutation.mutate(); }} variant="danger" size="lg" loading={deleteMutation.isPending} icon="trash" />
        </div>
      </div>
    </FormStackScreen>
  );
}

function Row({ t, l, v }: { t: ReturnType<typeof useTheme>; l: string; v: string }) {
  return <div><span style={{ display: 'block', fontSize: 11, fontWeight: 600, letterSpacing: '0.8px', color: t.colors.textTertiary, textTransform: 'uppercase', fontFamily: 'Inter, sans-serif' }}>{l}</span><span style={{ display: 'block', fontSize: 15, fontWeight: 500, color: t.colors.text, marginTop: 2, fontFamily: 'Inter, sans-serif' }}>{v}</span></div>;
}
