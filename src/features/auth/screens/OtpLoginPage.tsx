import { useForm, Controller } from 'react-hook-form';
import { Button, Input, OtpInput } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthForm, AuthInfoBanner, AuthErrorBanner } from '../components';
import { authFieldRules } from '../utils/authValidation';
import { maxLen } from '@/shared/validation/fieldLimits';
import { useOtpLogin } from '../hooks/useAuthHooks';

interface OtpForm {
  email: string;
  otp: string;
}

export function OtpLoginPage() {
  const { sendOtp, verifyOtp, loading, error, info, otpSent, clearError } = useOtpLogin();
  const { control, handleSubmit, formState: { errors } } = useForm<OtpForm>({
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

  return (
    <AuthShell
      tagline="We'll send a 6-digit code to your email."
      panelTitle="OTP sign in"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
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
          <Button title="Send Code" onPress={handleRequestOtp} loading={loading} size="lg" />
        ) : (
          <>
            <Controller
              control={control}
              name="otp"
              rules={authFieldRules.otp}
              render={({ field }) => (
                <OtpInput
                  label="Verification code"
                  value={field.value}
                  onChange={field.onChange}
                  autoFocus
                  disabled={loading}
                  error={errors.otp?.message}
                />
              )}
            />
            <Button title="Verify & Sign In" onPress={onSubmit} loading={loading} size="lg" />
            <Button title="Resend code" onPress={handleRequestOtp} variant="ghost" loading={loading} />
          </>
        )}
      </AuthForm>
    </AuthShell>
  );
}
