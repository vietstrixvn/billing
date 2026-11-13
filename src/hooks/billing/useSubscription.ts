import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchSubscriptionsResponse,
  FetchSubscriptionLogResponse,
  FetchSubLogResponse,
  SubscriptionResponse,
  CreateSubscriptionDTO,
  ChangePlanDTO,
  UpdateSubscriptionStatusRequest,
  CreateProvisionSubscriptionDTO,
  RenewSubscriptionDTO,
  ProvisionResponse,
  AddonCostResponse,
  BillingLineItem,
  ApiResponse,
  UpdateSubscriptionItemQuantityDTO,
  FinalizeSubscriptionDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Subscription Hooks
 * ==========================
 */

// Fetch subscriptions list
const fetchSubscriptions = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchSubscriptionsResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchSubscriptionsResponse>(
      `${endpoints.subscriptions.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscriptions:', error);
    throw error;
  }
};

export const useSubscriptions = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchSubscriptionsResponse, Error>({
    queryKey: ['subscriptions', 'list', page, filters, refreshKey],
    queryFn: () => fetchSubscriptions(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch subscription detail
const fetchSubscriptionDetail = async (
  id: string
): Promise<SubscriptionResponse> => {
  try {
    const response = await handleAPI<SubscriptionResponse>(endpoints.subscriptions.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching subscription detail:', error);
    throw error;
  }
};

export const useSubscriptionDetail = (id: string, refreshKey: number) => {
  return useQuery<SubscriptionResponse, Error>({
    queryKey: ['subscription', 'detail', id, refreshKey],
    queryFn: () => fetchSubscriptionDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create subscription
const createSubscription = async (
  createDto: CreateSubscriptionDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.list,
    'POST',
    createDto
  );
  return response;
};

export const useCreateSubscription = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    CreateSubscriptionDTO,
    { previousData: [any, any][] }
  >({
    mutationFn: async (createDto: CreateSubscriptionDTO) => {
      return createSubscription(createDto);
    },
    onMutate: async (newSubscription) => {
      await queryClient.cancelQueries({ queryKey: ['subscriptions', 'list'] });

      const previousData =
        queryClient.getQueriesData<FetchSubscriptionsResponse>({
          queryKey: ['subscriptions', 'list'],
        });

      queryClient.setQueriesData<FetchSubscriptionsResponse>(
        { queryKey: ['subscriptions', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const tempSubscription = {
            id: `temp-${Date.now()}`,
            ...newSubscription,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            ...oldData,
            results: [tempSubscription, ...oldData.data.results],
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
      queryClient.setQueriesData<FetchSubscriptionsResponse>(
        { queryKey: ['subscriptions', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const newSubscription = response || response;
          return {
            ...oldData,
            results: oldData.data.results.map((subscription) =>
              (subscription as any).isPending ? newSubscription : subscription
            ),
          };
        }
      );

      handleSuccess(response, 'Subscription created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
      }, 1000);
    },
    onError: (error, newSubscription, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]: [any, any]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// Update subscription status
const updateSubscriptionStatus = async (
  id: string,
  updateDto: UpdateSubscriptionStatusRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.status(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateSubscriptionStatus = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateSubscriptionStatusRequest>({
    mutationFn: async (updateDto: UpdateSubscriptionStatusRequest) => {
      return updateSubscriptionStatus(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Subscription status updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'logs', id],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Extend subscription
const extendSubscription = async (
  id: string,
  data: { days: number; reason?: string }
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.extend(id),
    'PUT',
    data
  );
  return response;
};

export const useExtendSubscription = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, { days: number; reason?: string }>({
    mutationFn: async (data: { days: number; reason?: string }) => {
      return extendSubscription(id, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Subscription extended successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'logs', id],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Change subscription plan
const changeSubscriptionPlan = async (
  id: string,
  data: ChangePlanDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.change_plan(id),
    'PUT',
    data
  );
  return response;
};

export const useChangeSubscriptionPlan = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, ChangePlanDTO>({
    mutationFn: async (data: ChangePlanDTO) => {
      return changeSubscriptionPlan(id, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Subscription plan changed successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'logs', id],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Fetch subscription logs
const fetchSubscriptionLogs = async (
  id: string
): Promise<FetchSubscriptionLogResponse> => {
  try {
    const response = await handleAPI<FetchSubscriptionLogResponse>(endpoints.subscriptions.logs(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching subscription logs:', error);
    throw error;
  }
};

export const useSubscriptionLogs = (id: string, refreshKey: number) => {
  return useQuery<FetchSubscriptionLogResponse, Error>({
    queryKey: ['subscription', 'logs', id, refreshKey],
    queryFn: () => fetchSubscriptionLogs(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch all subscription logs with filters
const fetchAllSubscriptionLogs = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchSubLogResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchSubLogResponse>(
      `${endpoints.subscriptions.sub_log}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching all subscription logs:', error);
    throw error;
  }
};

export const useAllSubscriptionLogs = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchSubLogResponse, Error>({
    queryKey: ['subscription_logs', 'list', page, filters, refreshKey],
    queryFn: () => fetchAllSubscriptionLogs(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Provision subscription (main billing flow)
const provisionSubscription = async (
  data: CreateProvisionSubscriptionDTO
): Promise<ProvisionResponse> => {
  const response = await handleAPI<ProvisionResponse>(
    endpoints.subscriptions.provision,
    'POST',
    data
  );
  return response.data;
};

export const useProvisionSubscription = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<ProvisionResponse, Error, CreateProvisionSubscriptionDTO>(
    {
      mutationFn: provisionSubscription,
      onSuccess: async (response) => {
        handleSuccess(response, 'Subscription provisioned successfully');

        setTimeout(() => {
          queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
          queryClient.invalidateQueries({ queryKey: ['billing', 'records'] });
          queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
        }, 1000);
      },
      onError: (error) => {
        handleError(error);
      },
    }
  );
};

// Renew subscription
const renewSubscription = async (
  id: string,
  data: RenewSubscriptionDTO
): Promise<ProvisionResponse> => {
  const response = await handleAPI<ProvisionResponse>(
    endpoints.subscriptions.renew(id),
    'POST',
    data
  );
  return response.data;
};

export const useRenewSubscription = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<ProvisionResponse, Error, RenewSubscriptionDTO>({
    mutationFn: async (data) => renewSubscription(id, data),
    onSuccess: async (response) => {
      handleSuccess(response, 'Subscription renewed successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['subscription', 'logs', id],
        });
        queryClient.invalidateQueries({ queryKey: ['billing', 'records'] });
        queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Total addon cost for a subscription
const fetchSubscriptionAddonsCost = async (
  subscriptionId: string
): Promise<AddonCostResponse> => {
  try {
    const response = await handleAPI<AddonCostResponse>(
      endpoints.subscriptions.addon_cost(subscriptionId),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscription addons cost:', error);
    throw error;
  }
};

export const useSubscriptionAddonsCost = (
  subscriptionId: string,
  refreshKey: number
) => {
  return useQuery<AddonCostResponse, Error>({
    queryKey: ['subscription', 'addons', 'cost', subscriptionId, refreshKey],
    queryFn: () => fetchSubscriptionAddonsCost(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 30000,
  });
};

// Delete subscription
const deleteSubscription = async (id: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.detail(id),
    'DELETE'
  );
  return response;
};

export const useDeleteSubscription = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteSubscription(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Subscription deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Fetch subscription items
const fetchSubscriptionItems = async (
  subscriptionId: string
): Promise<ApiResponse<BillingLineItem[]>> => {
  try {
    const response = await handleAPI<ApiResponse<BillingLineItem[]>>(
      endpoints.subscriptions.items(subscriptionId),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscription items:', error);
    throw error;
  }
};

export const useSubscriptionItems = (
  subscriptionId: string,
  refreshKey?: number
) => {
  return useQuery<ApiResponse<BillingLineItem[]>, Error>({
    queryKey: ['subscription', 'items', subscriptionId, refreshKey],
    queryFn: () => fetchSubscriptionItems(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 30000,
  });
};

// Update subscription item quantity
const updateSubscriptionItemQuantity = async (
  subscriptionId: string,
  itemId: string,
  data: UpdateSubscriptionItemQuantityDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.update_qty(subscriptionId, itemId),
    'PATCH',
    data
  );
  return response;
};

export const useUpdateSubscriptionItemQuantity = (subscriptionId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, { itemId: string; data: UpdateSubscriptionItemQuantityDTO }>({
    mutationFn: async ({ itemId, data }) => {
      return updateSubscriptionItemQuantity(subscriptionId, itemId, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item quantity updated successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscription', 'items', subscriptionId] });
      }, 500);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Finalize subscription
const finalizeSubscription = async (
  subscriptionId: string,
  data: FinalizeSubscriptionDTO
): Promise<ProvisionResponse> => {
  const response = await handleAPI<ProvisionResponse>(
    endpoints.subscriptions.finalize(subscriptionId),
    'POST',
    data
  );
  return response.data;
};

export const useFinalizeSubscription = (subscriptionId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<ProvisionResponse, Error, FinalizeSubscriptionDTO>({
    mutationFn: async (data) => {
      return finalizeSubscription(subscriptionId, data);
    },
    onSuccess: async (response) => {
      handleSuccess(response, 'Subscription finalized successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['subscriptions', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['subscription', 'detail', subscriptionId] });
        queryClient.invalidateQueries({ queryKey: ['billing', 'records'] });
        queryClient.invalidateQueries({ queryKey: ['invoices', 'list'] });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
