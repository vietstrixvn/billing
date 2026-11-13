import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import { buildQueryParamsNoPage, logError } from '@/utils';
import type {
  JournalEntryResponse,
  JournalEntriesBySourceResponse,
  JournalEntriesByPeriodResponse,
  CreateJournalEntryDTO,
  CreateJournalEntryResponse,
  ReverseJournalEntryDTO,
  ReverseJournalEntryResponse,
  CreateExchangeRateDTO,
  CreateExchangeRateResponse,
  CurrentExchangeRateResponse,
  ExchangeRateListResponse,
  ChartOfAccountsResponse,
  GeneralLedgerResponse,
  TrialBalanceResponse,
  RevenueReportResponse,
  ReceivableAgingResponse,
  JournalStatsResponse,
  JournalEntry,
  ExchangeRate,
  ExchangeRateSummary,
  ChartOfAccount,
  GeneralLedgerData,
  TrialBalanceData,
  RevenueReportData,
  ReceivableAgingData,
  JournalStatsData,
  Filters,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Journal Entries Hooks
 * ==========================
 */

// Fetch journal entry by ID
const fetchJournalEntry = async (id: string): Promise<JournalEntry> => {
  try {
    const response = await handleAPI<JournalEntryResponse>(
      endpoints.accounting.journal_entries(id),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching journal entry:', error);
    throw error;
  }
};

export const useJournalEntry = (id: string) => {
  return useQuery<JournalEntry, Error>({
    queryKey: ['journal-entry', id],
    queryFn: () => fetchJournalEntry(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch journal entries by source
const fetchJournalEntriesBySource = async (
  sourceType: string,
  sourceId: string
): Promise<JournalEntry[]> => {
  try {
    const response = await handleAPI<JournalEntriesBySourceResponse>(
      `${endpoints.accounting.journal_list}?source_type=${sourceType}&source_id=${sourceId}`,
      'GET'
    );
    return response.data.data || [];
  } catch (error) {
    logError('Error fetching journal entries by source:', error);
    throw error;
  }
};

export const useJournalEntriesBySource = (
  sourceType: string,
  sourceId: string
) => {
  return useQuery<JournalEntry[], Error>({
    queryKey: ['journal-entries', 'by-source', sourceType, sourceId],
    queryFn: () => fetchJournalEntriesBySource(sourceType, sourceId),
    enabled: !!sourceType && !!sourceId,
    staleTime: 30000,
  });
};

// Fetch journal entries by period
const fetchJournalEntriesByPeriod = async (
  from: string,
  to: string
): Promise<JournalEntry[]> => {
  try {
    const response = await handleAPI<JournalEntriesByPeriodResponse>(
      `${endpoints.accounting.journal_period}?from=${from}&to=${to}`,
      'GET'
    );
    return response.data.data || [];
  } catch (error) {
    logError('Error fetching journal entries by period:', error);
    throw error;
  }
};

export const useJournalEntriesByPeriod = (
  from: string,
  to: string,
  refreshKey: number = 0
) => {
  return useQuery<JournalEntry[], Error>({
    queryKey: ['journal-entries', 'period', from, to, refreshKey],
    queryFn: () => fetchJournalEntriesByPeriod(from, to),
    enabled: !!from && !!to,
    staleTime: 60000,
  });
};

// Create journal entry (manual entry)
const createJournalEntry = async (
  dto: CreateJournalEntryDTO
): Promise<CreateJournalEntryResponse> => {
  const response = await handleAPI<CreateJournalEntryResponse>(
    endpoints.accounting.journal_list,
    'POST',
    dto
  );
  return response.data;
};

export const useCreateJournalEntry = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<CreateJournalEntryResponse, Error, CreateJournalEntryDTO>({
    mutationFn: (dto) => createJournalEntry(dto),
    onSuccess: (response) => {
      handleSuccess(response as any, 'Journal entry created successfully');
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Reverse journal entry (storno)
const reverseJournalEntry = async (
  id: string,
  dto: ReverseJournalEntryDTO
): Promise<ReverseJournalEntryResponse> => {
  const response = await handleAPI<ReverseJournalEntryResponse>(
    endpoints.accounting.journal_reverse(id),
    'POST',
    dto
  );
  return response.data;
};

export const useReverseJournalEntry = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    ReverseJournalEntryResponse,
    Error,
    { id: string; dto: ReverseJournalEntryDTO }
  >({
    mutationFn: async ({ id, dto }) => {
      return reverseJournalEntry(id, dto);
    },
    onSuccess: async (response) => {
      handleSuccess(response as any, 'Journal entry reversed successfully');

      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: ['journal-entry'] });
      queryClient.invalidateQueries({ queryKey: ['journal-entries'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

/**
 * ==========================
 * 📌 Exchange Rates Hooks
 * ==========================
 */

// Create/Update exchange rate
const createExchangeRate = async (
  dto: CreateExchangeRateDTO
): Promise<CreateExchangeRateResponse> => {
  const response = await handleAPI<CreateExchangeRateResponse>(
    endpoints.accounting.exchange_rates,
    'POST',
    dto
  );
  return response.data;
};

export const useCreateExchangeRate = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<CreateExchangeRateResponse, Error, CreateExchangeRateDTO>({
    mutationFn: async (dto) => {
      return createExchangeRate(dto);
    },
    onSuccess: async (response) => {
      handleSuccess(response as any, 'Exchange rate saved successfully');

      // Invalidate exchange rate queries
      queryClient.invalidateQueries({ queryKey: ['exchange-rate'] });
      queryClient.invalidateQueries({ queryKey: ['exchange-rates'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Fetch current exchange rate
const fetchCurrentExchangeRate = async (
  currency: string,
  date?: string
): Promise<ExchangeRate> => {
  try {
    const params = date
      ? `?currency=${currency}&date=${date}`
      : `?currency=${currency}`;
    const response = await handleAPI<CurrentExchangeRateResponse>(
      `${endpoints.accounting.exchange_current}${params}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching current exchange rate:', error);
    throw error;
  }
};

export const useCurrentExchangeRate = (currency: string, date?: string) => {
  return useQuery<ExchangeRate, Error>({
    queryKey: ['exchange-rate', 'current', currency, date],
    queryFn: () => fetchCurrentExchangeRate(currency, date),
    enabled: !!currency,
    staleTime: 300000, // 5 minutes
  });
};

// Fetch exchange rates list
const fetchExchangeRates = async (
  currency: string | null,
  year?: number,
  month?: number
): Promise<ExchangeRateSummary[]> => {
  try {
    let params = `?currency=${currency}`;
    if (year) params += `&year=${year}`;
    if (month) params += `&month=${month}`;

    const response = await handleAPI<ExchangeRateListResponse>(
      `${endpoints.accounting.exchange_rates}${params}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching exchange rates:', error);
    throw error;
  }
};

export const useExchangeRates = (
  currency: string | null,
  year?: number,
  month?: number
) => {
  return useQuery<ExchangeRateSummary[], Error>({
    queryKey: ['exchange-rates', currency, year, month],
    queryFn: () => fetchExchangeRates(currency, year, month),
    enabled: !!currency,
    staleTime: 300000, // 5 minutes
  });
};

/**
 * ==========================
 * 📌 Chart of Accounts Hook
 * ==========================
 */

const fetchChartOfAccounts = async (
  filters: Filters
): Promise<ChartOfAccount[]> => {
  try {
    const queryString = buildQueryParamsNoPage(filters);

    const response = await handleAPI<ChartOfAccountsResponse>(
      `${endpoints.accounting.chart_of_accounts}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching chart of accounts:', error);
    throw error;
  }
};

export const useChartOfAccounts = (
  filters: Filters = {},
  refreshKey: number = 0
) => {
  return useQuery<ChartOfAccount[], Error>({
    queryKey: ['chart-of-accounts', filters, refreshKey],
    queryFn: () => fetchChartOfAccounts(filters),
    staleTime: 3600000,
  });
};

/**
 * ==========================
 * 📌 Reports Hooks
 * ==========================
 */

// General Ledger Report
const fetchGeneralLedger = async (
  accountCode: string,
  from: string,
  to: string
): Promise<GeneralLedgerData> => {
  try {
    const response = await handleAPI<GeneralLedgerResponse>(
      `${endpoints.accounting.report_general_ledger}?account_code=${accountCode}&from=${from}&to=${to}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching general ledger:', error);
    throw error;
  }
};

export const useGeneralLedger = (
  accountCode: string,
  from: string,
  to: string
) => {
  return useQuery<GeneralLedgerData, Error>({
    queryKey: ['report', 'general-ledger', accountCode, from, to],
    queryFn: () => fetchGeneralLedger(accountCode, from, to),
    enabled: !!accountCode && !!from && !!to,
    staleTime: 60000,
  });
};

// Trial Balance Report
const fetchTrialBalance = async (
  from: string,
  to: string
): Promise<TrialBalanceData> => {
  try {
    const response = await handleAPI<TrialBalanceResponse>(
      `${endpoints.accounting.report_trial_balance}?from=${from}&to=${to}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching trial balance:', error);
    throw error;
  }
};

export const useTrialBalance = (from: string, to: string) => {
  return useQuery<TrialBalanceData, Error>({
    queryKey: ['report', 'trial-balance', from, to],
    queryFn: () => fetchTrialBalance(from, to),
    enabled: !!from && !!to,
    staleTime: 60000,
  });
};

// Revenue Report
const fetchRevenueReport = async (
  from: string,
  to: string
): Promise<RevenueReportData> => {
  try {
    const response = await handleAPI<RevenueReportResponse>(
      `${endpoints.accounting.report_revenue}?from=${from}&to=${to}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching revenue report:', error);
    throw error;
  }
};

export const useRevenueReport = (from: string, to: string) => {
  return useQuery<RevenueReportData, Error>({
    queryKey: ['report', 'revenue', from, to],
    queryFn: () => fetchRevenueReport(from, to),
    enabled: !!from && !!to,
    staleTime: 60000,
  });
};

// Receivable Aging Report
const fetchReceivableAging = async (
  asOfDate: string
): Promise<ReceivableAgingData> => {
  try {
    const response = await handleAPI<ReceivableAgingResponse>(
      `${endpoints.accounting.report_receivable_aging}?as_of_date=${asOfDate}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching receivable aging:', error);
    throw error;
  }
};

export const useReceivableAging = (asOfDate: string) => {
  return useQuery<ReceivableAgingData, Error>({
    queryKey: ['report', 'receivable-aging', asOfDate],
    queryFn: () => fetchReceivableAging(asOfDate),
    enabled: !!asOfDate,
    staleTime: 60000,
  });
};

// Journal Stats Report
const fetchJournalStats = async (
  from: string,
  to: string
): Promise<JournalStatsData> => {
  try {
    const response = await handleAPI<JournalStatsResponse>(
      `${endpoints.accounting.report_journal_stats}?from=${from}&to=${to}`,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching journal stats:', error);
    throw error;
  }
};

export const useJournalStats = (from: string, to: string) => {
  return useQuery<JournalStatsData, Error>({
    queryKey: ['report', 'journal-stats', from, to],
    queryFn: () => fetchJournalStats(from, to),
    enabled: !!from && !!to,
    staleTime: 60000,
  });
};
