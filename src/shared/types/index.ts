export interface User {
  id: string;
  email: string;
  name: string | null;
  country: string | null;
  currency: string;
  role: 'free' | 'premium' | 'lifetime' | 'admin';
  onboardingCompleted: boolean;
  financialGoals: string[] | null;
  salaryRange: string | null;
  monthlySavingsTarget: number | null;
  theme?: string | null;
  accent?: string | null;
  weeklyDigestOptIn?: boolean;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string | null;
  color: string | null;
  isDefault: boolean;
  sortOrder: number;
  archivedAt?: string | null;
}

export interface IncomeAllocation {
  id: string;
  financialAccountId: string;
  amount: number;
  financialAccount?: { id: string; name: string; currency: string };
}

/**
 * `refund` and `transfer` are kept apart from income and expense; the server nets refunds
 * against spending and leaves transfers out of both totals (spec §8–12).
 */
export type TransactionType = 'expense' | 'income' | 'refund' | 'transfer';

export interface Transaction {
  id: string;
  type: TransactionType;
  /** Transfers only: whether this leg took money out of (DEBIT) or into (CREDIT) the account. */
  direction?: 'DEBIT' | 'CREDIT' | null;
  subtype?: string | null;
  /** `detected` for automatically detected transactions. */
  source?: 'manual' | 'detected' | 'import' | 'open_banking';
  amount: number;
  currency: string;
  categoryId: string | null;
  incomeSourceId?: string | null;
  notes: string | null;
  merchant: string | null;
  date: string;
  paymentMethod: string | null;
  category?: Category;
  incomeSource?: IncomeSource;
  tags?: string[] | null;
  /** Only present on income-type transactions that have been split across accounts. */
  incomeAllocations?: IncomeAllocation[];
}

export interface Budget {
  id: string;
  name: string;
  type: 'monthly' | 'weekly' | 'custom';
  amount: number;
  currency: string;
  categoryId: string | null;
  startDate: string;
  endDate: string | null;
  alertThreshold: number;
  rollover: boolean;
  rolloverAmount?: number;
  effectiveAmount?: number;
  spent?: number;
  spentPercentage?: number;
  category?: Category;
}

export interface IncomeSource {
  id: string;
  name: string;
  type: 'salary' | 'freelancing' | 'investments' | 'rental' | 'other';
  isRecurring: boolean;
  recurringRule: string | null;
}

export interface FinancialAccount {
  id: string;
  name: string;
  type: 'bank' | 'credit_card' | 'cash' | 'wallet';
  institution: string | null;
  accountNumberLast4: string | null;
  balance: number;
  creditLimit: number | null;
  currency: string;
  isActive: boolean;
}

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'mutual_fund' | 'fd' | 'crypto' | 'gold' | 'other';
  symbol: string | null;
  quantity: number;
  purchasePrice: number;
  currentPrice: number;
  currency: string;
  purchaseDate: string;
  /** Server-computed (quantity * currentPrice) — always present; never derive client-side. */
  currentValue: number;
  /** Server-computed — always present; never derive client-side. */
  gainLoss: number;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  type: string;
  read: boolean;
  sentAt: string;
}

export interface GoalContribution {
  id: string;
  goalId: string;
  userId: string;
  amount: number;
  note: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Goal {
  id: string;
  name: string;
  type: string;
  targetAmount: number;
  currentAmount: number;
  currency: string;
  targetDate: string | null;
  /** Server-computed (0-100, capped) — never derive this from currentAmount/targetAmount client-side. */
  progressPercentage: number;
  contributions?: GoalContribution[];
}

export interface Loan {
  id: string;
  userId: string;
  name: string;
  type: 'loan' | 'credit_card' | 'emi' | 'other';
  principal: number;
  interestRate: number | null;
  emiAmount: number | null;
  remainingBalance: number;
  currency: string;
  startDate: string;
  dueDayOfMonth: number | null;
  notes: string | null;
  closed: boolean;
  amountPaid?: number;
  paidPercentage?: number;
  payments?: LoanPayment[];
}

export interface LoanPayment {
  id: string;
  loanId: string;
  userId: string;
  amount: number;
  notes: string | null;
  paidAt: string;
}

export interface RecurringSeries {
  id: string;
  userId: string;
  merchant: string;
  categoryId: string | null;
  amount: number;
  currency: string;
  cadence: 'weekly' | 'monthly' | 'yearly';
  nextDueDate: string;
  lastChargedDate: string | null;
  active: boolean;
  reminderDaysBefore: number;
  source: 'manual' | 'detected';
  category?: Category;
}

export interface ExpenseSplitParticipant {
  id: string;
  transactionId: string;
  groupId: string;
  userId: string;
  shareAmount: number;
  settled: boolean;
  settledAt: string | null;
}

export interface FamilyGroupMember {
  id: string;
  groupId: string;
  userId: string;
  role: string;
  user?: { id: string; name: string | null; email: string; avatarUrl: string | null };
}

export interface SplitBalance {
  fromUserId: string;
  toUserId: string;
  amount: number;
}

export interface MonthlyRecap {
  periodStart: string;
  periodEnd: string;
  totalSpent: number;
  topCategory: { name: string; amount: number } | null;
  biggestExpense: { merchant: string | null; amount: number } | null;
  noSpendStreak: number;
}

export interface SpendingTrendPoint {
  label: string;
  total: number;
}

export interface SpendingTrends {
  daily: SpendingTrendPoint[];
  weekly: SpendingTrendPoint[];
  monthly: SpendingTrendPoint[];
}

export interface StructuredInsight {
  kind: 'monthly_comparison' | 'top_category' | 'saving_opportunity' | 'budget_recommendation';
  title: string;
  message: string;
  amount?: number;
  category?: string;
  changePercent?: number;
}

export interface AiInsight {
  insights: string[];
  structuredInsights?: StructuredInsight[];
  summary: { current: number; previous: number; changePercent: number };
}

export interface AiAnomaly {
  type: 'spending_spike' | 'duplicate_expense' | 'subscription_cost_increase' | 'unusual_transaction';
  transactionId?: string;
  recurringSeriesId?: string;
  merchant?: string;
  amount?: number;
  severity: 'low' | 'medium' | 'high';
  reason: string;
}

export interface DashboardData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netSavings: number;
    savingsRate: number;
    currency: string;
  };
  recentTransactions: Transaction[];
  budgets: Budget[];
  goals: Goal[];
  categoryBreakdown: Array<{ categoryId: string; total: string; category?: Category }>;
  noSpendStreak: number;
  upcomingBills: RecurringSeries[];
  spendingTrends?: SpendingTrends;
}

export interface PaginationMeta {
  total: number;
  page: number;
  limit: number;
}

export interface TransactionsSummary {
  totalExpense: number;
  totalIncome: number;
}

export interface PaginatedTransactions extends PaginationMeta {
  transactions: Transaction[];
  summary?: TransactionsSummary;
}

export type PaginatedList<K extends string, T> = PaginationMeta & Record<K, T[]>;

export interface ApiErrorDetail {
  message?: string;
  path?: Array<string | number>;
  code?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: { message: string; code?: string; details?: ApiErrorDetail[] };
}

export interface AiChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface AiChatResponse {
  conversationId: string;
  message: AiChatMessage;
  messages: AiChatMessage[];
}

export interface AiConversationSummary {
  id: string;
  title: string;
  createdAt: string;
  updatedAt: string;
}

export interface AiConversation extends AiConversationSummary {
  messages: AiChatMessage[];
}

