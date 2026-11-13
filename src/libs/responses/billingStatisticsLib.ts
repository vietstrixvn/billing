import {
  useBillingOverview,
  useRevenueStats,
  useSubscriptionStats,
  usePaymentStats,
  useExpiringSubscriptions,
  usePlanPerformance,
  useBillingAlerts,
  useInvoiceStats,
  useTopCustomers,
} from '@/hooks/billing';

/**
 * Billing Overview Statistics Response Lib
 */
export const BillingOverviewStats = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = useBillingOverview(refreshKey);

  const stats = data ?? null;

  return {
    stats,
    isLoading,
    isError,
  };
};

/**
 * Revenue Statistics Response Lib
 */
export const RevenueStatistics = (
  filters: {
    from?: string;
    to?: string;
    group_by?: 'day' | 'week' | 'month' | 'year';
  } = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = useRevenueStats(filters, refreshKey);

  const stats = data ?? null;

  return {
    stats,
    isLoading,
    isError,
  };
};

/**
 * Subscription Statistics Response Lib
 */
export const SubscriptionStatistics = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = useSubscriptionStats(refreshKey);

  const stats = data ?? null;

  return {
    stats,
    isLoading,
    isError,
  };
};

/**
 * Payment Statistics Response Lib
 */
export const PaymentStatistics = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = usePaymentStats(refreshKey);

  const stats = data ?? null;

  return {
    stats,
    isLoading,
    isError,
  };
};

/**
 * Expiring Subscriptions Response Lib
 */
export const ExpiringSubscriptionsList = (
  days: number = 30,
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = useExpiringSubscriptions(
    days,
    refreshKey
  );

  const stats = data ?? null;
  const subscriptions = data?.subscriptions ?? [];

  return {
    stats,
    subscriptions,
    isLoading,
    isError,
  };
};

/**
 * Plan Performance Response Lib
 */
export const PlanPerformanceList = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = usePlanPerformance(refreshKey);

  const plans = data ?? [];

  return {
    plans,
    isLoading,
    isError,
  };
};

/**
 * Billing Alerts Response Lib
 */
export const BillingAlertsList = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = useBillingAlerts(refreshKey);

  const alerts = data ?? null;

  return {
    alerts,
    isLoading,
    isError,
  };
};

/**
 * Invoice Statistics Response Lib
 */
export const InvoiceStatistics = (refreshKey: number = 0) => {
  const { data, isLoading, isError } = useInvoiceStats(refreshKey);

  const stats = data ?? null;

  return {
    stats,
    isLoading,
    isError,
  };
};

/**
 * Top Customers Response Lib
 */
export const TopCustomersList = (
  currentPage: number = 1,
  filters: {
    limit?: number;
    sort_by?: 'revenue' | 'subscriptions' | 'invoices';
  } = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = useTopCustomers(
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

  const customers = data?.results ?? [];

  return {
    customers,
    isLoading,
    isError,
    pagination,
  };
};
