import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type {
  PlanIncludedItem,
  AddItemToPlanRequest,
  UpdatePlanIncludedItemRequest,
  SetPlanIncludedItemsRequest,
  ApiResponse,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { logError } from '@/utils';

/**
 * ==========================
 * 📌 Plan Included Item Hooks
 * ==========================
 */

type PlanIncludedItemsResponse = ApiResponse<PlanIncludedItem[]>;
type PlanIncludedItemResponse = ApiResponse<PlanIncludedItem>;

// Fetch plan included items by plan ID
const fetchPlanIncludedItems = async (
  planId: string,
  includePrices = false
): Promise<PlanIncludedItemsResponse> => {
  try {
    const url = includePrices
      ? `${endpoints.plan_items.list(planId)}?include_prices=true`
      : endpoints.plan_items.list(planId);
    const response = await handleAPI<PlanIncludedItemsResponse>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching plan included items:', error);
    throw error;
  }
};

export const usePlanIncludedItems = (
  planId: string,
  refreshKey: number,
  includePrices = false
) => {
  return useQuery<PlanIncludedItemsResponse, Error>({
    queryKey: [
      'plan_included_items',
      'list',
      planId,
      includePrices,
      refreshKey,
    ],
    queryFn: () => fetchPlanIncludedItems(planId, includePrices),
    enabled: !!planId,
    staleTime: 30000,
  });
};

// Fetch plan included item detail
const fetchPlanIncludedItemDetail = async (
  id: string
): Promise<PlanIncludedItemResponse> => {
  try {
    const response = await handleAPI(endpoints.plan_items.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching plan included item detail:', error);
    throw error;
  }
};

export const usePlanIncludedItemDetail = (id: string, refreshKey: number) => {
  return useQuery<PlanIncludedItemResponse, Error>({
    queryKey: ['plan_included_item', 'detail', id, refreshKey],
    queryFn: () => fetchPlanIncludedItemDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Add item to plan
const addItemToPlan = async (
  planId: string,
  createDto: AddItemToPlanRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.plan_items.list(planId),
    'POST',
    createDto
  );
  return response;
};

export const useAddItemToPlan = (planId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, AddItemToPlanRequest>({
    mutationFn: async (createDto: AddItemToPlanRequest) => {
      return addItemToPlan(planId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item added to plan successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['plan_included_items', 'list', planId],
        });
        queryClient.invalidateQueries({
          queryKey: ['plan', 'detail', planId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update plan included item
const updatePlanIncludedItem = async (
  id: string,
  updateDto: UpdatePlanIncludedItemRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.plan_items.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdatePlanIncludedItem = (id: string, planId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdatePlanIncludedItemRequest>({
    mutationFn: async (updateDto: UpdatePlanIncludedItemRequest) => {
      return updatePlanIncludedItem(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Plan included item updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['plan_included_items', 'list', planId],
        });
        queryClient.invalidateQueries({
          queryKey: ['plan_included_item', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['plan', 'detail', planId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete plan included item
const deletePlanIncludedItem = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.plan_items.detail(id), 'DELETE');
  return response;
};

export const useDeletePlanIncludedItem = (planId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deletePlanIncludedItem(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item removed from plan successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['plan_included_items', 'list', planId],
        });
        queryClient.invalidateQueries({
          queryKey: ['plan', 'detail', planId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Bulk replace plan included items
const setPlanIncludedItems = async (
  planId: string,
  data: SetPlanIncludedItemsRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.plan_items.list(planId),
    'PUT',
    data
  );
  return response;
};

export const useSetPlanIncludedItems = (planId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, SetPlanIncludedItemsRequest>({
    mutationFn: async (data: SetPlanIncludedItemsRequest) => {
      return setPlanIncludedItems(planId, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Plan items updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['plan_included_items', 'list', planId],
        });
        queryClient.invalidateQueries({
          queryKey: ['plan', 'detail', planId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
