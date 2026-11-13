import { useAddons, useAddonDetail, useAddonPrices } from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Addons List Response Lib
 */
export const AddonList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useAddons(
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

  const addons = data?.data?.results ?? [];

  return {
    addons,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Addon Detail Response Lib
 */
export const AddonDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useAddonDetail(id, refreshKey);

  const addon = data?.data ?? null;

  return {
    addon,
    isLoading,
    isError,
  };
};

/**
 * Addon Prices Response Lib
 */
export const AddonPriceList = (addonId: string, refreshKey: number) => {
  const { data, isLoading, isError } = useAddonPrices(addonId, refreshKey);

  const prices = data?.data ?? [];

  return {
    prices,
    isLoading,
    isError,
  };
};
