import { useInvoiceItems, useInvoiceItemDetail } from '@/hooks/billing';

/**
 * Invoice Items List Response Lib
 */
export const InvoiceItemList = (invoiceId: string, refreshKey: number) => {
  const { data, isLoading, isError } = useInvoiceItems(invoiceId, refreshKey);

  // Hook returns InvoiceItem[] directly
  const items = data ?? [];

  return {
    items,
    isLoading,
    isError,
  };
};

/**
 * Invoice Item Detail Response Lib
 */
export const InvoiceItemDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useInvoiceItemDetail(id, refreshKey);

  // Hook returns InvoiceItem directly
  const item = data ?? null;

  return {
    item,
    isLoading,
    isError,
  };
};
