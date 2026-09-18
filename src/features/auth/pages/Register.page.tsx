'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthForm, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useRegister } from '../hooks/useAuthHooks';
import type { RegisterCredentials } from '../types/auth.types';

export function RegisterPage() {
  const { register, loading, error, clearError } = useRegister();
  const { control, handleSubmit, formState: { errors } } = useForm<RegisterCredentials>({
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (data: RegisterCredentials) => {
    clearError();
    void register(data);
  };

  return (
    <AuthShell
      tagline="Set up your profile in under a minute."
      panelTitle="Create account"
      backHref="/login"
      footer={<AuthFooter text="Already have an account?" linkText="Sign In" href="/login" />}
    >
      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="name"
          rules={authFieldRules.name}
          render={({ field }) => (
            <Input
              label="Full name"
              maxLength={maxLen('name')}
              value={field.value}
              onChange={field.onChange}
              placeholder="Jane Doe"
              autoComplete="name"
              disabled={loading}
              error={errors.name?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="email"
          rules={authFieldRules.email}
          render={({ field }) => (
            <Input
              label="Email"
              maxLength={maxLen('email')}
              value={field.value}
              onChange={field.onChange}
              placeholder="you@example.com"
              type="email"
              autoComplete="email"
              disabled={loading}
              error={errors.email?.message}
            />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={authFieldRules.passwordMin8}
          render={({ field }) => (
            <Input
              label="Password"
              maxLength={maxLen('password')}
              value={field.value}
              onChange={field.onChange}
              placeholder="Min. 8 characters"
              type="password"
              secureToggle
              autoComplete="new-password"
              disabled={loading}
              error={errors.password?.message}
            />
          )}
        />
        {error ? <AuthErrorBanner message={error} /> : null}
        <Button title="Create Account" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
      </AuthForm>
    </AuthShell>
  );
}

export default RegisterPage;
