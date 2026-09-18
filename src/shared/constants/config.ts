export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:3002/api/v1';

export const SUPPORTED_CURRENCIES = ['INR', 'USD', 'EUR', 'GBP', 'AED', 'SGD'] as const;

export const CURRENCIES = [
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
];

export const COUNTRIES = [
  { code: 'IN', name: 'India' },
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'JP', name: 'Japan' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
];

export const GOAL_TYPES = [
  { id: 'emergency_fund', label: 'Emergency Fund' },
  { id: 'vacation', label: 'Vacation' },
  { id: 'car', label: 'Car' },
  { id: 'home', label: 'Home' },
  { id: 'investments', label: 'Investments' },
  { id: 'other', label: 'Other' },
];

export const SALARY_RANGES = [
  { id: 'below_5l', label: 'Below 5L' },
  { id: '5l_10l', label: '5L - 10L' },
  { id: '10l_20l', label: '10L - 20L' },
  { id: '20l_50l', label: '20L - 50L' },
  { id: 'above_50l', label: 'Above 50L' },
];

export const FINANCIAL_GOALS = [
  { id: 'track_spending', label: 'Track Spending' },
  { id: 'save_money', label: 'Save Money' },
  { id: 'budget_better', label: 'Budget Better' },
  { id: 'reduce_debt', label: 'Reduce Debt' },
  { id: 'invest_more', label: 'Invest More' },
  { id: 'build_wealth', label: 'Build Wealth' },
];

export const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash' },
  { id: 'card', label: 'Card' },
  { id: 'upi', label: 'UPI' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
  { id: 'other', label: 'Other' },
];

export const BUDGET_TYPES = [
  { id: 'monthly', label: 'Monthly' },
  { id: 'weekly', label: 'Weekly' },
  { id: 'custom', label: 'Custom' },
] as const;
