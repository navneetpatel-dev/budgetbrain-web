import { apiDelete, apiGet, apiPatch, apiPost, apiPostFormData } from '@/shared/services/api';
import type {
  ConfirmOverrides,
  DetectedList,
  DetectedStatus,
  DetectedTransaction,
  DetectionConfig,
  ImportOptions,
  ImportPreview,
  ImportResult,
  IngestRequest,
  IngestResponse,
  Institution,
  MerchantRule,
  SyncState,
} from '../../types/detection.types';

const BASE = '/detected-transactions';

export function fetchPending(page = 1, limit = 50): Promise<DetectedList> {
  return apiGet<DetectedList>(`${BASE}/pending`, { page, limit });
}

export function fetchDetected(params: { status?: DetectedStatus; source?: string; page?: number; limit?: number }): Promise<DetectedList> {
  return apiGet<DetectedList>(BASE, { limit: 50, ...params });
}

export function confirmDetected(id: string, overrides: ConfirmOverrides): Promise<DetectedTransaction> {
  return apiPost<DetectedTransaction>(`${BASE}/pending/${id}/confirm`, overrides);
}

export function rejectDetected(id: string): Promise<DetectedTransaction> {
  return apiPost<DetectedTransaction>(`${BASE}/pending/${id}/reject`);
}

export function undoDetected(id: string): Promise<DetectedTransaction> {
  return apiPost<DetectedTransaction>(`${BASE}/${id}/undo`);
}

export function fetchRules(): Promise<MerchantRule[]> {
  return apiGet<MerchantRule[]>(`${BASE}/rules`);
}

export function updateRule(id: string, categoryId: string): Promise<MerchantRule> {
  return apiPatch<MerchantRule>(`${BASE}/rules/${id}`, { categoryId });
}

export function deleteRule(id: string): Promise<{ deleted: number }> {
  return apiDelete<{ deleted: number }>(`${BASE}/rules/${id}`);
}

export function resetRules(): Promise<{ deleted: number }> {
  return apiDelete<{ deleted: number }>(`${BASE}/rules`);
}

export function fetchSyncState(): Promise<SyncState> {
  return apiGet<SyncState>(`${BASE}/sync-state`);
}

export function fetchConfig(): Promise<DetectionConfig> {
  return apiGet<DetectionConfig>(`${BASE}/config`);
}

export function updateAutoAdd(autoAddHighConfidence: boolean): Promise<DetectionConfig> {
  return apiPatch<DetectionConfig>(`${BASE}/settings`, { autoAddHighConfidence });
}

export function deleteMyDetectedData(): Promise<{ deleted: number }> {
  return apiDelete<{ deleted: number }>(`${BASE}/me`);
}

export function fetchInstitutions(): Promise<Institution[]> {
  return apiGet<Institution[]>(`${BASE}/institutions`);
}

export function ingestMessage(request: IngestRequest): Promise<IngestResponse> {
  return apiPost<IngestResponse>(`${BASE}/ingest`, request);
}

function statementForm(file: File, options: ImportOptions): FormData {
  const form = new FormData();
  form.append('file', file);
  form.append('options', JSON.stringify(options));
  return form;
}

export function previewStatement(file: File, options: ImportOptions): Promise<ImportPreview> {
  return apiPostFormData<ImportPreview>(`${BASE}/import/preview`, statementForm(file, options));
}

export function importStatement(file: File, options: ImportOptions): Promise<ImportResult> {
  return apiPostFormData<ImportResult>(`${BASE}/import`, statementForm(file, options));
}
