'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { persistAuthSession } from '@/features/auth/services/auth.service';
import { performAcceptInvite } from '../services/acceptInvite.service';

/**
 * Public landing page for a family invite email link (`${APP_URL}/family/accept-invite?token=...`,
 * see backend email.service.ts's sendFamilyInviteEmail). Rendered even while unauthenticated —
 * (app)/layout.tsx explicitly allowlists this path — since the invitee may have no account yet.
 * On success, tokens are persisted and the user is dispatched into Redux the same way
 * useAuthHooks' login/register flows do. Already-onboarded users are sent to /dashboard
 * from this page; (app)/layout.tsx still routes unauthenticated users to login and
 * authenticated-but-not-onboarded users to /onboarding.
 */
export function AcceptInvitePage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const result = await performAcceptInvite(searchParams.get('token'), {
        apiPost,
        apiGet,
        persistAuthSession,
        getErrorMessage: getApiErrorMessage,
      });
      if (cancelled) return;
      if (result.ok) {
        dispatch(setUser(result.user));
        setStatus('success');
        if (result.user.onboardingCompleted) {
          router.replace('/dashboard');
        }
      } else {
        setStatus('error');
        setError(result.message);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once per page load, keyed on the token in the URL
  }, []);

  return (
    <ScreenWrapper header={null} inset="stack">
      <Card>
        {status === 'pending' && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: theme.colors.textSecondary }}>
            Accepting your invite…
          </p>
        )}
        {status === 'success' && (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: theme.colors.text }}>
            You&apos;ve joined the family group. Redirecting you now…
          </p>
        )}
        {status === 'error' && error && <FormErrorBanner message={error} />}
      </Card>
    </ScreenWrapper>
  );
}
