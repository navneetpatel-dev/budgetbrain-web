import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthForm, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { useForgotPassword } from '../hooks/useAuthHooks';

interface ForgotForm {
  email: string;
}

export function ForgotPasswordPage() {
  const { request, loading, error, clearError, sent } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotForm) => {
    clearError();
    void request(data.email);
  };

  return (
    <AuthShell
      tagline={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
      panelTitle="Reset password"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
    >
      {sent ? (
        <AuthSuccessBanner message="If an account exists for that email, a reset link has been sent." />
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="email"
            rules={authFieldRules.email}
            render={({ field }) => (
              <Input label="Email" value={field.value} onChange={field.onChange} placeholder="you@example.com" type="email" autoComplete="email" error={errors.email?.message} />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
        </AuthForm>
      )}
    </AuthShell>
  );
}
