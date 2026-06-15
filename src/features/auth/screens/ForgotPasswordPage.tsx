import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthSuccessBanner, AuthForm } from '../components';
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
    <AuthShell
      tagline={sent ? 'Check your inbox for the link.' : 'Enter the email linked to your account.'}
      panelTitle="Reset password"
      backHref="/login"
      footer={<AuthFooter linkText="Back to Sign In" href="/login" />}
    >
      {sent ? (
        <AuthSuccessBanner message="If an account exists for that email, a reset link has been sent." />
      ) : (
        <AuthForm onSubmit={handleSubmit}>
          <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
          {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
          <Button title="Send Reset Link" onPress={handleSubmit} loading={loading} size="lg" />
        </AuthForm>
      )}
    </AuthShell>
  );
}
