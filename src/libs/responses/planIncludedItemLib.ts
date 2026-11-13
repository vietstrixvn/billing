import {
  usePlanIncludedItems,
  usePlanIncludedItemDetail,
} from '@/hooks/billing/usePlanIncludedItem';

/**
 * Plan Included Items List Response Lib
 */
export const PlanIncludedItemList = (
  planId: string,
  refreshKey: number,
  includePrices = false
) => {
  const { data, isLoading, isError } = usePlanIncludedItems(
    planId,
    refreshKey,
    includePrices
  );

  const items = data?.data ?? [];

  return {
    items,
    isLoading,
    isError,
  };
};

/**
 * Plan Included Item Detail Response Lib
 */
export const PlanIncludedItemDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = usePlanIncludedItemDetail(
    id,
    refreshKey
  );

  const item = data?.data ?? null;

  return {
    item,
    isLoading,
    isError,
  };
};
