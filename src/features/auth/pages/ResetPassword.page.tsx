'use client';

import { Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { ColdStartSkeleton } from '@/shared/components/ui/skeleton';
import { AuthShell, AuthSuccessBanner, AuthForm, AuthErrorBanner } from '../components';
import { authFieldRules, confirmPasswordRule } from '../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useResetPassword } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

function ResetPasswordForm() {
  const router = useRouter();
  const theme = useTheme();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { reset, loading, error, clearError, done } = useResetPassword(token);
  const { control, handleSubmit, watch, formState: { errors } } = useForm<ResetForm>({
    defaultValues: { password: '', confirmPassword: '' },
  });

  const password = watch('password');

  const onSubmit = (data: ResetForm) => {
    clearError();
    void reset(data.password);
  };

  const handleBackToSignIn = () => {
    router.push('/login');
  };

  return (
    <AuthShell
      tagline={done ? 'You can now sign in with your new password.' : "Choose a strong password you haven't used before."}
      panelTitle="New password"
      backHref="/login"
    >
      {done ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <AuthSuccessBanner message="Your password has been reset successfully." />
          <Button
            title="Sign In with New Password"
            onPress={handleBackToSignIn}
            size="lg"
          />
        </div>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="password"
            rules={authFieldRules.passwordMin8}
            render={({ field }) => (
              <Input
                label="New password"
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
          <Controller
            control={control}
            name="confirmPassword"
            rules={confirmPasswordRule(password)}
            render={({ field }) => (
              <Input
                label="Confirm password"
                maxLength={maxLen('password')}
                value={field.value}
                onChange={field.onChange}
                placeholder="Re-enter password"
                type="password"
                secureToggle
                autoComplete="new-password"
                disabled={loading}
                error={errors.confirmPassword?.message}
              />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.xs }}>
            <Button title="Reset Password" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
            <Button
              title="Back to Sign In"
              onPress={handleBackToSignIn}
              variant="outline"
              size="lg"
              disabled={loading}
            />
          </div>
        </AuthForm>
      )}
    </AuthShell>
  );
}

export function ResetPasswordPage() {
  return (
    <Suspense fallback={<ColdStartSkeleton />}>
      <ResetPasswordForm />
    </Suspense>
  );
}

export default ResetPasswordPage;
