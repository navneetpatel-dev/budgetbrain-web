import { apiPost } from '@/shared/services/api';

export function usePushTest() {
  return async () => {
    try {
      const result = await apiPost<{ sent: number }>('/notifications/test', {});
      window.alert(result.sent > 0 ? 'Push notification sent!' : 'No push token registered.');
    } catch {
      window.alert('Failed to send test notification.');
    }
  };
}
