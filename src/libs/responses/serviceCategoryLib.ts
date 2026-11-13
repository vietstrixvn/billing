import {
  useServiceCategories,
  useServiceCategoryDetail,
  useServiceCategoryByCode,
} from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Service Categories List Response Lib
 */
export const ServiceCategoryList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useServiceCategories(
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

  const categories = data?.results ?? [];

  return {
    categories,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Service Category Detail Response Lib
 */
export const ServiceCategoryDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useServiceCategoryDetail(id, refreshKey);

  const category = data ?? null;

  return {
    category,
    isLoading,
    isError,
  };
};

/**
 * Service Category By Code Response Lib
 */
export const ServiceCategoryByCode = (code: string, refreshKey: number) => {
  const { data, isLoading, isError } = useServiceCategoryByCode(
    code,
    refreshKey
  );

  const category = data ?? null;

  return {
    category,
    isLoading,
    isError,
  };
};
