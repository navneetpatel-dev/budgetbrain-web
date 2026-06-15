import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
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
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
      <div>
        <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.primary}38, ${theme.colors.gradientEnd}22)`, border: `1px solid ${theme.colors.primary}33`, marginBottom: theme.spacing.md }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: theme.colors.primary }}>B</span>
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.display.fontSize, fontWeight: Number(theme.typography.display.fontWeight), color: theme.colors.text, letterSpacing: theme.typography.display.letterSpacing, margin: 0 }}>Welcome back</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>Sign in to manage your finances</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Your password" type="password" secureToggle />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: theme.spacing.lg }}>
          <Link to="/forgot-password" style={{ fontSize: 13, fontWeight: 600, color: theme.colors.primary, fontFamily: 'Inter, sans-serif' }}>Forgot password?</Link>
        </div>
        <Button title="Sign In" onPress={handleSubmit} loading={loading} size="lg" />
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.sm, alignItems: 'center' }}>
        <Link to="/otp-login" style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, fontWeight: 600, color: theme.colors.primary }}>Sign in with OTP</Link>
        <span style={{ fontSize: 14, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Don't have an account? <Link to="/register" style={{ fontWeight: 600, color: theme.colors.primary }}>Sign up</Link></span>
      </div>
    </div>
  );
}
