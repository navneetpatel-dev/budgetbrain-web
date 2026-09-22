'use client';

import { useQuery } from '@tanstack/react-query';
import { apiGet } from '@/shared/services/api';
import type { DashboardData } from '@/shared/types';

export function useDashboard() {
  return useQuery({
    queryKey: ['dashboard'],
    queryFn: () => apiGet<DashboardData>('/expenses/dashboard'),
  });
}