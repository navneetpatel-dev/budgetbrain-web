'use client';

import { useForm, Controller } from 'react-hook-form';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthLink, AuthForm, AuthErrorBanner, SocialAuthButtons } from '../../components';
import { authFieldRules } from '../../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useLogin } from '../../hooks/auth/useAuthHooks.hook';
import { useWebauthnLogin } from '../../hooks/auth/useWebauthn.hook';
import type { LoginCredentials } from '../../types/auth.types';

export function LoginPage() {
  const { login, loading, error, clearError } = useLogin();
  const passkey = useWebauthnLogin();
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<LoginCredentials>({
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginCredentials) => {
    clearError();
    void login(data);
  };

  const onPasskeySignIn = () => {
    passkey.clearError();
    void passkey.loginWithPasskey(getValues('email'));
  };

  return (
    <AuthShell footer={<AuthFooter text="Don't have an account?" linkText="Sign Up" href="/register" />}>
      <AuthForm onSubmit={handleSubmit(onSubmit)}>
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
          rules={authFieldRules.password}
          render={({ field }) => (
            <Input
              label="Password"
              maxLength={maxLen('password')}
              value={field.value}
              onChange={field.onChange}
              placeholder="Your password"
              type="password"
              secureToggle
              autoComplete="current-password"
              disabled={loading}
              error={errors.password?.message}
            />
          )}
        />
        {error ? <AuthErrorBanner message={error} /> : null}
        {passkey.error ? <AuthErrorBanner message={passkey.error} /> : null}
        <AuthLink to="/forgot-password" align="right">
          Forgot password?
        </AuthLink>
        <Button title="Sign In" onPress={handleSubmit(onSubmit)} loading={loading} size="lg" />
        {passkey.supported ? (
          <Button
            title="Sign in with a passkey"
            onPress={onPasskeySignIn}
            loading={passkey.loading}
            variant="outline"
            size="lg"
            type="button"
          />
        ) : null}
        <SocialAuthButtons disabled={loading} />
        <AuthLink to="/otp-login" align="center">
          Sign in with OTP
        </AuthLink>
      </AuthForm>
    </AuthShell>
  );
}

export default LoginPage;
