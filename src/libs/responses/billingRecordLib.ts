import { useBillingRecords, useBillingRecordDetail } from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Billing Records List Response Lib
 */
export const BillingRecordList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useBillingRecords(
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

  const records = data?.data?.results ?? [];

  return {
    records,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Billing Record Detail Response Lib
 */
export const BillingRecordDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useBillingRecordDetail(id, refreshKey);

  const record = data?.data ?? null;

  return {
    record,
    isLoading,
    isError,
  };
};
