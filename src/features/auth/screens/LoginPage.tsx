import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthLink, AuthForm, AuthErrorBanner, SocialAuthButtons } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { useLogin } from '../hooks/useAuthHooks';
import type { LoginCredentials } from '../types/auth.types';

export function LoginPage() {
  const { login, loading, error, clearError } = useLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginCredentials) => {
    clearError();
    void login(data);
  };

  return (
    <AuthShell footer={<AuthFooter text="Don't have an account?" linkText="Sign Up" href="/register" />}>
      <AuthForm onSubmit={handleSubmit(onSubmit)}>
        <Controller
          control={control}
          name="email"
          rules={authFieldRules.email}
          render={({ field }) => (
            <Input label="Email" value={field.value} onChange={field.onChange} placeholder="you@example.com" type="email" autoComplete="email" error={errors.email?.message} />
          )}
        />
        <Controller
          control={control}
          name="password"
          rules={authFieldRules.password}
          render={({ field }) => (
            <Input label="Password" value={field.value} onChange={field.onChange} placeholder="Your password" type="password" secureToggle autoComplete="current-password" error={errors.password?.message} />
          )}
        />
        {error ? <AuthErrorBanner message={error} /> : null}
        <AuthLink to="/forgot-password" align="right">Forgot password?</AuthLink>
        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
        <SocialAuthButtons />
        <AuthLink to="/otp-login" align="center">Sign in with OTP</AuthLink>
      </AuthForm>
    </AuthShell>
  );
}
