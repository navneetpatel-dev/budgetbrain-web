'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ScreenWrapper } from '@/shared/components/ui/layout';
import { Card, FormErrorBanner } from '@/shared/components/ui/index';
import { useTheme } from '@/shared/theme';
import { useAppDispatch } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { apiGet, getApiErrorMessage } from '@/shared/services/api';
import type { User } from '@/shared/types';
import { exchangeSsoToken, persistAuthSession } from '../services/auth.service';

/**
 * Public landing page for the mobile "subscribe" handoff (`${WEB_APP_URL}/auth/handoff?token=...`,
 * minted by the mobile app's /auth/sso/handoff endpoint since subscriptions are never purchased
 * in-app). (app)/layout.tsx allowlists this path so it renders while unauthenticated. On success,
 * tokens are persisted and the user is dispatched into Redux the same way the login flow does,
 * then this page itself navigates to /upgrade — unlike accept-invite, there's no ambiguity about
 * destination (onboarding vs. app), so no need to defer to the layout's auth-gate effect.
 */
export function SsoHandoffPage() {
  const theme = useTheme();
  const dispatch = useAppDispatch();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const token = searchParams.get('token');
      if (!token) {
        setError('This link is missing its token.');
        return;
      }
      try {
        const session = await exchangeSsoToken(token);
        await persistAuthSession(session);
        const user = await apiGet<User>('/users/me');
        if (cancelled) return;
        dispatch(setUser(user));
        // Forward the plan the user picked in the app, and `from=app` so /upgrade knows to
        // offer a "Return to app" action once checkout succeeds (see PaywallModal/webHandoff).
        const forwarded = new URLSearchParams();
        const plan = searchParams.get('plan');
        const from = searchParams.get('from');
        if (plan) forwarded.set('plan', plan);
        if (from) forwarded.set('from', from);
        const query = forwarded.toString();
        router.replace(query ? `/upgrade?${query}` : '/upgrade');
      } catch (err) {
        if (cancelled) return;
        setError(getApiErrorMessage(err, 'This link is invalid or has expired'));
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
        {error ? (
          <FormErrorBanner message={error} />
        ) : (
          <p style={{ fontFamily: 'Inter, sans-serif', fontSize: 14, color: theme.colors.textSecondary }}>
            Signing you in…
          </p>
        )}
      </Card>
    </ScreenWrapper>
  );
}
