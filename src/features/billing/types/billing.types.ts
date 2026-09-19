export type SubscriptionPlan = 'monthly' | 'yearly' | 'lifetime';

export interface RazorpayCheckoutResponse {
  keyId: string;
  currency: string;
  plan: SubscriptionPlan;
  amount: number;
  orderId?: string;
  subscriptionId?: string;
}

export interface StripeCheckoutResponse {
  url: string;
}

export interface EntitlementStatus {
  isEntitled: boolean;
  plan: SubscriptionPlan | null;
  status: string | null;
  isLifetime: boolean;
  expiresAt: string | null;
}
