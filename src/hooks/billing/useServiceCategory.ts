import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters, PaginatedData } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  ServiceCategory,
  CreateServiceCategoryRequest,
  UpdateServiceCategoryRequest,
  ServiceCategoryResponse,
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
  // Case 1: resData is directly an Array
  if (Array.isArray(resData)) {
    items = resData;
  }
  // Case 2: resData is { code: 0, data: [...], ... } or { code: 0, data: { results: [...] } }
  else if (resData.data !== undefined) {
    if (Array.isArray(resData.data)) {
      items = resData.data;
    } else if (resData.data && Array.isArray(resData.data.results)) {
      items = resData.data.results;
    } else if (Array.isArray(resData.results)) {
      items = resData.results;
    }
  }
  // Case 3: resData is { results: [...] }
  else if (Array.isArray(resData.results)) {
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
 * 📌 Service Category Hooks
 * ==========================
 */

type ServiceCategoriesData = PaginatedData<ServiceCategory>;

// Fetch service categories list
const fetchServiceCategories = async (
  pageParam = 1,
  filters: Filters
): Promise<ServiceCategoriesData> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI(
      `${endpoints.service_category.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return extractPaginatedData<ServiceCategory>(response.data);
  } catch (error) {
    logError('Error fetching service categories:', error);
    throw error;
  }
};

export const useServiceCategories = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<ServiceCategoriesData, Error>({
    queryKey: ['service_categories', 'list', page, filters, refreshKey],
    queryFn: () => fetchServiceCategories(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch service category detail
const fetchServiceCategoryDetail = async (
  id: string
): Promise<ServiceCategory> => {
  try {
    const response = await handleAPI<ServiceCategoryResponse>(
      endpoints.service_category.detail(id),
      'GET'
    );
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData[0] : rawData;
  } catch (error) {
    logError('Error fetching service category detail:', error);
    throw error;
  }
};

export const useServiceCategoryDetail = (id: string, refreshKey: number) => {
  return useQuery<ServiceCategory, Error>({
    queryKey: ['service_category', 'detail', id, refreshKey],
    queryFn: () => fetchServiceCategoryDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch service category by code
const fetchServiceCategoryByCode = async (
  code: string
): Promise<ServiceCategory> => {
  try {
    const response = await handleAPI<ServiceCategoryResponse>(
      endpoints.service_category.code(code),
      'GET'
    );
    const rawData = response.data?.data || response.data;
    return Array.isArray(rawData) ? rawData[0] : rawData;
  } catch (error) {
    logError('Error fetching service category by code:', error);
    throw error;
  }
};

export const useServiceCategoryByCode = (code: string, refreshKey: number) => {
  return useQuery<ServiceCategory, Error>({
    queryKey: ['service_category', 'code', code, refreshKey],
    queryFn: () => fetchServiceCategoryByCode(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Create service category
const createServiceCategory = async (
  createDto: CreateServiceCategoryRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.service_category.list,
    'POST',
    createDto
  );
  return response;
};

export const useCreateServiceCategory = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    CreateServiceCategoryRequest,
    { previousData: [any, any][] }
  >({
    mutationFn: async (createDto: CreateServiceCategoryRequest) => {
      return createServiceCategory(createDto);
    },
    onMutate: async (newCategory) => {
      await queryClient.cancelQueries({
        queryKey: ['service_categories', 'list'],
      });

      const previousData = queryClient.getQueriesData<ServiceCategoriesData>({
        queryKey: ['service_categories', 'list'],
      });

      queryClient.setQueriesData<ServiceCategoriesData>(
        { queryKey: ['service_categories', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const tempCategory = {
            id: `temp-${Date.now()}`,
            ...newCategory,
            sort_order: newCategory.sort_order || 0,
            is_active: newCategory.is_active !== false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            results: [tempCategory, ...oldResults],
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
      queryClient.setQueriesData<ServiceCategoriesData>(
        { queryKey: ['service_categories', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const rawCreated = response.data?.data || response.data || response;
          const newCategory = Array.isArray(rawCreated) ? rawCreated[0] : rawCreated;

          return {
            ...oldData,
            results: oldResults.map((category: any) =>
              category.isPending ? newCategory : category
            ),
          };
        }
      );

      handleSuccess(response, 'Service category created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['service_categories', 'list'],
        });
      }, 1000);
    },
    onError: (error, _newCategory, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// Update service category
const updateServiceCategory = async (
  id: string,
  updateDto: UpdateServiceCategoryRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.service_category.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateServiceCategory = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    UpdateServiceCategoryRequest,
    { previousData: [any, any][]; previousDetail: any }
  >({
    mutationFn: async (updateDto: UpdateServiceCategoryRequest) => {
      return updateServiceCategory(id, updateDto);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({
        queryKey: ['service_categories', 'list'],
      });
      await queryClient.cancelQueries({
        queryKey: ['service_category', 'detail', id],
      });

      const previousData = queryClient.getQueriesData<ServiceCategoriesData>({
        queryKey: ['service_categories', 'list'],
      });
      const previousDetail = queryClient.getQueryData([
        'service_category',
        'detail',
        id,
      ]);

      queryClient.setQueriesData<ServiceCategoriesData>(
        { queryKey: ['service_categories', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          return {
            ...oldData,
            results: oldResults.map((category: any) =>
              category.id === id
                ? { ...category, ...updateData, isUpdating: true }
                : category
            ),
          };
        }
      );

      return { previousData, previousDetail };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<ServiceCategoriesData>(
        { queryKey: ['service_categories', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          const rawUpdated = response.data?.data || response.data || response;
          const updatedCategory = Array.isArray(rawUpdated) ? rawUpdated[0] : rawUpdated;

          return {
            ...oldData,
            results: oldResults.map((category: any) =>
              category.id === id
                ? { ...updatedCategory, isUpdating: false }
                : category
            ),
          };
        }
      );

      queryClient.setQueryData(['service_category', 'detail', id], response);

      handleSuccess(response, 'Service category updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['service_categories', 'list'],
        });
        queryClient.invalidateQueries({
          queryKey: ['service_category', 'detail', id],
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
          ['service_category', 'detail', id],
          context.previousDetail
        );
      }
      handleError(error);
    },
  });
};

// Delete service category
const deleteServiceCategory = async (id: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.service_category.detail(id),
    'DELETE'
  );
  return response;
};

export const useDeleteServiceCategory = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteServiceCategory(id);
    },
    onSuccess: async (response: any, id) => {
      queryClient.setQueriesData<ServiceCategoriesData>(
        { queryKey: ['service_categories', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          const oldResults = Array.isArray(oldData.results) ? oldData.results : [];

          return {
            results: oldResults.filter(
              (category: any) => category.id !== id
            ),
            pagination: {
              ...oldData.pagination,
              total_records: Math.max(0, (oldData.pagination?.total_records || oldResults.length) - 1),
            },
          };
        }
      );

      handleSuccess(response, 'Service category deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['service_categories', 'list'],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
