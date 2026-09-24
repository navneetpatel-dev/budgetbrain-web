/** Server shapes for transaction detection (backend `/detected-transactions`, plan Phase 6). */

export type DetectedStatus = 'auto_approved' | 'pending_review' | 'user_confirmed' | 'rejected' | 'duplicate';
export type DetectedType = 'expense' | 'income' | 'refund' | 'transfer';
export type Direction = 'DEBIT' | 'CREDIT';

export interface DetectedTransaction {
  id: string;
  amount: string;
  currency: string;
  direction: Direction;
  transactionType: DetectedType;
  subtype: string | null;
  paymentMethod: string | null;
  merchant: string | null;
  categoryId: string | null;
  categoryName: string | null;
  financialAccountId: string | null;
  financialAccountName: string | null;
  accountTail: string | null;
  referenceNumber: string | null;
  institutionId: string | null;
  transactionDate: string;
  confidenceTier: 'high' | 'medium' | 'low' | null;
  reviewReason: string | null;
  status: DetectedStatus;
  source: string;
  createdTransactionId: string | null;
  createdAt: string;
}

export interface DetectedList {
  items: DetectedTransaction[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export interface ConfirmOverrides {
  merchant?: string;
  transactionType?: DetectedType;
  categoryId?: string | null;
  financialAccountId?: string | null;
  notes?: string;
}

export interface MerchantRule {
  id: string;
  merchant: string;
  categoryId: string;
  categoryName: string | null;
  updatedAt: string;
}

export interface SyncState {
  latestSyncedTransactionDate: string | null;
  totalDetectedCount: number;
  pendingReviewCount: number;
  sources: { source: string; count: number; lastReceivedAt: string }[];
}

export interface DetectionConfig {
  enabled: boolean;
  autoCreateEnabled: boolean;
  autoAddHighConfidence: boolean;
}

export interface Institution {
  id: string;
  name: string;
  country: string;
}

export interface IngestRequest {
  kind: 'sms' | 'email';
  text: string;
  sender?: string | null;
  subject?: string | null;
  institutionId?: string | null;
}

export interface IngestResponse {
  status: 'created' | 'needs_review' | 'already_synced' | 'ignored' | 'validation_error';
  stage: string | null;
  reason: string | null;
  detected: DetectedTransaction | null;
}

export type StatementFormat = 'csv' | 'ofx' | 'qif' | 'mt940' | 'camt053';
export type DateOrder = 'DMY' | 'MDY' | 'YMD';

export interface CsvMapping {
  headerRow: number;
  dateColumn: string;
  descriptionColumn: string;
  amountColumn?: string;
  debitColumn?: string;
  creditColumn?: string;
  referenceColumn?: string;
  currencyColumn?: string;
  dateOrder: DateOrder;
  amountSign: 'debit_negative' | 'credit_negative';
}

export interface ImportOptions {
  mapping?: CsvMapping;
  financialAccountId?: string | null;
  includePossibleDuplicates?: boolean;
}

export interface ImportPreview {
  format: StatementFormat;
  csv: { delimiter: string; columns: string[]; suggestedMapping: CsvMapping | null } | null;
  needsMapping: boolean;
  totalRows: number;
  validRows: number;
  possibleDuplicates: number;
  alreadyImported: number;
  errors: { line: number; error: string }[];
  rows: {
    line: number;
    date: string;
    amount: string;
    currency: string;
    direction: Direction;
    transactionType: 'expense' | 'income' | 'refund';
    merchant: string | null;
    possibleDuplicate: boolean;
  }[];
  dateRange: { from: string; to: string } | null;
}

export interface ImportResult {
  format: StatementFormat;
  totalRows: number;
  created: number;
  needsReview: number;
  alreadyImported: number;
  skippedDuplicates: number;
  invalid: number;
  errors: { line: number; error: string }[];
}
