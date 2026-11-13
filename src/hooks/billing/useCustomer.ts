import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type {
  Filters,
  Customer,
  CreateCustomerDTO,
  UpdateCustomerDTO,
  ApiResponse,
  PaginatedData,
} from '@/types';
import { buildQueryParams, logError } from '@/utils';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Customer Hooks
 * ==========================
 */

// Fetch customers list
const fetchCustomers = async (
  pageParam = 1,
  filters: Filters,
  pageSize = 10
): Promise<any> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const limitParam = `limit=${pageSize}`;
    const url = `${endpoints.customers.list}?${limitParam}${queryString ? `&${queryString}` : ''}`;

    const response = await handleAPI<any>(
      url,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching customers:', error);
    throw error;
  }
};

export const useCustomers = (
  page: number = 1,
  filters: Filters = {},
  refreshKey: number = 0,
  pageSize: number = 10
) => {
  const query = useQuery<any, Error>({
    queryKey: ['customers', 'list', page, filters, refreshKey, pageSize],
    queryFn: () => fetchCustomers(page, filters, pageSize),
    enabled: page > 0,
    staleTime: 60000,
  });

  const rawData = query.data;
  const customers: Customer[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.results)
      ? rawData.data.results
      : Array.isArray(rawData?.results)
        ? rawData.results
        : Array.isArray(rawData)
          ? rawData
          : [];

  const pagination = rawData?.pagination || rawData?.data?.pagination;

  return {
    customers,
    pagination,
    ...query,
  };
};

// Fetch customer detail
const fetchCustomerDetail = async (id: string): Promise<Customer> => {
  try {
    const response = await handleAPI<ApiResponse<Customer>>(
      endpoints.customers.detail(id),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching customer detail:', error);
    throw error;
  }
};

export const useCustomerDetail = (id: string, refreshKey: number = 0) => {
  return useQuery<Customer, Error>({
    queryKey: ['customer', 'detail', id, refreshKey],
    queryFn: () => fetchCustomerDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create customer
const createCustomer = async (dto: CreateCustomerDTO): Promise<Customer> => {
  const response = await handleAPI<any>(
    endpoints.customers.list,
    'POST',
    dto
  );
  return response.data?.data || response.data;
};

export const useCreateCustomer = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<Customer, Error, CreateCustomerDTO>({
    mutationFn: (dto) => createCustomer(dto),
    onSuccess: (data) => {
      handleSuccess(data as any, 'Khách hàng đã được tạo thành công');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Update customer
const updateCustomer = async (
  id: string,
  dto: UpdateCustomerDTO
): Promise<Customer> => {
  const response = await handleAPI<any>(
    endpoints.customers.detail(id),
    'PATCH',
    dto
  );
  return response.data?.data || response.data;
};

export const useUpdateCustomer = (id?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<Customer, Error, { id?: string; dto: UpdateCustomerDTO }>({
    mutationFn: ({ id: customerId, dto }) => {
      const targetId = customerId || id;
      if (!targetId) throw new Error('Customer ID is required for update');
      return updateCustomer(targetId, dto);
    },
    onSuccess: (data, variables) => {
      handleSuccess(data as any, 'Khách hàng đã được cập nhật thành công');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      const targetId = variables.id || id;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['customer', 'detail', targetId] });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Delete customer
const deleteCustomer = async (id: string): Promise<void> => {
  await handleAPI(endpoints.customers.detail(id), 'DELETE');
};

export const useDeleteCustomer = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteCustomer(id),
    onSuccess: (_, id) => {
      handleSuccess(null as any, 'Khách hàng đã được xóa thành công');
      queryClient.invalidateQueries({ queryKey: ['customers', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['customer', 'detail', id] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
