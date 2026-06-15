import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Button } from '@/shared/components/ui/index';
import { AuthShell, AuthSuccessBanner, AuthInfoBanner } from '../components';
import { verifyEmailToken } from '../services/auth.service';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleVerify = async () => {
    if (!token) {
      setStatus('error');
      setErrorMsg('No verification token provided.');
      return;
    }
    setStatus('loading');
    try {
      await verifyEmailToken(token);
      setStatus('success');
    } catch (err) {
      setStatus('error');
      setErrorMsg(err instanceof Error ? err.message : 'This verification link is invalid or expired.');
    }
  };

  useEffect(() => {
    if (token) handleVerify();
    else setStatus('error');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const verified = status === 'success';
  const isLoading = status === 'loading' || status === 'idle';

  return (
    <AuthShell
      tagline={verified ? 'Your account is ready to use.' : isLoading ? 'Verifying your email...' : 'Confirm your email to unlock all features.'}
      panelTitle="Verify email"
      backHref="/login"
    >
      {isLoading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '24px 0' }}>
          <div style={{
            width: 40, height: 40, borderRadius: '50%',
            border: '3px solid rgba(99,102,241,0.15)',
            borderTopColor: '#6366F1',
            animation: 'spin 0.6s linear infinite',
          }} />
        </div>
      )}
      {verified && (
        <>
          <AuthSuccessBanner message="Your email has been verified successfully." />
          <Button title="Continue to Sign In" onPress={() => navigate('/login', { replace: true })} size="lg" />
        </>
      )}
      {status === 'error' && (
        <>
          <AuthInfoBanner message={errorMsg || 'This verification link is invalid or expired.'} />
          <Button title="Try Again" onPress={handleVerify} size="lg" />
          <Button title="Go to Sign In" onPress={() => navigate('/login', { replace: true })} variant="outline" />
        </>
      )}
    </AuthShell>
  );
}
