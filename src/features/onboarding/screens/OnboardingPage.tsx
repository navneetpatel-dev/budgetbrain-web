import { useState, type FormEvent } from 'react';
import { Button, Input, fieldControlStyle, FormErrorBanner } from '@/shared/components/ui/index';
import { OptionChips, MultiOptionChips, StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { useTheme } from '@/shared/theme';
import { useOnboarding } from '@/features/auth/hooks/useAuthHooks';
import { COUNTRIES, CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/shared/constants/config';
import { validateAmount, validateText, ValidationMessages } from '@/shared/validation/fieldLimits';

type FieldErrors = { name?: string; country?: string; salaryRange?: string; savingsTarget?: string; goals?: string };

export function OnboardingPage() {
  const theme = useTheme();
  const { submit, loading, error, clearError } = useOnboarding();
  const [name, setName] = useState('');
  const [country, setCountry] = useState('IN');
  const [currency, setCurrency] = useState('INR');
  const [goals, setGoals] = useState<string[]>([]);
  const [salaryRange, setSalaryRange] = useState('');
  const [savingsTarget, setSavingsTarget] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    clearError();
    const next: FieldErrors = {};
    const nameErr = validateText('name', name);
    const countryErr = validateText('country', country);
    const salaryErr = validateText('salaryRange', salaryRange);
    const savingsErr = validateAmount(savingsTarget);
    if (nameErr) next.name = nameErr;
    if (countryErr) next.country = countryErr;
    if (salaryErr) next.salaryRange = salaryErr;
    if (savingsErr) next.savingsTarget = savingsErr;
    if (goals.length === 0) next.goals = ValidationMessages.financialGoalsMin;
    else if (goals.length > 20) next.goals = ValidationMessages.financialGoalsMax;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    submit({ name, country, currency, financialGoals: goals, salaryRange, monthlySavingsTarget: Number(savingsTarget) });
  };

  const selectStyle = fieldControlStyle(theme);
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: theme.colors.textSecondary, marginBottom: theme.spacing.sm, fontFamily: 'Inter, sans-serif' };

  return (
    <StackScrollScreen header={<StackNavHeader title="Onboarding" subtitle="Tell us about yourself" showBack={false} />}>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.lg }}>
        <Input
          label="Full Name"
          maxLength={maxLen('name')}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="Your name"
          disabled={loading}
          error={fieldErrors.name}
        />
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={labelStyle}>Country</label>
          <select value={country} onChange={(e) => setCountry(e.target.value)} disabled={loading} style={selectStyle}>{COUNTRIES.map((c) => <option key={c.code} value={c.code}>{c.name}</option>)}</select>
        </div>
        <div style={{ marginBottom: theme.spacing.lg }}>
          <label style={labelStyle}>Currency</label>
          <select value={currency} onChange={(e) => setCurrency(e.target.value)} disabled={loading} style={selectStyle}>{CURRENCIES.map((c) => <option key={c.code} value={c.code}>{c.symbol} {c.name}</option>)}</select>
        </div>
        <div>
          <label style={labelStyle}>Financial Goals</label>
          <MultiOptionChips
            options={FINANCIAL_GOALS.map((g) => g.id)}
            selected={goals}
            onToggle={(id) => {
              setGoals((prev) => prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]);
              setFieldErrors((f) => ({ ...f, goals: undefined }));
            }}
            getLabel={(id) => FINANCIAL_GOALS.find((g) => g.id === id)?.label ?? id}
            disabled={loading}
          />
          {fieldErrors.goals ? <p style={{ color: theme.colors.danger, fontSize: 12, marginTop: 6, fontFamily: 'Inter, sans-serif' }}>{fieldErrors.goals}</p> : null}
        </div>
        <div>
          <label style={labelStyle}>Salary Range</label>
          <OptionChips
            options={SALARY_RANGES.map((s) => s.id)}
            value={salaryRange}
            onChange={(id) => { setSalaryRange(id); setFieldErrors((f) => ({ ...f, salaryRange: undefined })); }}
            getLabel={(id) => SALARY_RANGES.find((s) => s.id === id)?.label ?? id}
            error={fieldErrors.salaryRange}
            disabled={loading}
          />
        </div>
        <Input
          label="Monthly Savings Target"
          value={savingsTarget}
          onChange={(e) => { setSavingsTarget(e.target.value); setFieldErrors((f) => ({ ...f, savingsTarget: undefined })); }}
          placeholder="e.g. 5000"
          type="number"
          disabled={loading}
          error={fieldErrors.savingsTarget}
        />
        {error ? <FormErrorBanner message={error} /> : null}
        <Button title="Complete Setup" onPress={handleSubmit} loading={loading} size="lg" />
      </form>
    </StackScrollScreen>
  );
}
