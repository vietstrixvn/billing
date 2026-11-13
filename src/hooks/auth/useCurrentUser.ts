import { useQuery, UseQueryResult } from '@tanstack/react-query';
import { AuthAPI } from '@/store/api';
import { queryKeys } from '@/libs';
import { useAuthStore } from '@/store/store';
import { UserDetail } from '@/types';

/**
 * Hook for fetching and accessing current user data.
 * Uses TanStack Query to manage server state with automatic caching and refetching.
 *
 * Requirements:
 * - 2.2: Automatically fetch Current_User when accessToken exists
 * - 2.3: Use enabled: !!accessToken to conditionally fetch
 * - 2.4: Handle 401 errors by transitioning to error state
 * - 7.1: Provide useCurrentUser hook wrapping useQuery(['me'])
 * - 7.2: Return { data, isLoading, error, refetch }
 * - 7.3: Only fetch when accessToken is not null
 * - 7.4: Fetch Current_User from /auth/profile
 * - 7.5: Automatically refetch when ['me'] query is invalidated
 *
 * @returns Query result with user data, loading state, error, and refetch function
 */
export function useCurrentUser(): UseQueryResult<UserDetail, Error> {
  const accessToken = useAuthStore((state) => state.accessToken);

  return useQuery({
    queryKey: queryKeys.me,
    queryFn: async () => {
      const { response, data } = await AuthAPI.getCurrentUser();

      // Handle 401 errors by throwing (Requirement 2.4)
      if (!response.ok) {
        // Propagate user-friendly error messages (Requirement 11.4)
        if (response.status === 401) {
          throw new Error('Session expired, please login again');
        }
        if (response.status === 403) {
          throw new Error('Access denied');
        }
        if (response.status >= 500) {
          throw new Error('Server error, please try again later');
        }
        throw new Error('Failed to fetch current user');
      }

      // Extract user data from nested response structure
      if (!data?.data) {
        throw new Error('Invalid response structure');
      }

      return data.data;
    },
    enabled: !!accessToken, // Only fetch when token exists (Requirement 2.3)
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
