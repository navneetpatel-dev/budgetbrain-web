import { useState, useEffect, useCallback } from 'react';
import { useWebauthnRegistration } from '@/features/auth/hooks/useWebauthn';
import * as webauthnApi from '@/features/auth/services/webauthn.service';
import type { WebauthnCredentialSummary } from '@/features/auth/services/webauthn.service';
import { getApiErrorMessage } from '@/shared/services/api';

export function usePasskeys() {
  const { registerPasskey, loading: registering, error: registerError, supported } = useWebauthnRegistration();
  const [passkeys, setPasskeys] = useState<WebauthnCredentialSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      const { credentials } = await webauthnApi.listPasskeys();
      setPasskeys(credentials);
      setError(null);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load passkeys'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (supported) void refresh();
    else setLoading(false);
  }, [supported, refresh]);

  const addPasskey = useCallback(async () => {
    const label = window.prompt('Name this passkey (e.g. "Work laptop")') ?? undefined;
    const saved = await registerPasskey(label);
    if (saved) await refresh();
  }, [registerPasskey, refresh]);

  const removePasskey = useCallback(async (id: string) => {
    try {
      await webauthnApi.removePasskey(id);
      await refresh();
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not remove passkey'));
    }
  }, [refresh]);

  return {
    passkeys,
    loading,
    error: error ?? registerError,
    supported,
    registering,
    addPasskey,
    removePasskey,
  };
}
