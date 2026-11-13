import {
  useJournalEntry,
  useJournalEntriesBySource,
  useJournalEntriesByPeriod,
  useCurrentExchangeRate,
  useExchangeRates,
  useChartOfAccounts,
  useGeneralLedger,
  useTrialBalance,
  useRevenueReport,
  useReceivableAging,
  useJournalStats,
} from '@/hooks/billing';
import type { JournalSourceType } from '@/types';
import type { Filters } from '@/types';

/**
 * Journal Entry Detail
 */
export const JournalEntryDetail = (id: string) => {
  const { data, isLoading, isError } = useJournalEntry(id);

  return {
    journalEntry: data ?? null,
    isLoading,
    isError,
  };
};

/**
 * Journal Entries by Source (invoice / billing_record / subscription)
 */
export const JournalEntriesBySource = (
  sourceType: JournalSourceType,
  sourceId: string
) => {
  const { data, isLoading, isError } = useJournalEntriesBySource(
    sourceType,
    sourceId
  );

  return {
    journalEntries: data ?? [],
    isLoading,
    isError,
  };
};

/**
 * Journal Entries by Period
 */
export const JournalEntriesByPeriod = (
  from: string,
  to: string,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useJournalEntriesByPeriod(
    from,
    to,
    refreshKey
  );

  return {
    journalEntries: data ?? [],
    isLoading,
    isError,
  };
};

/**
 * Current Exchange Rate
 */
export const CurrentExchangeRate = (currency: string, date?: string) => {
  const { data, isLoading, isError } = useCurrentExchangeRate(currency, date);

  return {
    exchangeRate: data ?? null,
    isLoading,
    isError,
  };
};

/**
 * Exchange Rates List (by month)
 */
export const ExchangeRateList = (
  currency: string | null,
  year: number,
  month: number
) => {
  const { data, isLoading, isError } = useExchangeRates(currency, year, month);

  return {
    exchangeRates: data ?? [],
    isLoading,
    isError,
  };
};

/**
 * Chart of Accounts
 */
export const ChartOfAccountsList = (filters: Filters, refreshKey: number) => {
  const { data, isLoading, isError } = useChartOfAccounts(filters, refreshKey);

  return {
    accounts: data ?? [],
    isLoading,
    isError,
  };
};

/**
 * General Ledger Report
 */
export const GeneralLedgerReport = (
  accountCode: string,
  from: string,
  to: string
) => {
  const { data, isLoading, isError } = useGeneralLedger(accountCode, from, to);

  return {
    report: data ?? null,
    lines: data?.lines ?? [],
    summary: data?.summary ?? null,
    isLoading,
    isError,
  };
};

/**
 * Trial Balance Report
 */
export const TrialBalanceReport = (from: string, to: string) => {
  const { data, isLoading, isError } = useTrialBalance(from, to);

  return {
    report: data ?? null,
    accounts: data?.accounts ?? [],
    summary: data?.summary ?? null,
    isLoading,
    isError,
  };
};

/**
 * Revenue Report
 */
export const RevenueReport = (from: string, to: string) => {
  const { data, isLoading, isError } = useRevenueReport(from, to);

  return {
    report: data ?? null,
    isLoading,
    isError,
  };
};

/**
 * Receivable Aging Report
 */
export const ReceivableAgingReport = (asOfDate: string) => {
  const { data, isLoading, isError } = useReceivableAging(asOfDate);

  return {
    report: data ?? null,
    byCustomer: data?.by_customer ?? [],
    byProperty: data?.by_customer ?? [],
    isLoading,
    isError,
  };
};

/**
 * Journal Stats Report
 */
export const JournalStatsReport = (from: string, to: string) => {
  const { data, isLoading, isError } = useJournalStats(from, to);

  return {
    report: data ?? null,
    byType: data?.by_type ?? [],
    byStatus: data?.by_status ?? [],
    isLoading,
    isError,
  };
};
