import { apiDelete, apiPatch, apiPost } from '@/shared/services/api';
import type { RecurringSeries } from '@/shared/types';

export function createRecurringSeries(data: Record<string, unknown>) {
  return apiPost<RecurringSeries>('/recurring-series', data);
}

export function dismissRecurringSeries(id: string) {
  return apiPatch(`/recurring-series/${id}`, { active: false });
}

export function deleteRecurringSeries(id: string) {
  return apiDelete(`/recurring-series/${id}`);
}
