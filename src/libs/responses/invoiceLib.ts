import {
  useInvoices,
  useInvoiceDetail,
  useInvoicePeriod,
} from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Invoices List Response Lib
 */
export const InvoiceList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useInvoices(
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

  const invoices = data?.data?.results ?? [];

  return {
    invoices,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Invoice Detail Response Lib
 */
export const InvoiceDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useInvoiceDetail(id, refreshKey);

  // Hook returns Invoice directly (already unwrapped)
  const invoice = data ?? null;

  return {
    invoice,
    isLoading,
    isError,
  };
};

/**
 * Invoice Period Response Lib
 */
export const InvoicePeriodList = (filters: Filters = {}) => {
  const { data, isLoading, isError } = useInvoicePeriod(filters);

  const invoices = data ?? [];

  return {
    invoices,
    isLoading,
    isError,
  };
};
