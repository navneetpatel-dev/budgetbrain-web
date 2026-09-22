import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { apiPost, getApiErrorMessage, getRefreshToken } from '@/shared/services/api';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { persistAuthSession } from '../../api/auth.api';
import type { AuthSession, LoginCredentials, RegisterCredentials } from '../../types/auth.types';
import type { User } from '@/shared/types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const handleSuccess = async (session: AuthSession) => {
    await persistAuthSession(session);
    dispatch(setUser(session.user as User));
    router.replace(session.user.onboardingCompleted ? '/dashboard' : '/onboarding');
  };

  const login = async (credentials: LoginCredentials) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/login', credentials);
      await handleSuccess(session);
    } catch (err) { setError(getApiErrorMessage(err, 'Invalid credentials')); }
    finally { setLoading(false); }
  };

  return { login, loading, error, clearError };
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const handleSuccess = async (session: AuthSession) => {
    await persistAuthSession(session);
    dispatch(setUser(session.user as User));
    router.replace(session.user.onboardingCompleted ? '/dashboard' : '/onboarding');
  };

  const register = async (credentials: RegisterCredentials) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/register', credentials);
      await handleSuccess(session);
    } catch (err) { setError(getApiErrorMessage(err, 'Could not create account')); }
    finally { setLoading(false); }
  };

  return { register, loading, error, clearError };
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const clearError = useCallback(() => setError(null), []);

  const request = async (email: string) => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return { request, loading, error, clearError, sent, reset: () => setSent(false) };
}

export function useResetPassword(token: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const clearError = useCallback(() => setError(null), []);

  const reset = async (password: string) => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return { reset, loading, error, clearError, done };
}

export function useOtpLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [info, setInfo] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const sendOtp = async (email: string) => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/otp/request', { email });
      setOtpSent(true);
      setInfo('Check your email for the 6-digit code.');
      return true;
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send verification code'));
      return false;
    } finally { setLoading(false); }
  };

  const verifyOtp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/otp/verify', { email, otp: code });
      await persistAuthSession(session);
      dispatch(setUser(session.user as User));
      router.replace(session.user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) { setError(getApiErrorMessage(err, 'Invalid verification code')); }
    finally { setLoading(false); }
  };

  return { sendOtp, verifyOtp, loading, error, info, otpSent, clearError };
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const router = useRouter();

  const signOut = async () => {
    try {
      const refreshToken = getRefreshToken();
      if (refreshToken) await apiPost('/auth/logout', { refreshToken });
    } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch(setUser(null));
    queryClient.clear();
    router.replace('/login');
  };

  return { signOut };
}

export function useOnboarding() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clearError = useCallback(() => setError(null), []);

  const submit = async (data: {
    name: string; country: string; currency: string;
    financialGoals: string[]; salaryRange: string; monthlySavingsTarget: number;
  }) => {
    setLoading(true); setError(null);
    try {
      const user = await apiPost<User>('/users/onboarding', data);
      dispatch(setUser(user));
      router.replace('/dashboard');
    } catch (err) { setError(getApiErrorMessage(err, 'Could not complete onboarding')); }
    finally { setLoading(false); }
  };

  return { submit, loading, error, clearError, setError };
}
