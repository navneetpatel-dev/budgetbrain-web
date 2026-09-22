'use client';

import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { startRegistration, startAuthentication, browserSupportsWebAuthn } from '@simplewebauthn/browser';
import { getApiErrorMessage } from '@/shared/services/api';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { persistAuthSession } from '../../api/auth.api';
import * as webauthnApi from '../../api/webauthn.api';
import type { AuthSession } from '../../types/auth.types';
import type { User } from '@/shared/types';

/** Sign-in-with-a-passkey — the login step itself, no existing session required. */
export function useWebauthnLogin() {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const loginWithPasskey = async (email: string) => {
    if (!browserSupportsWebAuthn()) {
      setError('This browser does not support passkeys.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const options = await webauthnApi.fetchLoginOptions(email);
      const credential = await startAuthentication({ optionsJSON: options });
      const session: AuthSession = await webauthnApi.verifyLogin(email, credential);
      await persistAuthSession(session);
      dispatch(setUser(session.user as User));
      router.replace(session.user.onboardingCompleted ? '/dashboard' : '/onboarding');
    } catch (err) {
      // A cancelled/dismissed platform prompt throws a NotAllowedError from the browser itself —
      // treat that as a quiet no-op rather than an error banner.
      if (err instanceof Error && err.name === 'NotAllowedError') {
        setLoading(false);
        return;
      }
      setError(getApiErrorMessage(err, 'Passkey sign-in failed'));
    } finally {
      setLoading(false);
    }
  };

  return { loginWithPasskey, loading, error, clearError, supported: browserSupportsWebAuthn() };
}

/** Registering a new passkey for an already-signed-in account (account/security settings). */
export function useWebauthnRegistration() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const clearError = useCallback(() => setError(null), []);

  const registerPasskey = async (deviceLabel?: string) => {
    setLoading(true);
    setError(null);
    try {
      const options = await webauthnApi.fetchRegistrationOptions();
      const credential = await startRegistration({ optionsJSON: options });
      const saved = await webauthnApi.verifyRegistration(credential, deviceLabel);
      return saved;
    } catch (err) {
      if (err instanceof Error && err.name === 'NotAllowedError') {
        return null;
      }
      setError(getApiErrorMessage(err, 'Could not save this passkey'));
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { registerPasskey, loading, error, clearError, supported: browserSupportsWebAuthn() };
}