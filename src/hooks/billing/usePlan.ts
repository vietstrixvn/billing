import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchPlanResponse,
  PlanResponse,
  CreatePlanDTO,
  UpdatePlanDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Plan Hooks
 * ==========================
 */

// Fetch plans list
const fetchPlans = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchPlanResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchPlanResponse>(
      `${endpoints.plan.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching plans:', error);
    throw error;
  }
};

export const usePlans = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchPlanResponse, Error>({
    queryKey: ['plans', 'list', page, filters, refreshKey],
    queryFn: () => fetchPlans(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch plan detail
const fetchPlanDetail = async (id: string): Promise<PlanResponse> => {
  try {
    const response = await handleAPI<PlanResponse>(endpoints.plan.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching plan detail:', error);
    throw error;
  }
};

export const usePlanDetail = (id: string, refreshKey: number) => {
  return useQuery<PlanResponse, Error>({
    queryKey: ['plan', 'detail', id, refreshKey],
    queryFn: () => fetchPlanDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch plan by code
const fetchPlanByCode = async (code: string): Promise<PlanResponse> => {
  try {
    const response = await handleAPI<PlanResponse>(endpoints.plan.code(code), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching plan by code:', error);
    throw error;
  }
};

export const usePlanByCode = (code: string, refreshKey: number) => {
  return useQuery<PlanResponse, Error>({
    queryKey: ['plan', 'code', code, refreshKey],
    queryFn: () => fetchPlanByCode(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Create plan
const createPlan = async (createDto: CreatePlanDTO): Promise<any> => {
  const response = await handleAPI(endpoints.plan.list, 'POST', createDto);
  return response;
};

export const useCreatePlan = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreatePlanDTO, { previousData: [any, any][] }>(
    {
      mutationFn: async (createDto: CreatePlanDTO) => {
        return createPlan(createDto);
      },
      onMutate: async (newPlan) => {
        await queryClient.cancelQueries({ queryKey: ['plans', 'list'] });

        const previousData = queryClient.getQueriesData<FetchPlanResponse>({
          queryKey: ['plans', 'list'],
        });

        queryClient.setQueriesData<FetchPlanResponse>(
          { queryKey: ['plans', 'list'] },
          (oldData) => {
            if (!oldData) return oldData;

            const tempPlan = {
              id: `temp-${Date.now()}`,
              ...newPlan,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              isPending: true,
            } as any;

            return {
              ...oldData,
              results: [tempPlan, ...oldData.data.results],
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
        queryClient.setQueriesData<FetchPlanResponse>(
          { queryKey: ['plans', 'list'] },
          (oldData) => {
            if (!oldData) return oldData;

            const newPlan = response.data || response;
            return {
              ...oldData,
              results: oldData.data.results.map((plan) =>
                (plan as any).isPending ? newPlan : plan
              ),
            };
          }
        );

        handleSuccess(response, 'Plan created successfully');

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['plans', 'list'] });
        }, 1000);
      },
      onError: (error, newPlan, context) => {
        if (context?.previousData) {
          context.previousData.forEach(([queryKey, data]: [any, any]) => {
            queryClient.setQueryData(queryKey, data);
          });
        }
        handleError(error);
      },
    }
  );
};

// Update plan
const updatePlan = async (
  id: string,
  updateDto: UpdatePlanDTO
): Promise<any> => {
  const response = await handleAPI(endpoints.plan.detail(id), 'PUT', updateDto);
  return response;
};

export const useUpdatePlan = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    UpdatePlanDTO,
    { previousData: [any, any][]; previousDetail: any }
  >({
    mutationFn: async (updateDto: UpdatePlanDTO) => {
      return updatePlan(id, updateDto);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['plans', 'list'] });
      await queryClient.cancelQueries({ queryKey: ['plan', 'detail', id] });

      const previousData = queryClient.getQueriesData<FetchPlanResponse>({
        queryKey: ['plans', 'list'],
      });
      const previousDetail = queryClient.getQueryData(['plan', 'detail', id]);

      queryClient.setQueriesData<FetchPlanResponse>(
        { queryKey: ['plans', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.data.results.map((plan) =>
              plan.id === id
                ? ({ ...plan, ...updateData, isUpdating: true } as any)
                : plan
            ),
          };
        }
      );

      return { previousData, previousDetail };
    },
    onSuccess: async (response: any) => {
      queryClient.setQueriesData<FetchPlanResponse>(
        { queryKey: ['plans', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const updatedPlan = response.data || response;
          return {
            ...oldData,
            results: oldData.data.results.map((plan) =>
              plan.id === id ? { ...updatedPlan, isUpdating: false } : plan
            ),
          };
        }
      );

      queryClient.setQueryData(['plan', 'detail', id], response);

      handleSuccess(response, 'Plan updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['plans', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['plan', 'detail', id] });
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
          ['plan', 'detail', id],
          context.previousDetail
        );
      }
      handleError(error);
    },
  });
};

// Delete plan
const deletePlan = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.plan.detail(id), 'DELETE');
  return response;
};

export const useDeletePlan = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deletePlan(id);
    },
    onSuccess: async (response: any, id) => {
      queryClient.setQueriesData<FetchPlanResponse>(
        { queryKey: ['plans', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.data.results.filter((plan) => plan.id !== id),
            pagination: oldData.data.pagination
              ? {
                ...oldData.data.pagination,
                total_records: oldData.data.pagination.total_records - 1,
              }
              : oldData.data.pagination,
          };
        }
      );

      handleSuccess(response, 'Plan deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['plans', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
