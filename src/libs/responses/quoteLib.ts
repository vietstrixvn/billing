import { useQuotes, useQuoteDetail } from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Quotes List Response Lib
 */
export const QuoteList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useQuotes(
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

  const quotes = data?.data?.results ?? [];

  return {
    quotes,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Quote Detail Response Lib
 */
export const QuoteDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useQuoteDetail(id, refreshKey);

  const quote = data?.data ?? null;

  return {
    quote,
    isLoading,
    isError,
  };
};
