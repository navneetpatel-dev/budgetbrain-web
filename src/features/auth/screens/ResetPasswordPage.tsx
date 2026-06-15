import { useState, type FormEvent } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
import { useResetPassword } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function ResetPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { reset, loading, error, setError, done } = useResetPassword(token);
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 8) { setError('Password must be at least 8 characters'); return; }
    reset(password);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 800, color: theme.colors.text, margin: 0 }}>{done ? 'Password reset' : 'New password'}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>{done ? 'Your password has been reset successfully.' : 'Choose a new password for your account'}</p>
      </div>
      {!done ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
          <Input label="New Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" type="password" secureToggle />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Reset Password" onPress={handleSubmit} loading={loading} size="lg" />
        </form>
      ) : (
        <Button title="Go to Sign In" onPress={() => navigate('/login', { replace: true })} size="lg" />
      )}
      <div style={{ textAlign: 'center' }}>
        <Link to="/login" style={{ fontSize: 14, fontWeight: 600, color: theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>Back to sign in</Link>
      </div>
    </div>
  );
}
