import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchInvoiceResponse,
  FetchInvoicePeriodResponse,
  InvoiceResponse,
  Invoice,
  InvoicePeriod,
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Invoice Hooks
 * ==========================
 */

// Fetch invoices list
const fetchInvoices = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchInvoiceResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    // handleAPI already returns response.data (the full ApiResponse)
    const response = await handleAPI<FetchInvoiceResponse>(
      `${endpoints.invoices.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching invoices:', error);
    throw error;
  }
};

export const useInvoices = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchInvoiceResponse, Error>({
    queryKey: ['invoices', 'list', page, filters, refreshKey],
    queryFn: () => fetchInvoices(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch invoice detail
const fetchInvoiceDetail = async (id: string): Promise<Invoice> => {
  try {
    const response = await handleAPI<InvoiceResponse>(
      endpoints.invoices.detail(id),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching invoice detail:', error);
    throw error;
  }
};

export const useInvoiceDetail = (id: string, refreshKey: number) => {
  return useQuery<Invoice, Error>({
    queryKey: ['invoice', 'detail', id, refreshKey],
    queryFn: () => fetchInvoiceDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create invoice
const createInvoice = async (createDto: CreateInvoiceDTO): Promise<any> => {
  const response = await handleAPI(endpoints.invoices.list, 'POST', createDto);
  return response;
};

export const useCreateInvoice = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    CreateInvoiceDTO,
    { previousData: [any, any][] }
  >({
    mutationFn: async (createDto: CreateInvoiceDTO) => {
      return createInvoice(createDto);
    },
    onMutate: async (newInvoice) => {
      await queryClient.cancelQueries({ queryKey: ['invoices', 'list'] });

      const previousData = queryClient.getQueriesData<FetchInvoiceResponse>({
        queryKey: ['invoices', 'list'],
      });

      queryClient.setQueriesData<FetchInvoiceResponse>(
        { queryKey: ['invoices', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const tempInvoice = {
            id: `temp-${Date.now()}`,
            ...newInvoice,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            ...oldData,
            results: [tempInvoice, ...oldData.data.results],
            pagination: oldData.data.pagination
              ? {
                  ...oldData.data.pagination,
                  total_records: oldData.data.pagination.total_records + 1,
                }
              : oldData.data.pagination,
          };
        }
      );

      return { previousData };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<FetchInvoiceResponse>(
        { queryKey: ['invoices', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const newInvoice = response.data || response;
          return {
            ...oldData,
            results: oldData.data.results.map((invoice) =>
              (invoice as any).isPending ? newInvoice : invoice
            ),
          };
        }
      );

      handleSuccess(response, 'Invoice created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      }, 1000);
    },
    onError: (error, newInvoice, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// Update invoice
const updateInvoice = async (
  id: string,
  updateDto: UpdateInvoiceDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.invoices.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateInvoice = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    UpdateInvoiceDTO,
    { previousData: [any, any][]; previousDetail: any }
  >({
    mutationFn: async (updateDto: UpdateInvoiceDTO) => {
      return updateInvoice(id, updateDto);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['invoices', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['invoice', 'detail', id] });

      const previousData = queryClient.getQueriesData<FetchInvoiceResponse>({
        queryKey: ['invoices', 'list'],
      });
      const previousDetail = queryClient.getQueryData([
        'invoice',
        'detail',
        id,
      ]);

      queryClient.setQueriesData<FetchInvoiceResponse>(
        { queryKey: ['invoices', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.data.results.map((invoice) =>
              invoice.id === id
                ? ({ ...invoice, ...updateData, isUpdating: true } as any)
                : invoice
            ),
          };
        }
      );

      return { previousData, previousDetail };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<FetchInvoiceResponse>(
        { queryKey: ['invoices', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedInvoice = response.data || response;
          return {
            ...oldData,
            results: oldData.data.results.map((invoice) =>
              invoice.id === id
                ? { ...updatedInvoice, isUpdating: false }
                : invoice
            ),
          };
        }
      );

      queryClient.setQueryData(['invoice', 'detail', id], response);

      handleSuccess(response, 'Invoice updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['invoice', 'detail', id] });
      }, 1000);
    },
    onError: (error, updateData, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['invoice', 'detail', id],
          context.previousDetail
        );
      }
      handleError(error);
    },
  });
};

// Delete invoice
const deleteInvoice = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.invoices.detail(id), 'DELETE');
  return response;
};

export const useDeleteInvoice = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteInvoice(id);
    },
    onSuccess: async (response: any, id) => {
      queryClient.setQueriesData<FetchInvoiceResponse>(
        { queryKey: ['invoices', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.data.results.filter(
              (invoice) => invoice.id !== id
            ),
            pagination: oldData.data.pagination
              ? {
                  ...oldData.data.pagination,
                  total_records: oldData.data.pagination.total_records - 1,
                }
              : oldData.data.pagination,
          };
        }
      );

      handleSuccess(response, 'Invoice deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Fetch invoices by period
const fetchInvoicePeriod = async (
  filters: Filters
): Promise<InvoicePeriod[]> => {
  try {
    const queryString = buildQueryParams(filters, 1);
    const response = await handleAPI<FetchInvoicePeriodResponse>(
      `${endpoints.invoices.period}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data.data || [];
  } catch (error) {
    logError('Error fetching invoice period:', error);
    throw error;
  }
};

export const useInvoicePeriod = (filters: Filters = {}) => {
  return useQuery<InvoicePeriod[], Error>({
    queryKey: ['invoices', 'period', filters],
    queryFn: () => fetchInvoicePeriod(filters),
    staleTime: 60000,
  });
};
