import { useState, type FormEvent } from 'react';
import { Button, Input } from '@/shared/components/ui/index';
import { AuthShell, AuthFooter, AuthForm } from '../components';
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
    <AuthShell
      tagline="Set up your profile in under a minute."
      panelTitle="Create account"
      backHref="/login"
      footer={<AuthFooter text="Already have an account?" linkText="Sign In" href="/login" />}
    >
      <AuthForm onSubmit={handleSubmit}>
        <Input label="Full name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" />
        <Input label="Email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" type="email" />
        <Input label="Password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Min. 8 characters" type="password" secureToggle />
        {error && <p style={{ color: theme.colors.danger, fontSize: 13, fontWeight: 500, margin: 0, fontFamily: 'Inter, sans-serif' }}>{error}</p>}
        <Button title="Create Account" onPress={handleSubmit} loading={loading} size="lg" />
      </AuthForm>
    </AuthShell>
  );
}
