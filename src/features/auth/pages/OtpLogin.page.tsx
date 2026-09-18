'use client';

import { useRouter } from 'next/navigation';
import { useForm, Controller } from 'react-hook-form';
import { Button, Input, OtpInput } from '@/shared/components/ui/index';
import { AuthShell, AuthForm, AuthInfoBanner, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useOtpLogin } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

interface OtpForm {
  email: string;
  otp: string;
}

export function OtpLoginPage() {
  const router = useRouter();
  const theme = useTheme();
  const { sendOtp, verifyOtp, loading, error, info, otpSent, clearError } = useOtpLogin();
  const { control, handleSubmit, getValues, formState: { errors } } = useForm<OtpForm>({
    defaultValues: { email: '', otp: '' },
  });

  const handleRequestOtp = handleSubmit((data) => {
    clearError();
    void sendOtp(data.email);
  });

  const onSubmit = handleSubmit((data) => {
    clearError();
    void verifyOtp(data.email, data.otp);
  });

  const handleOtpComplete = (code: string) => {
    const email = getValues('email');
    if (email && code.length === 6) {
      clearError();
      void verifyOtp(email, code);
    }
  };

  const handleBackToSignIn = () => {
    router.push('/login');
  };

  return (
    <AuthShell
      tagline={otpSent ? 'Enter the 6-digit code sent to your email.' : 'Sign in securely without a password.'}
      panelTitle={otpSent ? 'Enter code' : 'OTP sign in'}
      backHref="/login"
    >
      <AuthForm onSubmit={otpSent ? onSubmit : handleRequestOtp}>
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
              disabled={loading || otpSent}
              error={errors.email?.message}
            />
          )}
        />

        {otpSent ? (
          <div style={{ marginTop: theme.spacing.sm }}>
            <label
              style={{
                display: 'block',
                fontSize: theme.typography.label.fontSize,
                fontWeight: Number(theme.typography.label.fontWeight),
                color: theme.colors.textSecondary,
                marginBottom: theme.spacing.sm,
                fontFamily: 'Inter, sans-serif',
              }}
            >
              Verification Code
            </label>
            <Controller
              control={control}
              name="otp"
              rules={{ required: 'Enter the 6-digit code', minLength: { value: 6, message: 'Must be 6 digits' } }}
              render={({ field }) => (
                <OtpInput
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={handleOtpComplete}
                  disabled={loading}
                />
              )}
            />
          </div>
        ) : null}

        {info ? <AuthInfoBanner message={info} /> : null}
        {error ? <AuthErrorBanner message={error} /> : null}

        <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.xs }}>
          <Button
            title={otpSent ? 'Verify Code' : 'Send Code'}
            onPress={otpSent ? onSubmit : handleRequestOtp}
            loading={loading}
            size="lg"
          />
          {otpSent ? (
            <Button
              title="Resend Code"
              onPress={handleRequestOtp}
              variant="ghost"
              size="md"
              disabled={loading}
            />
          ) : null}
          <Button
            title="Back to Sign In"
            onPress={handleBackToSignIn}
            variant="outline"
            size="lg"
            disabled={loading}
          />
        </div>
      </AuthForm>
    </AuthShell>
  );
}

export default OtpLoginPage;
