import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 2 * 60 * 1000,
      // Keep visited module data warm so sidebar switches don't flash skeletons.
      gcTime: 15 * 60 * 1000,
      retry: 2,
      placeholderData: (previousData: unknown) => previousData,
    },
  },
});
