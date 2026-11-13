import { usePlans, usePlanDetail } from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Plans List Response Lib
 */
export const PlanList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = usePlans(
    currentPage,
    filters,
    refreshKey
  );

  const pagination = data?.data?.pagination ?? {
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_prev: false,
  };

  const plans = data?.data?.results ?? [];

  return {
    plans,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Plan Detail Response Lib
 */
export const PlanDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = usePlanDetail(id, refreshKey);

  const plan = data?.data ?? null;

  return {
    plan,
    isLoading,
    isError,
  };
};
