import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();
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
    navigate('/login');
  };

  return (
    <AuthShell
      tagline="We'll send a 6-digit code to your email."
      panelTitle="OTP sign in"
      backHref="/login"
    >
      <AuthForm onSubmit={onSubmit}>
        <Controller
          control={control}
          name="email"
          rules={authFieldRules.email}
          render={({ field }) => (
            <Input label="Email" maxLength={maxLen("email")} value={field.value} onChange={field.onChange} placeholder="you@example.com" type="email" autoComplete="email" readOnly={otpSent} disabled={loading} error={errors.email?.message} />
          )}
        />

        {info ? <AuthInfoBanner message={info} /> : null}
        {error ? <AuthErrorBanner message={error} /> : null}

        {!otpSent ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.xs }}>
            <Button title="Send Code" onPress={handleRequestOtp} loading={loading} size="lg" />
            <Button
              title="Back to Sign In"
              onPress={handleBackToSignIn}
              variant="outline"
              size="lg"
              disabled={loading}
            />
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.md, marginTop: theme.spacing.xs }}>
            <Controller
              control={control}
              name="otp"
              rules={authFieldRules.otp}
              render={({ field }) => (
                <OtpInput
                  label="Verification code"
                  value={field.value}
                  onChange={field.onChange}
                  onComplete={handleOtpComplete}
                  autoFocus
                  disabled={loading}
                  error={errors.otp?.message}
                />
              )}
            />
            <Button title="Verify & Sign In" onPress={onSubmit} loading={loading} size="lg" />
            <Button title="Resend code" onPress={handleRequestOtp} variant="ghost" size="lg" loading={loading} />
            <Button
              title="Back to Sign In"
              onPress={handleBackToSignIn}
              variant="outline"
              size="lg"
              disabled={loading}
            />
          </div>
        )}
      </AuthForm>
    </AuthShell>
  );
}
