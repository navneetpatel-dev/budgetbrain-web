import { useQuery } from '@tanstack/react-query';
import { fetchNetWorth } from '../../api/netWorth.api';

export function useNetWorthSummary() {
  return useQuery({
    queryKey: ['net-worth'],
    queryFn: fetchNetWorth,
  });
}
