import { useState, type FormEvent } from 'react';
import { Button, Input, fieldControlStyle, FormErrorBanner } from '@/shared/components/ui/index';
import { OptionChips, MultiOptionChips, StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { useTheme } from '@/shared/theme';
import { useOnboarding } from '@/features/auth/hooks/useAuthHooks';
import { COUNTRIES, CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/shared/constants/config';

export function OnboardingPage() {
  const theme = useTheme();
  const { submit, loading, error, clearError, setError } = useOnboarding();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('IN');
  const [currency, setCurrency] = useState('INR');
  const [goals, setGoals] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    clearError();
    if (!name) { setError('Please enter your name'); return; }
    if (!salaryRange) { setError('Select your salary range'); return; }
    if (!savingsTarget) { setError('Enter your monthly savings target'); return; }
    submit({ name, country, currency, financialGoals: goals, salaryRange, monthlySavingsTarget: Number(savingsTarget) });
  };

  const selectStyle = fieldControlStyle(theme);
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' };

  return (
    <StackScrollScreen header={<StackNavHeader title="Onboarding" subtitle="Tell us about yourself" showBack={false} />}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <Input label="Full Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" disabled={loading} />
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={labelStyle}>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading} style={selectStyle}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
        </div>
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={labelStyle}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={loading} style={selectStyle}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}</select>
        </div>
        <div><label style={labelStyle}>Financial Goals</label><MultiOptionChips options={FINANCIAL_GOALS.map((g) => g.id)} selected={goals} onToggle={(id) => setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id])} getLabel={(id) => FINANCIAL_GOALS.find((g) => g.id === id)?.label ?? id} disabled={loading} /></div>
        <div><label style={labelStyle}>Salary Range</label><OptionChips options={SALARY_RANGES.map((s) => s.id)} value={salaryRange} onChange={setSalaryRange} getLabel={(id) => SALARY_RANGES.find((s) => s.id === id)?.label ?? id} disabled={loading} /></div>
        <Input label="Monthly Savings Target" value={savingsTarget} onChange={(e) => setSavingsTarget(e.target.value)} placeholder="e.g. 5000" type="number" disabled={loading} />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Complete Setup" onPress={handleSubmit} loading={loading} size="lg" />
      </form>
    </StackScrollScreen>
  );
}
