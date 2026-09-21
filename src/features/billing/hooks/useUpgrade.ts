'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { apiGet, apiPost, getApiErrorMessage } from '@/shared/services/api';
import { useAppDispatch, useAppSelector } from '@/shared/store/hooks';
import { setUser } from '@/shared/store/authSlice';
import { useTheme } from '@/shared/theme';
import type { User } from '@/shared/types';
import { openRazorpayCheckout } from '../services/razorpayCheckout.service';
import type { RazorpayCheckoutResponse, SubscriptionPlan } from '../types/billing.types';

const ENTITLEMENT_POLL_DELAYS_MS = [0, 1500, 3000, 5000];

function sleep(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type UpgradeStatus =
  | 'idle'
  | 'creating_order'
  | 'awaiting_payment'
  | 'confirming'
  | 'success'
  | 'confirming_delayed'
  | 'error'
  | 'cancelled';

export function useUpgrade() {
  const dispatch = useAppDispatch();
  const theme = useTheme();
  const user = useAppSelector((s) => s.auth.user);
  const [status, setStatus] = useState<UpgradeStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [pendingPlan, setPendingPlan] = useState<SubscriptionPlan | null>(null);
  const inFlight = useRef(false);
  const statusRef = useRef(status);
  useEffect(() => {
    statusRef.current = status;
  }, [status]);

  const checkoutMutation = useMutation({
    mutationFn: (plan: SubscriptionPlan) =>
      apiPost<RazorpayCheckoutResponse>('/subscriptions/razorpay/checkout', { plan }),
  });

  /** Polls the current user (the same source both mobile and web read for entitlement — see
   * backend/16's `applySubscriptionState` sync design) since the Razorpay webhook — the real
   * source of truth — may land a moment after the checkout modal's client-side success callback. */
  const confirmEntitlement = useCallback(async (expectPlan: SubscriptionPlan) => {
    for (const delay of ENTITLEMENT_POLL_DELAYS_MS) {
      if (delay > 0) await sleep(delay);
      try {
        const freshUser = await apiGet<User>('/users/me');
        dispatch(setUser(freshUser));
        if (freshUser.role === 'premium' || freshUser.role === 'lifetime') {
          return true;
        }
      } catch {
        // keep polling — a transient failure here shouldn't abort the confirmation loop
      }
    }
    // Payment succeeded client-side even if the webhook hasn't landed yet within our poll
    // window — don't tell the user it failed, just leave them to see it reflected shortly.
    void expectPlan;
    return false;
  }, [dispatch]);

  const startCheckout = useCallback(async (plan: SubscriptionPlan) => {
    if (inFlight.current) return;
    inFlight.current = true;
    setPendingPlan(plan);
    setError(null);
    setStatus('creating_order');

    try {
      const checkout = await checkoutMutation.mutateAsync(plan);
      setStatus('awaiting_payment');

      await openRazorpayCheckout({
        keyId: checkout.keyId,
        amount: checkout.amount,
        currency: checkout.currency,
        plan: checkout.plan,
        orderId: checkout.orderId,
        subscriptionId: checkout.subscriptionId,
        userName: user?.name ?? undefined,
        userEmail: user?.email,
        themeColor: theme.colors.primary,
        onSuccess: () => {
          setStatus('confirming');
          void confirmEntitlement(plan).then((confirmed) => {
            setStatus(confirmed ? 'success' : 'confirming_delayed');
          }).finally(() => {
            inFlight.current = false;
          });
        },
        onDismiss: () => {
          if (statusRef.current !== 'confirming' && statusRef.current !== 'success') {
            setStatus('cancelled');
          }
          inFlight.current = false;
        },
        onFailed: (message) => {
          setError(message);
          setStatus('error');
          inFlight.current = false;
        },
      });
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not start checkout'));
      setStatus('error');
      inFlight.current = false;
    }
  }, [checkoutMutation, user, theme, confirmEntitlement]);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
    setPendingPlan(null);
  }, []);

  /** Manual re-check for a user stuck in 'confirming_delayed' — re-runs the same poll rather
   * than a single one-off request, since the webhook may still land at any point. */
  const recheckEntitlement = useCallback(() => {
    if (!pendingPlan) return;
    setStatus('confirming');
    void confirmEntitlement(pendingPlan).then((confirmed) => {
      setStatus(confirmed ? 'success' : 'confirming_delayed');
    });
  }, [pendingPlan, confirmEntitlement]);

  return { status, error, pendingPlan, startCheckout, reset, recheckEntitlement };
}
