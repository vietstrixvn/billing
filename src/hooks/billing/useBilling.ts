import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchBillingRecordsResponse,
  BilldingRecordResponse,
  CreateBillingRecordDTO,
  UpdateBillingRecordStatusDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Billing Records Hooks
 * ==========================
 */

// Fetch billing records list
const fetchBillingRecords = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchBillingRecordsResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchBillingRecordsResponse>(
      `${endpoints.billing.records}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching billing records:', error);
    throw error;
  }
};

export const useBillingRecords = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchBillingRecordsResponse, Error>({
    queryKey: ['billing_records', 'list', page, filters, refreshKey],
    queryFn: () => fetchBillingRecords(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch billing record detail
const fetchBillingRecordDetail = async (
  id: string
): Promise<BilldingRecordResponse> => {
  try {
    const response = await handleAPI<BilldingRecordResponse>(endpoints.billing.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching billing record detail:', error);
    throw error;
  }
};

export const useBillingRecordDetail = (id: string, refreshKey: number) => {
  return useQuery<BilldingRecordResponse, Error>({
    queryKey: ['billing_record', 'detail', id, refreshKey],
    queryFn: () => fetchBillingRecordDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create billing record
const createBillingRecord = async (
  createDto: CreateBillingRecordDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.billing.records,
    'POST',
    createDto
  );
  return response;
};

export const useCreateBillingRecord = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    CreateBillingRecordDTO,
    { previousData: [any, any][] }
  >({
    mutationFn: async (createDto: CreateBillingRecordDTO) => {
      return createBillingRecord(createDto);
    },
    onMutate: async (newRecord) => {
      await queryClient.cancelQueries({
        queryKey: ['billing_records', 'list'],
      });

      const previousData =
        queryClient.getQueriesData<FetchBillingRecordsResponse>({
          queryKey: ['billing_records', 'list'],
        });

      queryClient.setQueriesData<FetchBillingRecordsResponse>(
        { queryKey: ['billing_records', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const tempRecord = {
            id: `temp-${Date.now()}`,
            ...newRecord,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            ...oldData,
            results: [tempRecord, ...oldData.data.results],
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
      queryClient.setQueriesData<FetchBillingRecordsResponse>(
        { queryKey: ['billing_records', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const newRecord = response.data || response;
          return {
            ...oldData,
            results: oldData.data.results.map((record) =>
              (record as any).isPending ? newRecord : record
            ),
          };
        }
      );

      handleSuccess(response, 'Billing record created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['billing_records', 'list'],
        });
      }, 1000);
    },
    onError: (error, newRecord, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// Update billing record status
const updateBillingRecordStatus = async (
  id: string,
  updateDto: UpdateBillingRecordStatusDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.billing.status(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateBillingRecordStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateBillingRecordStatusDTO>({
    mutationFn: async (updateDto: UpdateBillingRecordStatusDTO) => {
      return updateBillingRecordStatus(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Billing record status updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['billing_records', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['billing_record', 'detail', id],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
