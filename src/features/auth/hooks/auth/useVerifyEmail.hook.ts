import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { getApiErrorMessage } from '@/shared/services/api';
import { verifyEmailToken } from '../../api/auth.api';

export function useVerifyEmail(token: string) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const verify = async () => {
    setLoading(true);
    setError(null);
    try {
      await verifyEmailToken(token);
      setVerified(true);
    } catch (err) {
      setError(getApiErrorMessage(err, 'This verification link is invalid or expired.'));
    } finally {
      setLoading(false);
    }
  };

  const goToLogin = () => router.replace('/login');

  return { verify, loading, verified, error, clearError, goToLogin };
}
