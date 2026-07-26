import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { apiPost } from '@/shared/services/api';
import { persistAuthSession } from '@/features/auth/services/auth.service';
import { requestAppleIdToken } from '@/features/auth/services/appleAuth.service';
import { getSocialAuthErrorMessage } from '@/features/auth/utils/socialAuthErrors';
import type { AuthSession, SocialAuthProvider } from '@/features/auth/types/auth.types';
import type { User } from '@/shared/types';

export function useSocialAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState<SocialAuthProvider | null>(null);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const completeSession = async (session: AuthSession) => {
    await persistAuthSession(session);
    dispatch(setUser(session.user as User));
    navigate(session.user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
  };

  const signInGoogle = async (idToken: string, name?: string) => {
    setLoading('google');
    setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/google', { idToken, name });
      await completeSession(session);
    } catch (err) {
      const message = getSocialAuthErrorMessage('google', err);
      if (message) setError(message);
      throw err;
    } finally {
      setLoading(null);
    }
  };

  const signInApple = async () => {
    setLoading('apple');
    setError(null);
    try {
      const { idToken, name } = await requestAppleIdToken();
      const session = await apiPost<AuthSession>('/auth/apple', { idToken, name });
      await completeSession(session);
    } catch (err) {
      const message = getSocialAuthErrorMessage('apple', err);
      if (message) setError(message);
    } finally {
      setLoading(null);
    }
  };

  const reportProviderError = (provider: SocialAuthProvider, err: unknown) => {
    const message = getSocialAuthErrorMessage(provider, err);
    if (message) setError(message);
  };

  return { loading, error, clearError, signInGoogle, signInApple, reportProviderError };
}
