import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchAddonsResponse,
  AddonResponse,
  AddonPriceResponse,
  CreateAddonDTO,
  UpdateAddonDTO,
  AddonPricesResponse,
  CreateAddonPriceDTO,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Addon Hooks
 * ==========================
 */

// Fetch addons list
const fetchAddons = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchAddonsResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchAddonsResponse>(
      `${endpoints.addons.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching addons:', error);
    throw error;
  }
};

export const useAddons = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchAddonsResponse, Error>({
    queryKey: ['addons', 'list', page, filters, refreshKey],
    queryFn: () => fetchAddons(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch addon detail
const fetchAddonDetail = async (id: string): Promise<AddonResponse> => {
  try {
    const response = await handleAPI<AddonResponse>(endpoints.addons.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching addon detail:', error);
    throw error;
  }
};

export const useAddonDetail = (id: string, refreshKey: number) => {
  return useQuery<AddonResponse, Error>({
    queryKey: ['addon', 'detail', id, refreshKey],
    queryFn: () => fetchAddonDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch addon by slug
const fetchAddonBySlug = async (slug: string): Promise<AddonResponse> => {
  try {
    const response = await handleAPI<AddonResponse>(endpoints.addons.slug(slug), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching addon by slug:', error);
    throw error;
  }
};

export const useAddonBySlug = (slug: string, refreshKey: number) => {
  return useQuery<AddonResponse, Error>({
    queryKey: ['addon', 'slug', slug, refreshKey],
    queryFn: () => fetchAddonBySlug(slug),
    enabled: !!slug,
    staleTime: 30000,
  });
};

// Create addon
const createAddon = async (createDto: CreateAddonDTO): Promise<any> => {
  const response = await handleAPI(endpoints.addons.list, 'POST', createDto);
  return response;
};

export const useCreateAddon = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateAddonDTO>({
    mutationFn: async (createDto: CreateAddonDTO) => {
      return createAddon(createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['addons', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update addon
const updateAddon = async (
  id: string,
  updateDto: UpdateAddonDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.addons.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateAddon = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateAddonDTO>({
    mutationFn: async (updateDto: UpdateAddonDTO) => {
      return updateAddon(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['addons', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['addon', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete addon
const deleteAddon = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.addons.detail(id), 'DELETE');
  return response;
};

export const useDeleteAddon = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteAddon(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['addons', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Activate addon
const activateAddon = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.addons.activate(id), 'POST');
  return response;
};

export const useActivateAddon = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => activateAddon(id),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon activated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['addons', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['addon', 'detail', id] });
        queryClient.invalidateQueries({ queryKey: ['addon', 'slug'] });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Deactivate addon
const deactivateAddon = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.addons.deactivate(id), 'POST');
  return response;
};

export const useDeactivateAddon = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => deactivateAddon(id),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon deactivated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['addons', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['addon', 'detail', id] });
        queryClient.invalidateQueries({ queryKey: ['addon', 'slug'] });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

/**
 * ==========================
 * 📌 Addon Price Hooks
 * ==========================
 */

// Fetch addon prices
const fetchAddonPrices = async (
  addonId: string
): Promise<AddonPricesResponse> => {
  try {
    const response = await handleAPI<AddonPricesResponse>(endpoints.addons.prices(addonId), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching addon prices:', error);
    throw error;
  }
};

export const useAddonPrices = (addonId: string, refreshKey: number) => {
  return useQuery<AddonPricesResponse, Error>({
    queryKey: ['addon', 'prices', addonId, refreshKey],
    queryFn: () => fetchAddonPrices(addonId),
    enabled: !!addonId,
    staleTime: 30000,
  });
};

// Fetch active addon price
const fetchActiveAddonPrice = async (
  addonId: string
): Promise<AddonPriceResponse> => {
  try {
    const response = await handleAPI<AddonPriceResponse>(
      endpoints.addon_prices.active(addonId),
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching active addon price:', error);
    throw error;
  }
};

export const useActiveAddonPrice = (addonId: string, refreshKey: number) => {
  return useQuery<AddonPriceResponse, Error>({
    queryKey: ['addon', 'prices', 'active', addonId, refreshKey],
    queryFn: () => fetchActiveAddonPrice(addonId),
    enabled: !!addonId,
    staleTime: 30000,
  });
};

// Create addon price
const createAddonPrice = async (
  addonId: string,
  createDto: CreateAddonPriceDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.addons.create_price(addonId),
    'POST',
    createDto
  );
  return response;
};

export const useCreateAddonPrice = (addonId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateAddonPriceDTO>({
    mutationFn: async (createDto: CreateAddonPriceDTO) => {
      return createAddonPrice(addonId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon price created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', addonId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update addon price
const updateAddonPrice = async (
  priceId: string,
  updateDto: Partial<CreateAddonPriceDTO>
): Promise<any> => {
  const response = await handleAPI(
    endpoints.addon_prices.detail(priceId),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateAddonPrice = (priceId: string, addonId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, Partial<CreateAddonPriceDTO>>({
    mutationFn: async (updateDto: Partial<CreateAddonPriceDTO>) => {
      return updateAddonPrice(priceId, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon price updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', addonId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete addon price
const deleteAddonPrice = async (priceId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.addon_prices.detail(priceId),
    'DELETE'
  );
  return response;
};

export const useDeleteAddonPrice = (addonId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (priceId: string) => {
      return deleteAddonPrice(priceId);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Addon price deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', addonId],
        });
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', 'active', addonId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Activate addon price
const activateAddonPrice = async (priceId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.addon_prices.activate(priceId),
    'POST'
  );
  return response;
};

export const useActivateAddonPrice = (priceId: string, addonId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => activateAddonPrice(priceId),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon price activated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', addonId],
        });
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', 'active', addonId],
        });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Deactivate addon price
const deactivateAddonPrice = async (priceId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.addon_prices.deactivate(priceId),
    'POST'
  );
  return response;
};

export const useDeactivateAddonPrice = (priceId: string, addonId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => deactivateAddonPrice(priceId),
    onSuccess: async (response) => {
      handleSuccess(response, 'Addon price deactivated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', addonId],
        });
        queryClient.invalidateQueries({
          queryKey: ['addon', 'prices', 'active', addonId],
        });
      }, 1000);
    },
    onError: (error) => {
      handleError(error);
    },
  });
};
