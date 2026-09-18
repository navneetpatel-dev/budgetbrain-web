'use client';

import { useState, type CSSProperties, type FormEvent } from 'react';
import { Button, Input, FormErrorBanner } from '@/shared/components/ui/index';
import { FormFieldLabel } from '@/shared/components/ui/forms';
import { OptionChips, MultiOptionChips, SheetSelect, StackNavHeader, StackScrollScreen } from '@/shared/components/ui/feature-screen';
import { useTheme } from '@/shared/theme';
import { useOnboarding, useSignOut } from '@/features/auth/hooks/useAuthHooks';
import { useAppSelector } from '@/shared/store/hooks';
import { COUNTRIES, CURRENCIES, FINANCIAL_GOALS, SALARY_RANGES } from '@/shared/constants/config';
import { maxLen, validateAmount, validateText, ValidationMessages } from '@/shared/validation/fieldLimits';

type FieldErrors = { name?: string; country?: string; salaryRange?: string; savingsTarget?: string; goals?: string };

export function OnboardingPage() {
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const { submit, loading, error, clearError } = useOnboarding();
  const { signOut } = useSignOut();
  const [name, setName] = useState(user?.name || '');
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
    const savingsErr = validateAmount(savingsTarget);
    if (nameErr) next.name = nameErr;
    if (countryErr) next.country = countryErr;
    if (!salaryRange) next.salaryRange = 'Please select a salary range';
    if (savingsErr) next.savingsTarget = savingsErr;
    if (goals.length === 0) next.goals = ValidationMessages.financialGoalsMin;
    else if (goals.length > 20) next.goals = ValidationMessages.financialGoalsMax;
    setFieldErrors(next);
    if (Object.keys(next).length) return;
    submit({ name, country, currency, financialGoals: goals, salaryRange, monthlySavingsTarget: Number(savingsTarget) });
  };

  const selectStyle: CSSProperties = { marginBottom: 0 };

  return (
    <StackScrollScreen header={<StackNavHeader title="Onboarding" subtitle="Tell us about yourself" showBack={false} />}>
      <form onSubmit={handleSubmit} className="flex flex-col gap-lg" style={{ gap: theme.spacing.lg }}>
        <Input
          label="Full Name"
          maxLength={maxLen('name')}
          value={name}
          onChange={(e) => { setName(e.target.value); setFieldErrors((f) => ({ ...f, name: undefined })); }}
          placeholder="Your name"
          disabled={loading}
          error={fieldErrors.name}
        />
        <div>
          <FormFieldLabel>Country</FormFieldLabel>
          <SheetSelect
            value={country}
            options={COUNTRIES.map((c) => c.code)}
            onChange={setCountry}
            getLabel={(code) => COUNTRIES.find((c) => c.code === code)?.name ?? code}
            title="Choose country"
            disabled={loading}
            error={fieldErrors.country}
            style={selectStyle}
          />
        </div>
        <div>
          <FormFieldLabel>Currency</FormFieldLabel>
          <SheetSelect
            value={currency}
            options={CURRENCIES.map((c) => c.code)}
            onChange={setCurrency}
            getLabel={(code) => {
              const c = CURRENCIES.find((item) => item.code === code);
              return c ? `${c.symbol} ${c.name}` : code;
            }}
            title="Choose currency"
            disabled={loading}
            style={selectStyle}
          />
        </div>
        <div>
          <FormFieldLabel>Financial Goals</FormFieldLabel>
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
          <FormFieldLabel>Salary Range</FormFieldLabel>
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
        <Button title="Sign Out" variant="outline" onPress={signOut} disabled={loading} size="lg" />
      </form>
    </StackScrollScreen>
  );
}

export default OnboardingPage;
