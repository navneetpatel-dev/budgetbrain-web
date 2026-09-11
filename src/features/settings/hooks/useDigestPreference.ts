import { useState } from 'react';
import { apiPatch } from '@/shared/services/api';
import { setUser } from '@/shared/store/authSlice';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';

export function useDigestPreference() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [pending, setPending] = useState(false);
  const enabled = user?.weeklyDigestOptIn ?? true;

  const toggle = async (value: boolean) => {
    if (!user) return;
    setPending(true);
    try {
      dispatch(setUser({ ...user, weeklyDigestOptIn: value }));
      await apiPatch('/users/me', { weeklyDigestOptIn: value });
    } catch {
      dispatch(setUser({ ...user, weeklyDigestOptIn: !value }));
    } finally {
      setPending(false);
    }
  };

  return { enabled, pending, toggle };
}
