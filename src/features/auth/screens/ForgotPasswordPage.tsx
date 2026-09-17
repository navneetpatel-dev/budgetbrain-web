import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthSuccessBanner, AuthForm, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useForgotPassword } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

interface ForgotForm {
  email: string;
}

export function ForgotPasswordPage() {
  const navigate = useNavigate();
  const theme = useTheme();
  const { request, loading, error, clearError, sent } = useForgotPassword();
  const { control, handleSubmit, formState: { errors } } = useForm<ForgotForm>({
    defaultValues: { email: '' },
  });

  const onSubmit = (data: ForgotForm) => {
    clearError();
    void request(data.email);
  };

  const handleBackToSignIn = () => {
    navigate('/login');
  };

  return (
    <AuthShell
      tagline={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
      panelTitle="Reset password"
      backHref="/login"
    >
      {sent ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md }}>
          <AuthSuccessBanner message="If an account exists for that email, a reset link has been sent." />
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            variant="outline"
            size="lg"
          />
        </div>
      ) : (
        <AuthForm onSubmit={handleSubmit(onSubmit)}>
          <Controller
            control={control}
            name="email"
            rules={authFieldRules.email}
            render={({ field }) => (
              <Input label="Email" maxLength={maxLen("email")} value={field.value} onChange={field.onChange} placeholder="you@example.com" type="email" autoComplete="email" disabled={loading} error={errors.email?.message} />
            )}
          />
          {error ? <AuthErrorBanner message={error} /> : null}
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.xs }}>
            <Button title="Send Reset Link" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
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
