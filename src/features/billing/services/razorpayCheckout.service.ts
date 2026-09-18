const RAZORPAY_SDK_SRC = 'https://checkout.razorpay.com/v1/checkout.js';

export interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id?: string;
  razorpay_subscription_id?: string;
  razorpay_signature: string;
}

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  order_id?: string;
  subscription_id?: string;
  recurring?: boolean;
  prefill?: { name?: string; email?: string };
  theme?: { color?: string };
  handler: (response: RazorpaySuccessResponse) => void;
  modal?: { ondismiss?: () => void };
}

interface RazorpayInstance {
  open: () => void;
  on: (event: 'payment.failed', handler: (response: { error: { description?: string } }) => void) => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayInstance;
  }
}

let sdkPromise: Promise<void> | null = null;

async function loadRazorpaySdk(): Promise<void> {
  if (window.Razorpay) return;
  if (sdkPromise) return sdkPromise;

  sdkPromise = new Promise<void>((resolve, reject) => {
    const existing = document.querySelector<HTMLScriptElement>(`script[src="${RAZORPAY_SDK_SRC}"]`);
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Razorpay SDK failed to load')));
      if (window.Razorpay) resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = RAZORPAY_SDK_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Razorpay SDK failed to load'));
    document.head.appendChild(script);
  }).catch((err) => {
    sdkPromise = null;
    throw err;
  });

  return sdkPromise;
}

export interface OpenCheckoutParams {
  keyId: string;
  amount: number;
  currency: string;
  plan: 'monthly' | 'yearly' | 'lifetime';
  orderId?: string;
  subscriptionId?: string;
  userName?: string;
  userEmail?: string;
  themeColor?: string;
  onSuccess: (response: RazorpaySuccessResponse) => void;
  onDismiss: () => void;
  onFailed: (message: string) => void;
}

const PLAN_LABEL: Record<OpenCheckoutParams['plan'], string> = {
  monthly: 'BudgetBrain Premium — Monthly',
  yearly: 'BudgetBrain Premium — Yearly',
  lifetime: 'BudgetBrain Premium — Lifetime',
};

/** Opens Razorpay's Checkout modal. `order_id` is used for the one-time lifetime purchase;
 * `subscription_id` + `recurring: true` is used for monthly/yearly recurring plans — these two
 * modes use different option keys per Razorpay's Checkout.js API and must not be conflated. */
export async function openRazorpayCheckout(params: OpenCheckoutParams): Promise<void> {
  await loadRazorpaySdk();
  if (!window.Razorpay) {
    throw new Error('Razorpay SDK failed to initialize');
  }

  const isRecurring = params.plan === 'monthly' || params.plan === 'yearly';

  const instance = new window.Razorpay({
    key: params.keyId,
    amount: params.amount,
    currency: params.currency,
    name: 'BudgetBrain',
    description: PLAN_LABEL[params.plan],
    ...(isRecurring
      ? { subscription_id: params.subscriptionId, recurring: true }
      : { order_id: params.orderId }),
    prefill: { name: params.userName, email: params.userEmail },
    theme: { color: params.themeColor },
    handler: params.onSuccess,
    modal: { ondismiss: params.onDismiss },
  });

  instance.on('payment.failed', (response) => {
    params.onFailed(response.error?.description ?? 'Payment failed');
  });

  instance.open();
}
