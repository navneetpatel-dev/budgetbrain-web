import { toSafeNumber } from './number';

const CURRENCY_SYMBOLS: Record<string, string> = {
  INR: '₹',
  USD: '$',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
  CAD: 'C$',
};

export function formatCurrency(amount: unknown, currency: string = 'INR'): string {
  const safe = toSafeNumber(amount);
  const symbol = CURRENCY_SYMBOLS[currency] ?? currency;
  const fixed = Math.abs(safe).toFixed(safe % 1 === 0 ? 0 : 2);
  const formatted = Number(fixed).toLocaleString('en-IN');
  const sign = safe < 0 ? '-' : '';
  return `${sign}${symbol}${formatted}`;
}

export function getCurrencySymbol(currency: string): string {
  return CURRENCY_SYMBOLS[currency] ?? currency;
}
