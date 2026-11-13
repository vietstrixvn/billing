import {
  useServiceItems,
  useServiceItemDetail,
  useServiceItemByCode,
} from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Service Items List Response Lib
 */
export const ServiceItemList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useServiceItems(
    currentPage,
    filters,
    refreshKey
  );

  const pagination = data?.pagination ?? {
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_prev: false,
  };

  const items = data?.results ?? [];

  return {
    items,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Service Item Detail Response Lib
 */
export const ServiceItemDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useServiceItemDetail(id, refreshKey);

  const item = data ?? null;

  return {
    item,
    isLoading,
    isError,
  };
};

/**
 * Service Item By Code Response Lib
 */
export const ServiceItemByCode = (code: string, refreshKey: number) => {
  const { data, isLoading, isError } = useServiceItemByCode(code, refreshKey);

  const item = data ?? null;

  return {
    item,
    isLoading,
    isError,
  };
};
