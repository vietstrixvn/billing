import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters, PaginatedData } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  ServiceItem,
  CreateServiceItemRequest,
  UpdateServiceItemRequest,
  ServiceItemResponse,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * Helper to normalize response data into standard PaginatedData format
 */
const extractPaginatedData = <T>(resData: any): PaginatedData<T> => {
  if (!resData) {
    return {
      results: [],
      pagination: {
        current_page: 1,
        page_size: 10,
        total_pages: 1,
        total_records: 0,
        has_next: false,
        has_prev: false,
      },
    };
  }

  let items: T[] = [];
  if (Array.isArray(resData)) {
    items = resData;
  } else if (resData.data !== undefined) {
    if (Array.isArray(resData.data)) {
      items = resData.data;
    } else if (resData.data && Array.isArray(resData.data.results)) {
      items = resData.data.results;
    } else if (Array.isArray(resData.results)) {
      items = resData.results;
    }
  } else if (Array.isArray(resData.results)) {
    items = resData.results;
  }

  const rawPagination = resData.pagination || (resData.data && !Array.isArray(resData.data) ? resData.data.pagination : null);
  const pagination = rawPagination || {
    current_page: 1,
    page_size: items.length || 10,
    total_pages: 1,
    total_records: items.length,
    has_next: false,
    has_prev: false,
  };

  return {
    results: items,
    pagination,
  };
};

/**
 * ==========================
 * 📌 Service Item Hooks
 * ==========================
 */

type ServiceItemsData = PaginatedData<ServiceItem>;

// Fetch service items list
const fetchServiceItems = async (
  pageParam = 1,
  filters: Filters
): Promise<ServiceItemsData> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI(
      `${endpoints.service_item.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return extractPaginatedData<ServiceItem>(response.data);
  } catch (error) {
    logError('Error fetching service items:', error);
    throw error;
  }
};

export const useServiceItems = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<ServiceItemsData, Error>({
    queryKey: ['service_items', 'list', page, filters, refreshKey],
    queryFn: () => fetchServiceItems(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch service item detail
const fetchServiceItemDetail = async (id: string): Promise<ServiceItem> => {
  try {
    const response = await handleAPI<ServiceItemResponse>(
      endpoints.service_item.detail(id),
      'GET'
    );
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData[0] : rawData;
  } catch (error) {
    logError('Error fetching service item detail:', error);
    throw error;
  }
};

export const useServiceItemDetail = (id: string, refreshKey: number) => {
  return useQuery<ServiceItem, Error>({
    queryKey: ['service_item', 'detail', id, refreshKey],
    queryFn: () => fetchServiceItemDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

/** GET service item with `?include_prices=true` (shared by hook + invoice forms). */
export const fetchServiceItemDetailWithPrices = async (
  id: string
): Promise<ServiceItem> => {
  try {
    const response = await handleAPI<ServiceItemResponse>(
      `${endpoints.service_item.detail(id)}?include_prices=true`,
      'GET'
    );
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData[0] : rawData;
  } catch (error) {
    logError('Error fetching service item detail with prices:', error);
    throw error;
  }
};

export const useServiceItemDetailWithPrices = (
  id: string,
  refreshKey: number
) => {
  return useQuery<ServiceItem, Error>({
    queryKey: ['service_item', 'detail_with_prices', id, refreshKey],
    queryFn: () => fetchServiceItemDetailWithPrices(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch service item by code
const fetchServiceItemByCode = async (code: string): Promise<ServiceItem> => {
  try {
    const response = await handleAPI<ServiceItemResponse>(
      endpoints.service_item.code(code),
      'GET'
    );
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData[0] : rawData;
  } catch (error) {
    logError('Error fetching service item by code:', error);
    throw error;
  }
};

export const useServiceItemByCode = (code: string, refreshKey: number) => {
  return useQuery<ServiceItem, Error>({
    queryKey: ['service_item', 'code', code, refreshKey],
    queryFn: () => fetchServiceItemByCode(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Create service item
const createServiceItem = async (
  createDto: CreateServiceItemRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.service_item.list,
    'POST',
    createDto
  );
  return response;
};

export const useCreateServiceItem = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    CreateServiceItemRequest,
    { previousData: [any, any][] }
  >({
    mutationFn: async (createDto: CreateServiceItemRequest) => {
      return createServiceItem(createDto);
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey: ['service_items', 'list'] });

      const previousData = queryClient.getQueriesData<ServiceItemsData>({
        queryKey: ['service_items', 'list'],
      });

      queryClient.setQueriesData<ServiceItemsData>(
        { queryKey: ['service_items', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const tempItem = {
            id: `temp-${Date.now()}`,
            ...newItem,
            category_id: newItem.category_id,
            name: newItem.name,
            code: newItem.code,
            description: newItem.description,
            unit: newItem.unit,
            is_metered: newItem.is_metered || false,
            is_active: newItem.is_active !== false,
            sort_order: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            results: [tempItem, ...oldResults],
            pagination: {
              ...oldData.pagination,
              total_records: (oldData.pagination?.total_records || oldResults.length) + 1,
            },
          };
        }
      );

      return { previousData };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<ServiceItemsData>(
        { queryKey: ['service_items', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const rawItem = response.data?.data || response.data || response;
          const newItem = Array.isArray(rawItem) ? rawItem[0] : rawItem;

          return {
            ...oldData,
            results: oldResults.map((item: any) =>
              item.isPending ? newItem : item
            ),
          };
        }
      );

      handleSuccess(response, 'Service item created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['service_items', 'list'] });
      }, 1000);
    },
    onError: (error, _newItem, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// Update service item
const updateServiceItem = async (
  id: string,
  updateDto: UpdateServiceItemRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.service_item.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateServiceItem = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    UpdateServiceItemRequest,
    { previousData: [any, any][]; previousDetail: any }
  >({
    mutationFn: async (updateDto: UpdateServiceItemRequest) => {
      return updateServiceItem(id, updateDto);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['service_items', 'list'] });
      await queryClient.cancelQueries({
        queryKey: ['service_item', 'detail', id],
      });

      const previousData = queryClient.getQueriesData<ServiceItemsData>({
        queryKey: ['service_items', 'list'],
      });
      const previousDetail = queryClient.getQueryData([
        'service_item',
        'detail',
        id,
      ]);

      queryClient.setQueriesData<ServiceItemsData>(
        { queryKey: ['service_items', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          return {
            ...oldData,
            results: oldResults.map((item: any) =>
              item.id === id
                ? { ...item, ...updateData, isUpdating: true }
                : item
            ),
          };
        }
      );

      return { previousData, previousDetail };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<ServiceItemsData>(
        { queryKey: ['service_items', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const rawItem = response.data?.data || response.data || response;
          const updatedItem = Array.isArray(rawItem) ? rawItem[0] : rawItem;

          return {
            ...oldData,
            results: oldResults.map((item: any) =>
              item.id === id ? { ...updatedItem, isUpdating: false } : item
            ),
          };
        }
      );

      queryClient.setQueryData(['service_item', 'detail', id], response);

      handleSuccess(response, 'Service item updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['service_items', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['service_item', 'detail', id],
        });
      }, 1000);
    },
    onError: (error, _updateData, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          ['service_item', 'detail', id],
          context.previousDetail
        );
      }
      handleError(error);
    },
  });
};

// Delete service item
const deleteServiceItem = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.service_item.detail(id), 'DELETE');
  return response;
};

export const useDeleteServiceItem = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteServiceItem(id);
    },
    onSuccess: async (response: any, id) => {
      queryClient.setQueriesData<ServiceItemsData>(
        { queryKey: ['service_items', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          return {
            results: oldResults.filter((item: any) => item.id !== id),
            pagination: {
              ...oldData.pagination,
              total_records: Math.max(0, (oldData.pagination?.total_records || oldResults.length) - 1),
            },
          };
        }
      );

      handleSuccess(response, 'Service item deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['service_items', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
