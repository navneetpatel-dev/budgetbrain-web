import { useSearchParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthForm, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { useResetPassword } from '../hooks/useAuthHooks';

interface ResetForm {
  password: string;
  confirmPassword: string;
}

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
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

  return (
    <AuthShell
      tagline={done ? 'You can now sign in with your new password.' : "Choose a strong password you haven't used before."}
      panelTitle="New password"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
    >
      {done ? (
        <AuthSuccessBanner message="Your password has been reset successfully." />
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="password"
            rules={authFieldRules.passwordMin8}
            render={({ field }) => (
              <Input label="New password" value={field.value} onChange={field.onChange} placeholder="Min. 8 characters" type="password" secureToggle autoComplete="new-password" disabled={loading} error={errors.password?.message} />
            )}
          />
          <Controller
            control={control}
            name="confirmPassword"
            rules={{
              required: 'Confirm your password',
              validate: (value) => value === password || 'Passwords do not match',
            }}
            render={({ field }) => (
              <Input label="Confirm password" value={field.value} onChange={field.onChange} placeholder="Re-enter password" type="password" secureToggle autoComplete="new-password" disabled={loading} error={errors.confirmPassword?.message} />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Update Password" onPress={handleSubmit(onSubmit)} loading={loading} disabled={!token} size="lg" />
        </AuthForm>
      )}
    </AuthShell>
  );
}
