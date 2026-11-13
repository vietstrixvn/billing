import { useRefunds, useRefundDetail } from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Refunds List Response Lib
 */
export const RefundList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useRefunds(
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

  const refunds = data?.data?.results ?? [];

  return {
    refunds,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Refund Detail Response Lib
 */
export const RefundDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useRefundDetail(id, refreshKey);

  const refund = data?.data ?? null;

  return {
    refund,
    isLoading,
    isError,
  };
};
