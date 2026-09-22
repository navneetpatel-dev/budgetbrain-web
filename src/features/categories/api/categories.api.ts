import { apiPatch, apiPost } from '@/shared/services/api';

export function createCategory(body: { name: string; color: string }) {
  return apiPost('/categories', body);
}

export function updateCategory(id: string, body: { name: string; color: string }) {
  return apiPatch(`/categories/${id}`, body);
}

export function archiveCategory(id: string) {
  return apiPost(`/categories/${id}/archive`);
}

export function unarchiveCategory(id: string) {
  return apiPost(`/categories/${id}/unarchive`);
}

export function reorderCategories(orderedIds: string[]) {
  return apiPost('/categories/reorder', { orderedIds });
}
