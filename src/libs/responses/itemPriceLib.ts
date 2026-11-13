import {
  useItemPrices,
  useActiveItemPrice,
  useItemPriceDetail,
} from '@/hooks/billing';

/**
 * Item Prices List Response Lib
 */
export const ItemPriceList = (itemId: string, refreshKey: number) => {
  const { data, isLoading, isError } = useItemPrices(itemId, refreshKey);

  const prices = data ?? [];

  return {
    prices,
    isLoading,
    isError,
  };
};

/**
 * Active Item Price Response Lib
 */
export const ActiveItemPrice = (
  itemId: string,
  billingCycle: 'monthly' | 'yearly',
  date?: string,
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = useActiveItemPrice(
    itemId,
    billingCycle,
    date,
    refreshKey
  );

  const price = data ?? null;

  return {
    price,
    isLoading,
    isError,
  };
};

/**
 * Item Price Detail Response Lib
 */
export const ItemPriceDetail = (priceId: string, refreshKey: number) => {
  const { data, isLoading, isError } = useItemPriceDetail(priceId, refreshKey);

  const price = data ?? null;

  return {
    price,
    isLoading,
    isError,
  };
};
