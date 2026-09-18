import { useEffect } from 'react';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { getAccessToken, clearTokens } from '@/shared/services/api';
import { apiGet } from '@/shared/services/api';
import type { User } from '@/shared/types';

export function AuthBootstrap({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const bootstrap = async () => {
      const token = getAccessToken();
      if (!token) {
        dispatch(setUser(null));
        return;
      }
      try {
        const user = await apiGet<User>('/users/me');
        dispatch(setUser(user));
      } catch {
        clearTokens();
        dispatch(setUser(null));
      }
    };
    bootstrap();
  }, [dispatch]);

  return <>{children}</>;
}
