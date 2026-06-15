import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthForm } from '../components';
import { useOtpLogin } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function OtpLoginPage() {
  const theme = useTheme();
  const { sendOtp, verifyOtp, loading, error, setError } = useOtpLogin();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const sent = await sendOtp(email);
    if (sent) setOtpSent(true);
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp) { setError('Enter the OTP code'); return; }
    verifyOtp(email, otp);
  };

  return (
    <AuthShell
      tagline="We'll send a 6-digit code to your email."
      panelTitle="OTP sign in"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
    >
      {!otpSent ? (
        <AuthForm onSubmit={handleSendOtp}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Send Code" onPress={handleSendOtp} loading={loading} size="lg" />
        </AuthForm>
      ) : (
        <AuthForm onSubmit={handleVerifyOtp}>
          <Input label="Verification code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="000000" type="text" autoFocus />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Verify & Sign In" onPress={handleVerifyOtp} loading={loading} size="lg" />
          <Button title="Resend code" onPress={handleSendOtp} variant="ghost" loading={loading} />
        </AuthForm>
      )}
    </AuthShell>
  );
}
