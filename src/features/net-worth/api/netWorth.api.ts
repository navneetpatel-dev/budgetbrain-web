import { apiGet } from '@/shared/services/api';

export interface NetWorthSummary {
  summary: { netWorth: number; currency: string };
  assets?: Array<{ id: string; name: string; value: number; type: string }>;
  liabilities?: Array<{ id: string; name: string; value: number; type: string }>;
}

export async function fetchNetWorth(): Promise<NetWorthSummary> {
  return apiGet<NetWorthSummary>('/net-worth');
}
