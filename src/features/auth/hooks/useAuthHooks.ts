import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { apiPost, apiPatch, getApiErrorMessage } from '@/shared/services/api';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { persistAuthSession } from '../services/auth.service';
import type { AuthSession } from '../types/auth.types';
import type { User } from '@/shared/types';

export function useLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (session: AuthSession) => {
    await persistAuthSession(session);
    dispatch(setUser(session.user as User));
    navigate(session.user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
  };

  const login = async (email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/login', { email, password });
      await handleSuccess(session);
    } catch (err) { setError(getApiErrorMessage(err, 'Invalid credentials')); }
    finally { setLoading(false); }
  };

  return { login, loading, error, setError };
}

export function useRegister() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSuccess = async (session: AuthSession) => {
    await persistAuthSession(session);
    dispatch(setUser(session.user as User));
    navigate(session.user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
  };

  const register = async (name: string, email: string, password: string) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/register', { name, email, password });
      await handleSuccess(session);
    } catch (err) { setError(getApiErrorMessage(err, 'Could not create account')); }
    finally { setLoading(false); }
  };

  return { register, loading, error, setError };
}

export function useForgotPassword() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);

  const request = async (email: string) => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/forgot-password', { email });
      setSent(true);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return { request, loading, error, setError, sent, reset: () => setSent(false) };
}

export function useResetPassword(token: string) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const reset = async (password: string) => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/reset-password', { token, password });
      setDone(true);
    } catch (err) { setError(getApiErrorMessage(err)); }
    finally { setLoading(false); }
  };

  return { reset, loading, error, setError, done };
}

export function useOtpLogin() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendOtp = async (email: string): Promise<boolean> => {
    setLoading(true); setError(null);
    try {
      await apiPost('/auth/otp/request', { email });
      return true;
    } catch (err) { setError(getApiErrorMessage(err)); return false; }
    finally { setLoading(false); }
  };

  const verifyOtp = async (email: string, code: string) => {
    setLoading(true); setError(null);
    try {
      const session = await apiPost<AuthSession>('/auth/otp/verify', { email, code });
      await persistAuthSession(session);
      dispatch(setUser(session.user as User));
      navigate(session.user.onboardingCompleted ? '/dashboard' : '/onboarding', { replace: true });
    } catch (err) { setError(getApiErrorMessage(err, 'Invalid OTP')); }
    finally { setLoading(false); }
  };

  return { sendOtp, verifyOtp, loading, error, setError };
}

export function useSignOut() {
  const dispatch = useAppDispatch();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const signOut = async () => {
    try { await apiPost('/auth/logout', {}); } catch {}
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    dispatch(setUser(null));
    queryClient.clear();
    navigate('/login', { replace: true });
  };

  return { signOut };
}

export function useOnboarding() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async (data: {
    name: string; country: string; currency: string;
    financialGoals: string[]; salaryRange: string; monthlySavingsTarget: number;
  }) => {
    setLoading(true); setError(null);
    try {
      const user = await apiPost<User>('/users/onboarding', data);
      dispatch(setUser(user));
      navigate('/dashboard', { replace: true });
    } catch (err) { setError(getApiErrorMessage(err, 'Could not complete onboarding')); }
    finally { setLoading(false); }
  };

  return { submit, loading, error, setError };
}
