import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { verifyEmailToken } from '../services/auth.service';

export function VerifyEmailPage() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (!token) { setStatus('error'); setErrorMsg('No verification token provided.'); return; }
    verifyEmailToken(token).then(() => setStatus('success')).catch((err: Error) => { setStatus('error'); setErrorMsg(err.message); });
  }, [token]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: theme.spacing.xl, alignItems: 'center', textAlign: 'center' }}>
      <div>
        <h1 style={{ fontFamily: 'Inter, sans-serif', fontSize: 24, fontWeight: 800, color: theme.colors.text, margin: 0 }}>{status === 'loading' ? 'Verifying email...' : status === 'success' ? 'Email verified!' : 'Verification failed'}</h1>
        <p style={{ fontFamily: 'Inter, sans-serif', fontSize: theme.typography.body.fontSize, fontWeight: 400, color: theme.colors.textSecondary, marginTop: theme.spacing.xs }}>{status === 'loading' ? 'Please wait...' : status === 'success' ? 'Your email has been verified. You can now sign in.' : errorMsg}</p>
      </div>
      {status !== 'loading' && <Button title="Go to Sign In" onPress={() => navigate('/login', { replace: true })} size="lg" />}
    </div>
  );
}
