import { useState } from 'react';
import { apiDelete } from '@/shared/services/api';
import { useSignOut } from '@/features/auth';

export function useDeleteAccount() {
  const { signOut } = useSignOut();
  const [loading, setLoading] = useState(false);

  const deleteAccount = async () => {
    setLoading(true);
    try {
      await apiDelete('/users/me');
      await signOut();
    } catch {
      setLoading(false);
      throw new Error('Could not delete account');
    }
  };

  return { deleteAccount, loading };
}
