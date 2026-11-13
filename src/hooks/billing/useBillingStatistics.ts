import { useQuery } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import { buildQueryParams, logError } from '@/utils';
import type {
  BillingOverviewStats,
  RevenueStats,
  SubscriptionStats,
  PaymentStats,
  ExpiringSubscriptionsStats,
  PlanPerformance,
  BillingAlerts,
  InvoiceStats,
  TopCustomer,
  ApiResponse,
  PaginatedData,
} from '@/types';

/**
 * ==========================
 * 📌 Billing Statistics Hooks
 * ==========================
 */

// Fetch billing overview statistics
const fetchBillingOverview = async (): Promise<BillingOverviewStats> => {
  try {
    const response = await handleAPI<ApiResponse<BillingOverviewStats>>(
      endpoints.billing_statistics.overview,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching billing overview:', error);
    throw error;
  }
};

export const useBillingOverview = (refreshKey: number = 0) => {
  return useQuery<BillingOverviewStats, Error>({
    queryKey: ['billing_statistics', 'overview', refreshKey],
    queryFn: () => fetchBillingOverview(),
    staleTime: 300000, // 5 minutes
  });
};

// Fetch revenue statistics
const fetchRevenueStats = async (filters: {
  from?: string;
  to?: string;
  group_by?: 'day' | 'week' | 'month' | 'year';
}): Promise<RevenueStats> => {
  try {
    const queryString = new URLSearchParams(
      filters as Record<string, string>
    ).toString();
    const response = await handleAPI<ApiResponse<RevenueStats>>(
      `${endpoints.billing_statistics.revenue}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching revenue stats:', error);
    throw error;
  }
};

export const useRevenueStats = (
  filters: {
    from?: string;
    to?: string;
    group_by?: 'day' | 'week' | 'month' | 'year';
  } = {},
  refreshKey: number = 0
) => {
  return useQuery<RevenueStats, Error>({
    queryKey: ['billing_statistics', 'revenue', filters, refreshKey],
    queryFn: () => fetchRevenueStats(filters),
    staleTime: 300000,
  });
};

// Fetch subscription statistics
const fetchSubscriptionStats = async (): Promise<SubscriptionStats> => {
  try {
    const response = await handleAPI<ApiResponse<SubscriptionStats>>(
      endpoints.billing_statistics.subscriptions,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching subscription stats:', error);
    throw error;
  }
};

export const useSubscriptionStats = (refreshKey: number = 0) => {
  return useQuery<SubscriptionStats, Error>({
    queryKey: ['billing_statistics', 'subscriptions', refreshKey],
    queryFn: () => fetchSubscriptionStats(),
    staleTime: 300000,
  });
};

// Fetch payment statistics
const fetchPaymentStats = async (): Promise<PaymentStats> => {
  try {
    const response = await handleAPI<ApiResponse<PaymentStats>>(
      endpoints.billing_statistics.payments,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching payment stats:', error);
    throw error;
  }
};

export const usePaymentStats = (refreshKey: number = 0) => {
  return useQuery<PaymentStats, Error>({
    queryKey: ['billing_statistics', 'payments', refreshKey],
    queryFn: () => fetchPaymentStats(),
    staleTime: 300000,
  });
};

// Fetch expiring subscriptions
const fetchExpiringSubscriptions = async (
  days: number = 30
): Promise<ExpiringSubscriptionsStats> => {
  try {
    const response = await handleAPI<ApiResponse<ExpiringSubscriptionsStats>>(
      `${endpoints.billing_statistics.expiring}?days=${days}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching expiring subscriptions:', error);
    throw error;
  }
};

export const useExpiringSubscriptions = (
  days: number = 30,
  refreshKey: number = 0
) => {
  return useQuery<ExpiringSubscriptionsStats, Error>({
    queryKey: ['billing_statistics', 'expiring', days, refreshKey],
    queryFn: () => fetchExpiringSubscriptions(days),
    staleTime: 300000,
  });
};

// Fetch plan performance
const fetchPlanPerformance = async (): Promise<PlanPerformance[]> => {
  try {
    const response = await handleAPI<ApiResponse<PlanPerformance[]>>(
      endpoints.billing_statistics.plans,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching plan performance:', error);
    throw error;
  }
};

export const usePlanPerformance = (refreshKey: number = 0) => {
  return useQuery<PlanPerformance[], Error>({
    queryKey: ['billing_statistics', 'plans', refreshKey],
    queryFn: () => fetchPlanPerformance(),
    staleTime: 300000,
  });
};

// Fetch billing alerts
const fetchBillingAlerts = async (): Promise<BillingAlerts> => {
  try {
    const response = await handleAPI<ApiResponse<BillingAlerts>>(
      endpoints.billing_statistics.alerts,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching billing alerts:', error);
    throw error;
  }
};

export const useBillingAlerts = (refreshKey: number = 0) => {
  return useQuery<BillingAlerts, Error>({
    queryKey: ['billing_statistics', 'alerts', refreshKey],
    queryFn: () => fetchBillingAlerts(),
    staleTime: 60000, // 1 minute - alerts should be fresh
  });
};

// Fetch invoice statistics
const fetchInvoiceStats = async (): Promise<InvoiceStats> => {
  try {
    const response = await handleAPI<ApiResponse<InvoiceStats>>(
      endpoints.billing_statistics.invoices,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching invoice stats:', error);
    throw error;
  }
};

export const useInvoiceStats = (refreshKey: number = 0) => {
  return useQuery<InvoiceStats, Error>({
    queryKey: ['billing_statistics', 'invoices', refreshKey],
    queryFn: () => fetchInvoiceStats(),
    staleTime: 300000,
  });
};

// Fetch top customers
const fetchTopCustomers = async (
  page: number = 1,
  filters: {
    limit?: number;
    sort_by?: 'revenue' | 'subscriptions' | 'invoices';
  } = {}
): Promise<PaginatedData<TopCustomer>> => {
  try {
    const queryString = buildQueryParams(filters, page);
    const response = await handleAPI<ApiResponse<PaginatedData<TopCustomer>>>(
      `${endpoints.billing_statistics.top_customers}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching top customers:', error);
    throw error;
  }
};

export const useTopCustomers = (
  page: number = 1,
  filters: {
    limit?: number;
    sort_by?: 'revenue' | 'subscriptions' | 'invoices';
  } = {},
  refreshKey: number = 0
) => {
  return useQuery<PaginatedData<TopCustomer>, Error>({
    queryKey: [
      'billing_statistics',
      'top_customers',
      page,
      filters,
      refreshKey,
    ],
    queryFn: () => fetchTopCustomers(page, filters),
    enabled: page > 0,
    staleTime: 300000,
  });
};
