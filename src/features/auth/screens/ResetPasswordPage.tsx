import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthForm } from '../components';
import { useResetPassword } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function ResetPasswordPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const { reset, loading, error, setError, done } = useResetPassword(token);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!password || password.length < 8) { setError('Password must be at least 8 characters'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    reset(password);
  };

  return (
    <AuthShell
      tagline={done ? 'You can now sign in with your new password.' : "Choose a strong password you haven't used before."}
      panelTitle="New password"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
    >
      {done ? (
        <>
          <AuthSuccessBanner message="Your password has been reset successfully." />
          <Button title="Continue to Sign In" onPress={() => navigate('/login', { replace: true })} size="lg" />
        </>
      ) : (
        <AuthForm onSubmit={handleSubmit}>
          <Input label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" type="password" secureToggle />
          <Input label="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter password" type="password" secureToggle />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Update Password" onPress={handleSubmit} loading={loading} disabled={!token} size="lg" />
        </AuthForm>
      )}
    </AuthShell>
  );
}
