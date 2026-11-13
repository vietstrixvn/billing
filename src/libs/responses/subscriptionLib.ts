import {
  useSubscriptions,
  useSubscriptionDetail,
  useSubscriptionLogs,
  useAllSubscriptionLogs,
  useSubscriptionItems,
} from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Subscriptions List Response Lib
 */
export const SubscriptionList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useSubscriptions(
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

  const subscriptions = data?.data?.results ?? [];

  return {
    subscriptions,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Subscription Detail Response Lib
 */
export const SubscriptionDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useSubscriptionDetail(id, refreshKey);

  const subscription = data?.data ?? null;

  return {
    subscription,
    isLoading,
    isError,
  };
};

/**
 * Subscription Logs Response Lib (for a specific subscription)
 */
export const SubscriptionLogList = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useSubscriptionLogs(id, refreshKey);

  const logs = data?.data ?? [];

  return {
    logs,
    isLoading,
    isError,
  };
};

/**
 * All Subscription Logs Response Lib (paginated with filters)
 */
export const AllSubscriptionLogList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useAllSubscriptionLogs(
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

  const logs = data?.data?.results ?? [];

  return {
    logs,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Subscription Items Response Lib (for a specific subscription)
 */
export const SubscriptionItemList = (id: string, refreshKey: number = 0) => {
  const { data, isLoading, isError } = useSubscriptionItems(id, refreshKey);

  const items = data?.data ?? [];

  return {
    items,
    isLoading,
    isError,
  };
};
