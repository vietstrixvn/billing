import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import { logError } from '@/utils';
import type {
  SubscriptionAddonsResponse,
  SubscriptionAddonResponse,
  AddonCostResponse,
  AddAddonToSubscriptionDTO,
  UpdateSubscriptionAddonDTO,
  UpdateSubscriptionAddonQuantityDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Subscription Addon Hooks
 * ==========================
 */

const invalidateSubscriptionAddonQueries = (
  queryClient: ReturnType<typeof useQueryClient>,
  subscriptionId: string,
  addonRecordId?: string
) => {
  queryClient.invalidateQueries({
    queryKey: ['subscription', 'addons', subscriptionId],
  });
  queryClient.invalidateQueries({
    queryKey: ['subscription', 'detail', subscriptionId],
  });
  queryClient.invalidateQueries({
    queryKey: ['subscription', 'addons', 'cost', subscriptionId],
  });
  if (addonRecordId) {
    queryClient.invalidateQueries({
      queryKey: ['subscription_addon', 'detail', addonRecordId],
    });
    queryClient.invalidateQueries({
      queryKey: ['subscription_addon', 'cost', addonRecordId],
    });
  }
};

// Fetch subscription addons
const fetchSubscriptionAddons = async (
  subscriptionId: string
): Promise<SubscriptionAddonsResponse> => {
  try {
    const response = await handleAPI<SubscriptionAddonsResponse>(
      endpoints.subscriptions.addons(subscriptionId),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscription addons:', error);
    throw error;
  }
};

export const useSubscriptionAddons = (
  subscriptionId: string,
  refreshKey: number
) => {
  return useQuery<SubscriptionAddonsResponse, Error>({
    queryKey: ['subscription', 'addons', subscriptionId, refreshKey],
    queryFn: () => fetchSubscriptionAddons(subscriptionId),
    enabled: !!subscriptionId,
    staleTime: 30000,
  });
};

// Fetch subscription addon detail
const fetchSubscriptionAddonDetail = async (
  id: string
): Promise<SubscriptionAddonResponse> => {
  try {
    const response = await handleAPI<SubscriptionAddonResponse>(
      endpoints.subscription_addons.detail(id),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscription addon detail:', error);
    throw error;
  }
};

export const useSubscriptionAddonDetail = (id: string, refreshKey: number) => {
  return useQuery<SubscriptionAddonResponse, Error>({
    queryKey: ['subscription_addon', 'detail', id, refreshKey],
    queryFn: () => fetchSubscriptionAddonDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch subscription addon cost
const fetchSubscriptionAddonCost = async (
  id: string
): Promise<AddonCostResponse> => {
  try {
    const response = await handleAPI<AddonCostResponse>(
      endpoints.subscription_addons.cost(id),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching subscription addon cost:', error);
    throw error;
  }
};

export const useSubscriptionAddonCost = (id: string, refreshKey: number) => {
  return useQuery<AddonCostResponse, Error>({
    queryKey: ['subscription_addon', 'cost', id, refreshKey],
    queryFn: () => fetchSubscriptionAddonCost(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Add addon to subscription
const addAddonToSubscription = async (
  subscriptionId: string,
  createDto: AddAddonToSubscriptionDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.add_addon(subscriptionId),
    'POST',
    createDto
  );
  return response;
};

export const useAddAddonToSubscription = (subscriptionId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, AddAddonToSubscriptionDTO>({
    mutationFn: async (createDto) =>
      addAddonToSubscription(subscriptionId, createDto),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon added to subscription successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(queryClient, subscriptionId);
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Update subscription addon
const updateSubscriptionAddon = async (
  addonId: string,
  updateDto: UpdateSubscriptionAddonDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.detail(addonId),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateSubscriptionAddon = (
  addonId: string,
  subscriptionId: string
) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateSubscriptionAddonDTO>({
    mutationFn: async (updateDto) =>
      updateSubscriptionAddon(addonId, updateDto),
    onSuccess: async (response) => {
      handleSuccess(response, 'Subscription addon updated successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(
          queryClient,
          subscriptionId,
          addonId
        );
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Update subscription addon quantity
const updateSubscriptionAddonQuantity = async (
  addonId: string,
  data: UpdateSubscriptionAddonQuantityDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.quantity(addonId),
    'PUT',
    data
  );
  return response;
};

export const useUpdateSubscriptionAddonQuantity = (
  addonId: string,
  subscriptionId: string
) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateSubscriptionAddonQuantityDTO>({
    mutationFn: async (data) =>
      updateSubscriptionAddonQuantity(addonId, data),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon quantity updated successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(
          queryClient,
          subscriptionId,
          addonId
        );
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Activate subscription addon
const activateSubscriptionAddon = async (addonId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.activate(addonId),
    'POST'
  );
  return response;
};

export const useActivateSubscriptionAddon = (
  addonId: string,
  subscriptionId: string
) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => activateSubscriptionAddon(addonId),
    onSuccess: async (response) => {
      handleSuccess(response, 'Subscription addon activated successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(
          queryClient,
          subscriptionId,
          addonId
        );
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Deactivate subscription addon
const deactivateSubscriptionAddon = async (addonId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.deactivate(addonId),
    'POST'
  );
  return response;
};

export const useDeactivateSubscriptionAddon = (
  addonId: string,
  subscriptionId: string
) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => deactivateSubscriptionAddon(addonId),
    onSuccess: async (response) => {
      handleSuccess(response, 'Subscription addon deactivated successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(
          queryClient,
          subscriptionId,
          addonId
        );
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Remove addon from subscription (by subscription-addon record id)
const removeSubscriptionAddon = async (addonId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.detail(addonId),
    'DELETE'
  );
  return response;
};

export const useRemoveAddonFromSubscription = (subscriptionId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: removeSubscriptionAddon,
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon removed from subscription successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(queryClient, subscriptionId);
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Remove addon by subscription id + catalog addon id
const removeAddonBySubscriptionAndAddon = async (
  subscriptionId: string,
  catalogAddonId: string
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscription_addons.remove(subscriptionId, catalogAddonId),
    'DELETE'
  );
  return response;
};

export const useRemoveAddonBySubscriptionAndAddon = (
  subscriptionId: string
) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (catalogAddonId) =>
      removeAddonBySubscriptionAndAddon(subscriptionId, catalogAddonId),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon removed from subscription successfully');

      setTimeout(() => {
        invalidateSubscriptionAddonQueries(queryClient, subscriptionId);
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
