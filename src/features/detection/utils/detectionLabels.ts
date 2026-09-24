import type { DetectedTransaction, DetectedType, Direction } from '../types/detection.types';

/** Plain-language labels for detection data (plan T6.4). Pure, so pages and tests share them. */

const SOURCE_LABELS: Record<string, string> = {
  android_sms: 'Phone SMS',
  notification: 'Phone notification',
  pasted_sms: 'Pasted message',
  email: 'Email',
  csv: 'CSV statement',
  ofx: 'OFX statement',
  qif: 'QIF statement',
  mt940: 'MT940 statement',
  camt053: 'CAMT.053 statement',
  open_banking: 'Open banking',
  bank_api: 'Bank connection',
};

export function sourceLabel(source: string): string {
  return SOURCE_LABELS[source] ?? source;
}

const TYPE_LABELS: Record<DetectedType, string> = {
  expense: 'Expense',
  income: 'Income',
  refund: 'Refund',
  transfer: 'Transfer',
};

export function typeLabel(type: DetectedType): string {
  return TYPE_LABELS[type];
}

const REVIEW_REASONS: Record<string, string> = {
  low_confidence: 'Some details were unclear',
  medium_confidence: 'Please check the details',
  kill_switch: 'Automatic adding is paused',
  auto_add_disabled: 'You review every transaction',
  possible_duplicate: 'Looks like one you already have',
  legacy_import: 'From the old importer',
};

export function reviewReasonLabel(reason: string | null): string | null {
  if (!reason) return null;
  return REVIEW_REASONS[reason] ?? 'Needs your review';
}

/** Why a pasted message or email produced nothing, in words the user can act on. */
const IGNORE_REASONS: Record<string, string> = {
  unknown_sender: "We couldn't tell which bank sent this. Pick the bank and try again.",
  otp_marker: 'This looks like a one-time password, not a transaction.',
  promo_marker: 'This looks like an offer or advert, not a transaction.',
  failed_or_declined: 'This payment failed or was declined, so nothing was spent.',
  non_transaction_notice: "This is a notice from the bank, not a transaction.",
  future_or_request: 'This is a payment request or a scheduled payment, not a completed one.',
  no_money_token: "We couldn't find an amount in this message.",
  no_amount: "We couldn't find an amount in this message.",
  no_movement_wording: "We couldn't tell whether money went out or came in.",
  kill_switch: 'Detection for this bank is paused right now.',
  invalid_amount: 'The amount in this message is not valid.',
  future_date: 'The date in this message is in the future.',
  invalid_date: 'The date in this message is too old or not valid.',
  excluded_merchant: 'You excluded this merchant from detection.',
  excluded_account: 'You excluded this account from detection.',
};

export function ignoreReasonMessage(reason: string | null): string {
  return (reason && IGNORE_REASONS[reason]) ?? "This message didn't look like a completed bank transaction.";
}

/** The sign to show before an amount: money out, money in, or moved between own accounts. */
export function amountSign(type: DetectedType, direction: Direction): string {
  if (type === 'transfer') return '⇄ ';
  return direction === 'CREDIT' ? '+' : '−';
}

export function detectedTitle(item: Pick<DetectedTransaction, 'merchant' | 'accountTail' | 'transactionType'>): string {
  if (item.merchant) return item.merchant;
  if (item.accountTail) return `Account ••• ${item.accountTail}`;
  return typeLabel(item.transactionType);
}
