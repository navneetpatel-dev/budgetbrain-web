'use client';

import { useAppSelector } from '@/shared/store/hooks';

export function isProUser(role?: string | null): boolean {
  if (!role) return false;
  return role === 'premium' || role === 'lifetime' || role === 'admin';
}

export function useIsPro(): boolean {
  const user = useAppSelector((s) => s.auth.user);
  return isProUser(user?.role);
}
