import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
import { useForgotPassword } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function ForgotPasswordPage() {
  const theme = useTheme();
  const { request, loading, error, setError, sent } = useForgotPassword();
  const [email, setEmail] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email) { setError('Enter your email'); return; }
    request(email);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 800, color: theme.colors.text, margin: 0 }}>Reset password</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>
          {sent ? 'Check your email for the reset link' : 'Enter your email to receive a reset link'}
        </p>
      </div>

      {!sent ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} size="lg" />
        </form>
      ) : (
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif', fontSize: 14 }}>Didn't receive it? Check spam or</p>
          <button onClick={() => { setEmail(email); }} style={{ background: 'none', border: 'none', color: theme.colors.primary, fontWeight: 600, cursor: 'pointer', fontSize: 14, fontFamily: 'Inter, sans-serif', marginTop: 4 }}>try again</button>
        </div>
      )}

      <div style={{ textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>Back to sign in</Link>
      </div>
    </div>
  );
}
