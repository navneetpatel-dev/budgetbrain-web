import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthLink, AuthForm } from '../components';
import { useLogin } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function LoginPage() {
  const theme = useTheme();
  const { login, loading, error, setError } = useLogin();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email || !password) { setError('Please fill in all fields'); return; }
    login(email, password);
  };

  return (
    <AuthShell
      footer={<AuthFooter text="Don't have an account?" linkText="Sign Up" href="/register" />}
    >
      <AuthForm onSubmit={handleSubmit}>
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" type="password" secureToggle />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <AuthLink to="/forgot-password" align="right">Forgot password?</AuthLink>
        <Button title="Sign In" onPress={handleSubmit} loading={loading} size="lg" />
        <AuthLink to="/otp-login" align="center">Sign in with OTP</AuthLink>
      </AuthForm>
    </AuthShell>
  );
}
