import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
import { useOtpLogin } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function OtpLoginPage() {
  const theme = useTheme();
  const { sendOtp, verifyOtp, loading, error, setError } = useOtpLogin();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'email' | 'otp'>('email');

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const sent = await sendOtp(email);
    if (sent) setStep('otp');
  };

  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!otp) { setError('Enter the OTP code'); return; }
    verifyOtp(email, otp);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 800, color: theme.colors.text, margin: 0 }}>Sign in with OTP</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
          {step === 'email' ? 'Enter your email to receive a code' : `Enter the code sent to ${email}`}
        </p>
      </div>
      {step === 'email' ? (
        <form onSubmit={handleSendOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Send OTP" onPress={handleSendOtp} loading={loading} size="lg" />
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="OTP Code" value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" type="text" autoFocus />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Verify & Sign In" onPress={handleVerifyOtp} loading={loading} size="lg" />
          <button type="button" onClick={() => { setStep('email'); setError(null); }} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', marginTop: theme.spacing.md }}>Change email</button>
        </form>
      )}
      <div style={{ textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>Back to sign in</Link>
      </div>
    </div>
  );
}
