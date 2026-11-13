import { useQuery } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import { buildQueryParams, logError } from '@/utils';
import type {
  BillingRecord,
  Invoice,
  Subscription,
  SubscriptionLog,
  ApiResponse,
  PaginatedData,
  Filters,
} from '@/types';

/**
 * ==========================
 * 📌 Customer Billing Hooks
 * ==========================
 */

export interface CustomerBillingHistory {
  customer_id: string;
  billing_records: BillingRecord[];
  invoices: Invoice[];
  subscriptions: Subscription[];
}

// Fetch customer billing history
const fetchCustomerBillingHistory = async (
  customerId: number | string
): Promise<CustomerBillingHistory> => {
  try {
    const response = await handleAPI<ApiResponse<CustomerBillingHistory>>(
      endpoints.customers.billing.billing(customerId),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer billing history:', error);
    throw error;
  }
};

export const useCustomerBillingHistory = (
  customerId: number | string,
  refreshKey: number = 0
) => {
  return useQuery<CustomerBillingHistory, Error>({
    queryKey: ['customer_billing', 'history', customerId, refreshKey],
    queryFn: () => fetchCustomerBillingHistory(customerId),
    enabled: !!customerId,
    staleTime: 60000,
  });
};

// Fetch customer billing records
const fetchCustomerBillingRecords = async (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {}
): Promise<PaginatedData<BillingRecord>> => {
  try {
    const queryString = buildQueryParams(filters, page);
    const response = await handleAPI<ApiResponse<PaginatedData<BillingRecord>>>(
      `${endpoints.customers.billing.record(customerId)}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer billing records:', error);
    throw error;
  }
};

export const useCustomerBillingRecords = (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  return useQuery<PaginatedData<BillingRecord>, Error>({
    queryKey: [
      'customer_billing',
      'records',
      customerId,
      page,
      filters,
      refreshKey,
    ],
    queryFn: () => fetchCustomerBillingRecords(customerId, page, filters),
    enabled: !!customerId && page > 0,
    staleTime: 60000,
  });
};

// Fetch customer invoices
const fetchCustomerInvoices = async (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {}
): Promise<PaginatedData<Invoice>> => {
  try {
    const queryString = buildQueryParams(filters, page);
    const response = await handleAPI<ApiResponse<PaginatedData<Invoice>>>(
      `${endpoints.customers.billing.invoices(customerId)}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer invoices:', error);
    throw error;
  }
};

export const useCustomerInvoices = (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  return useQuery<PaginatedData<Invoice>, Error>({
    queryKey: [
      'customer_billing',
      'invoices',
      customerId,
      page,
      filters,
      refreshKey,
    ],
    queryFn: () => fetchCustomerInvoices(customerId, page, filters),
    enabled: !!customerId && page > 0,
    staleTime: 60000,
  });
};

// Fetch customer subscriptions
const fetchCustomerSubscriptions = async (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {}
): Promise<PaginatedData<Subscription>> => {
  try {
    const queryString = buildQueryParams(filters, page);
    const response = await handleAPI<ApiResponse<PaginatedData<Subscription>>>(
      `${endpoints.customers.billing.subscriptions(customerId)}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer subscriptions:', error);
    throw error;
  }
};

export const useCustomerSubscriptions = (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  return useQuery<PaginatedData<Subscription>, Error>({
    queryKey: [
      'customer_billing',
      'subscriptions',
      customerId,
      page,
      filters,
      refreshKey,
    ],
    queryFn: () => fetchCustomerSubscriptions(customerId, page, filters),
    enabled: !!customerId && page > 0,
    staleTime: 60000,
  });
};

// Fetch customer subscription logs
const fetchCustomerSubscriptionLogs = async (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {}
): Promise<PaginatedData<SubscriptionLog>> => {
  try {
    const queryString = buildQueryParams(filters, page);
    const response = await handleAPI<ApiResponse<PaginatedData<SubscriptionLog>>>(
      `${endpoints.customers.billing.log(customerId)}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer subscription logs:', error);
    throw error;
  }
};

export const useCustomerSubscriptionLogs = (
  customerId: number | string,
  page: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  return useQuery<PaginatedData<SubscriptionLog>, Error>({
    queryKey: [
      'customer_billing',
      'logs',
      customerId,
      page,
      filters,
      refreshKey,
    ],
    queryFn: () => fetchCustomerSubscriptionLogs(customerId, page, filters),
    enabled: !!customerId && page > 0,
    staleTime: 60000,
  });
};

// Backwards compatibility aliases for Property Billing
export const usePropertyBillingHistory = useCustomerBillingHistory;
export const usePropertyBillingRecords = useCustomerBillingRecords;
export const usePropertyInvoices = useCustomerInvoices;
export const usePropertySubscriptions = useCustomerSubscriptions;
export const usePropertySubscriptionLogs = useCustomerSubscriptionLogs;
