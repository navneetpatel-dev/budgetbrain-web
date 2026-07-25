import { apiPost } from '@/shared/services/api';

export function usePushTest() {
  return async () => {
    try {
      const result = await apiPost<{ message: string }>('/notifications/test', {});
      window.alert(result.message || 'Test notification sent');
    } catch {
      window.alert('Failed to send test notification.');
    }
  };
}
