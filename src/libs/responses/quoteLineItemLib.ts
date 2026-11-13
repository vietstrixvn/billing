import { useQuoteLineItems } from '@/hooks/billing';

/**
 * Quote Line Items List Response Lib
 */
export const QuoteLineItemList = (
  quoteId: string,
  refreshKey: number,
  ordered = true
) => {
  const { data, isLoading, isError } = useQuoteLineItems(
    quoteId,
    refreshKey,
    ordered
  );

  const items = data?.data ?? [];

  return {
    items,
    isLoading,
    isError,
  };
};
