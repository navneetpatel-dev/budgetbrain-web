import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { Button, Input } from '@/shared/components/ui/index';
import { useRegister } from '../hooks/useAuthHooks';
import { useTheme } from '@/shared/theme';

export function RegisterPage() {
  const theme = useTheme();
  const { register, loading, error, setError } = useRegister();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name || !email || !password) { setError('Please fill in all fields'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    register(name, email, password);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl }}>
      <div>
        <div style={{ width: 48, height: 48, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `linear-gradient(135deg, ${theme.colors.primary}38, ${theme.colors.gradientEnd}22)`, border: `1px solid ${theme.colors.primary}33`, marginBottom: theme.spacing.md }}>
          <span style={{ fontSize: 24, fontWeight: 800, color: theme.colors.primary }}>B</span>
        </div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.display.fontSize, fontWeight: Number(theme.typography.display.fontWeight), color: theme.colors.text, letterSpacing: theme.typography.display.letterSpacing, margin: 0 }}>Create account</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>Start tracking your finances today</p>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column' }}>
        <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" type="password" secureToggle />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, marginBottom: theme.spacing.md, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <Button title="Create Account" onPress={handleSubmit} loading={loading} size="lg" />
      </form>

      <div style={{ textAlign: 'center' }}>
        <span style={{ fontSize: 14, color: theme.colors.textSecondary, fontFamily: 'Inter, sans-serif' }}>Already have an account? <Link to="/login" style={{ fontWeight: 600, color: theme.colors.primary }}>Sign in</Link></span>
      </div>
    </div>
  );
}
