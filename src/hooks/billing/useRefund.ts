import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchRefundsResponse,
  RefundResponse,
  CreateRefundDTO,
  UpdateRefundStatusDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Refund Hooks
 * ==========================
 */

// Fetch refunds list
const fetchRefunds = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchRefundsResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchRefundsResponse>(
      `${endpoints.refunds.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching refunds:', error);
    throw error;
  }
};

export const useRefunds = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchRefundsResponse, Error>({
    queryKey: ['refunds', 'list', page, filters, refreshKey],
    queryFn: () => fetchRefunds(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch refund detail
const fetchRefundDetail = async (id: string): Promise<RefundResponse> => {
  try {
    const response = await handleAPI<RefundResponse>(endpoints.refunds.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching refund detail:', error);
    throw error;
  }
};

export const useRefundDetail = (id: string, refreshKey: number) => {
  return useQuery<RefundResponse, Error>({
    queryKey: ['refund', 'detail', id, refreshKey],
    queryFn: () => fetchRefundDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create refund
const createRefund = async (createDto: CreateRefundDTO): Promise<any> => {
  const response = await handleAPI(endpoints.refunds.list, 'POST', createDto);
  return response;
};

export const useCreateRefund = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateRefundDTO>({
    mutationFn: async (createDto: CreateRefundDTO) => {
      return createRefund(createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Refund created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['refunds', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['billing', 'records'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update refund status
const updateRefundStatus = async (
  id: string,
  updateDto: UpdateRefundStatusDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.refunds.status(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateRefundStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateRefundStatusDTO>({
    mutationFn: async (updateDto: UpdateRefundStatusDTO) => {
      return updateRefundStatus(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Refund status updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['refunds', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['refund', 'detail', id] });
        queryClient.invalidateQueries({ queryKey: ['billing', 'records'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete refund
const deleteRefund = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.refunds.detail(id), 'DELETE');
  return response;
};

export const useDeleteRefund = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteRefund(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Refund deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['refunds', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
