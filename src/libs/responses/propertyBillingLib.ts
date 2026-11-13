import {
  usePropertyBillingHistory,
  usePropertyBillingRecords,
  usePropertyInvoices,
  usePropertySubscriptions,
  usePropertySubscriptionLogs,
} from '@/hooks/billing';
import type { Filters } from '@/types';

/**
 * Property Billing History Response Lib
 */
export const PropertyBillingHistory = (
  propertyId: number | string,
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = usePropertyBillingHistory(
    propertyId,
    refreshKey
  );

  const history = data ?? null;

  return {
    history,
    isLoading,
    isError,
  };
};

/**
 * Property Billing Records Response Lib
 */
export const PropertyBillingRecordList = (
  propertyId: number | string,
  currentPage: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = usePropertyBillingRecords(
    propertyId,
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

  const records = data?.results ?? [];

  return {
    records,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Property Invoices Response Lib
 */
export const PropertyInvoiceList = (
  propertyId: number | string,
  currentPage: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = usePropertyInvoices(
    propertyId,
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

  const invoices = data?.results ?? [];

  return {
    invoices,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Property Subscriptions Response Lib
 */
export const PropertySubscriptionList = (
  propertyId: number | string,
  currentPage: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = usePropertySubscriptions(
    propertyId,
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

  const subscriptions = data?.results ?? [];

  return {
    subscriptions,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Property Subscription Logs Response Lib
 */
export const PropertySubscriptionLogList = (
  propertyId: number | string,
  currentPage: number = 1,
  filters: Filters = {},
  refreshKey: number = 0
) => {
  const { data, isLoading, isError } = usePropertySubscriptionLogs(
    propertyId,
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

  const logs = data?.results ?? [];

  return {
    logs,
    isLoading,
    isError,
    pagination,
  };
};
