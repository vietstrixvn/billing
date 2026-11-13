import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters, InvoiceItem } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchQuotesResponse,
  QuoteResponse,
  CreateQuoteDTO,
  UpdateQuoteDTO,
  ApiResponse,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import {
  BatchCreateQuoteLineItemsDTO,
  CreateQuoteLineItemDTO,
  RejectQuoteDTO,
  UpdateQuoteLineItemDTO,
  UpdateQuoteStatusDTO,
} from '@/types/billing/dto';

/**
 * ==========================
 * 📌 Quote Hooks
 * ==========================
 */

type QuoteLineItemsResponse = ApiResponse<InvoiceItem[]>;
type QuoteLineItemResponse = ApiResponse<InvoiceItem>;
type QuoteTotalResponse = ApiResponse<{ total: number }>;

// ============================================================================
// QUOTE CRUD
// ============================================================================

// Fetch quotes list
const fetchQuotes = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchQuotesResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchQuotesResponse>(
      `${endpoints.quotes.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching quotes:', error);
    throw error;
  }
};

export const useQuotes = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchQuotesResponse, Error>({
    queryKey: ['quotes', 'list', page, filters, refreshKey],
    queryFn: () => fetchQuotes(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch quote detail
const fetchQuoteDetail = async (
  id: string,
  includeRelations = false
): Promise<QuoteResponse> => {
  try {
    const url = includeRelations
      ? `${endpoints.quotes.detail(id)}?include_relations=true`
      : endpoints.quotes.detail(id);
    const response = await handleAPI<QuoteResponse>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching quote detail:', error);
    throw error;
  }
};

export const useQuoteDetail = (
  id: string,
  refreshKey: number,
  includeRelations = false
) => {
  return useQuery<QuoteResponse, Error>({
    queryKey: ['quote', 'detail', id, includeRelations, refreshKey],
    queryFn: () => fetchQuoteDetail(id, includeRelations),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch quote by number
const fetchQuoteByNumber = async (
  quoteNumber: string
): Promise<QuoteResponse> => {
  try {
    const response = await handleAPI<QuoteResponse>(
      endpoints.quotes.byNumber(quoteNumber),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching quote by number:', error);
    throw error;
  }
};

export const useQuoteByNumber = (quoteNumber: string, refreshKey: number) => {
  return useQuery<QuoteResponse, Error>({
    queryKey: ['quote', 'number', quoteNumber, refreshKey],
    queryFn: () => fetchQuoteByNumber(quoteNumber),
    enabled: !!quoteNumber,
    staleTime: 30000,
  });
};

// Create quote
const createQuote = async (createDto: CreateQuoteDTO): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.list, 'POST', createDto);
  return response;
};

export const useCreateQuote = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateQuoteDTO>({
    mutationFn: async (createDto: CreateQuoteDTO) => {
      return createQuote(createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update quote
const updateQuote = async (
  id: string,
  updateDto: UpdateQuoteDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateQuoteDTO>({
    mutationFn: async (updateDto: UpdateQuoteDTO) => {
      return updateQuote(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update quote status
const updateQuoteStatus = async (
  id: string,
  updateDto: UpdateQuoteStatusDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.status(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateQuoteStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateQuoteStatusDTO>({
    mutationFn: async (updateDto: UpdateQuoteStatusDTO) => {
      return updateQuoteStatus(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote status updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete quote
const deleteQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.detail(id), 'DELETE');
  return response;
};

export const useDeleteQuote = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// ============================================================================
// QUOTE ACTIONS
// ============================================================================

// Send quote
const sendQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.send(id), 'POST');
  return response;
};

export const useSendQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return sendQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote sent successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Approve quote
const approveQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.approve(id), 'POST');
  return response;
};

export const useApproveQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return approveQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote approved successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Reject quote
const rejectQuote = async (
  id: string,
  rejectDto: RejectQuoteDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.reject(id),
    'POST',
    rejectDto
  );
  return response;
};

export const useRejectQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, RejectQuoteDTO>({
    mutationFn: async (rejectDto: RejectQuoteDTO) => {
      return rejectQuote(id, rejectDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote rejected successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Expire quote
const expireQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.expire(id), 'POST');
  return response;
};

export const useExpireQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return expireQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote expired successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Recalculate quote totals
const recalculateQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.quotes.recalculate(id), 'POST');
  return response;
};

export const useRecalculateQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return recalculateQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Quote totals recalculated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', id],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Create subscription from quote
const createSubscriptionFromQuote = async (id: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.createSubscription(id),
    'POST'
  );
  return response;
};

export const useCreateSubscriptionFromQuote = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return createSubscriptionFromQuote(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Subscription created from quote successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['quotes', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['quote', 'detail', id] });
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// ============================================================================
// QUOTE LINE ITEMS
// ============================================================================

// Fetch quote line items
const fetchQuoteLineItems = async (
  quoteId: string,
  ordered = true
): Promise<QuoteLineItemsResponse> => {
  try {
    const url = ordered
      ? `${endpoints.quotes.lineItems(quoteId)}?ordered=true`
      : endpoints.quotes.lineItems(quoteId);
    const response = await handleAPI<QuoteLineItemsResponse>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching quote line items:', error);
    throw error;
  }
};

export const useQuoteLineItems = (
  quoteId: string,
  refreshKey: number,
  ordered = true
) => {
  return useQuery<QuoteLineItemsResponse, Error>({
    queryKey: ['quote_line_items', 'list', quoteId, ordered, refreshKey],
    queryFn: () => fetchQuoteLineItems(quoteId, ordered),
    enabled: !!quoteId,
    staleTime: 30000,
  });
};

// Create quote line item
const createQuoteLineItem = async (
  quoteId: string,
  createDto: CreateQuoteLineItemDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.lineItems(quoteId),
    'POST',
    createDto
  );
  return response;
};

export const useCreateQuoteLineItem = (quoteId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateQuoteLineItemDTO>({
    mutationFn: async (createDto: CreateQuoteLineItemDTO) => {
      return createQuoteLineItem(quoteId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Line item added successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', quoteId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote', 'detail', quoteId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Batch create quote line items
const batchCreateQuoteLineItems = async (
  quoteId: string,
  batchDto: BatchCreateQuoteLineItemsDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.batchLineItems(quoteId),
    'POST',
    batchDto
  );
  return response;
};

export const useBatchCreateQuoteLineItems = (quoteId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, BatchCreateQuoteLineItemsDTO>({
    mutationFn: async (batchDto: BatchCreateQuoteLineItemsDTO) => {
      return batchCreateQuoteLineItems(quoteId, batchDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Line items added successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', quoteId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote', 'detail', quoteId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Fetch quote line item detail
const fetchQuoteLineItemDetail = async (
  id: string,
  includeRelations = false
): Promise<QuoteLineItemResponse> => {
  try {
    const url = includeRelations
      ? `${endpoints.quote_line_items.detail(id)}?include_relations=true`
      : endpoints.quote_line_items.detail(id);
    const response = await handleAPI<QuoteLineItemResponse>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching quote line item detail:', error);
    throw error;
  }
};

export const useQuoteLineItemDetail = (
  id: string,
  refreshKey: number,
  includeRelations = false
) => {
  return useQuery<QuoteLineItemResponse, Error>({
    queryKey: ['quote_line_item', 'detail', id, includeRelations, refreshKey],
    queryFn: () => fetchQuoteLineItemDetail(id, includeRelations),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Update quote line item
const updateQuoteLineItem = async (
  id: string,
  updateDto: UpdateQuoteLineItemDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.quote_line_items.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateQuoteLineItem = (id: string, quoteId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateQuoteLineItemDTO>({
    mutationFn: async (updateDto: UpdateQuoteLineItemDTO) => {
      return updateQuoteLineItem(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Line item updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', quoteId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote_line_item', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote', 'detail', quoteId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete quote line item
const deleteQuoteLineItem = async (id: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.quote_line_items.detail(id),
    'DELETE'
  );
  return response;
};

export const useDeleteQuoteLineItem = (quoteId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteQuoteLineItem(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Line item deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', quoteId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote', 'detail', quoteId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete all quote line items
const deleteAllQuoteLineItems = async (quoteId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.quotes.lineItems(quoteId),
    'DELETE'
  );
  return response;
};

export const useDeleteAllQuoteLineItems = (quoteId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return deleteAllQuoteLineItems(quoteId);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'All line items deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['quote_line_items', 'list', quoteId],
        });
        queryClient.invalidateQueries({
          queryKey: ['quote', 'detail', quoteId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Calculate quote total
const calculateQuoteTotal = async (
  quoteId: string
): Promise<QuoteTotalResponse> => {
  try {
    const response = await handleAPI<QuoteTotalResponse>(endpoints.quotes.total(quoteId), 'GET');
    return response.data;
  } catch (error) {
    logError('Error calculating quote total:', error);
    throw error;
  }
};

export const useQuoteTotal = (quoteId: string, refreshKey: number) => {
  return useQuery<QuoteTotalResponse, Error>({
    queryKey: ['quote', 'total', quoteId, refreshKey],
    queryFn: () => calculateQuoteTotal(quoteId),
    enabled: !!quoteId,
    staleTime: 30000,
  });
};

// Alias for batch create - used by forms that set all items at once
export const useSetQuoteLineItems = useBatchCreateQuoteLineItems;
