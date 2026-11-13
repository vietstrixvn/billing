import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import { logError } from '@/utils';
import type {
  CreateItemPriceRequest,
  PriceTier,
  ItemPrice,
} from '@/types/billing/analytics';
import type { ApiResponse } from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Item Price Hooks
 * ==========================
 */

type ItemPricesResponse = ApiResponse<ItemPrice[]>;
type ItemPriceResponse = ApiResponse<ItemPrice>;

// Fetch item prices for a service item
const fetchItemPrices = async (itemId: string): Promise<ItemPrice[]> => {
  try {
    const response = await handleAPI<ItemPricesResponse>(
      endpoints.item_prices.list(itemId),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching item prices:', error);
    throw error;
  }
};

export const useItemPrices = (itemId: string, refreshKey: number) => {
  return useQuery<ItemPrice[], Error>({
    queryKey: ['item_prices', 'list', itemId, refreshKey],
    queryFn: () => fetchItemPrices(itemId),
    enabled: !!itemId,
    staleTime: 60000,
  });
};

// Fetch active price for a service item
const fetchActiveItemPrice = async (
  itemId: string,
  billingCycle?: string,
  date?: string
): Promise<ItemPrice> => {
  try {
    const params = new URLSearchParams();
    if (billingCycle) params.append('billing_cycle', billingCycle);
    if (date) params.append('date', date);

    const qs = params.toString();
    const url = qs
      ? `${endpoints.item_prices.active(itemId)}?${qs}`
      : endpoints.item_prices.active(itemId);

    const response = await handleAPI<ItemPriceResponse>(
      url,
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching active item price:', error);
    throw error;
  }
};

export const useActiveItemPrice = (
  itemId: string,
  billingCycle?: string,
  date?: string,
  refreshKey: number = 0
) => {
  return useQuery<ItemPrice, Error>({
    queryKey: ['item_price', 'active', itemId, billingCycle, date, refreshKey],
    queryFn: () => fetchActiveItemPrice(itemId, billingCycle, date),
    enabled: !!itemId,
    staleTime: 30000,
  });
};

// Fetch item price detail
const fetchItemPriceDetail = async (priceId: string): Promise<ItemPrice> => {
  try {
    const response = await handleAPI<ItemPriceResponse>(
      endpoints.item_prices.detail(priceId),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching item price detail:', error);
    throw error;
  }
};

export const useItemPriceDetail = (priceId: string, refreshKey: number) => {
  return useQuery<ItemPrice, Error>({
    queryKey: ['item_price', 'detail', priceId, refreshKey],
    queryFn: () => fetchItemPriceDetail(priceId),
    enabled: !!priceId,
    staleTime: 30000,
  });
};

// Create item price
const createItemPrice = async (
  itemId: string,
  createDto: CreateItemPriceRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.create(itemId),
    'POST',
    createDto
  );
  return response;
};

export const useCreateItemPrice = (itemId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateItemPriceRequest>({
    mutationFn: async (createDto: CreateItemPriceRequest) => {
      return createItemPrice(itemId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item price created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['item_prices', 'list', itemId],
        });
        queryClient.invalidateQueries({
          queryKey: ['item_price', 'active', itemId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update item price
const updateItemPrice = async (
  priceId: string,
  updateDto: Partial<CreateItemPriceRequest>
): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.detail(priceId),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateItemPrice = (defaultPriceId?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    any,
    Error,
    | { priceId: string; updateDto: Partial<CreateItemPriceRequest> }
    | Partial<CreateItemPriceRequest>
  >({
    mutationFn: async (args: any) => {
      if (
        args &&
        typeof args === 'object' &&
        'priceId' in args &&
        'updateDto' in args
      ) {
        return updateItemPrice(args.priceId, args.updateDto);
      }
      return updateItemPrice(defaultPriceId || '', args);
    },
    onSuccess: async (response: any, variables: any) => {
      handleSuccess(response, 'Item price updated successfully');
      const targetId =
        variables && typeof variables === 'object' && 'priceId' in variables
          ? variables.priceId
          : defaultPriceId;

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['item_prices', 'list'] });
        if (targetId) {
          queryClient.invalidateQueries({
            queryKey: ['item_price', 'detail', targetId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ['item_price', 'active'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete item price
const deleteItemPrice = async (priceId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.detail(priceId),
    'DELETE'
  );
  return response;
};

export const useDeleteItemPrice = (itemId?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (priceId: string) => {
      return deleteItemPrice(priceId);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item price deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['item_prices', 'list'] });
        if (itemId) {
          queryClient.invalidateQueries({
            queryKey: ['item_prices', 'list', itemId],
          });
        }
        queryClient.invalidateQueries({ queryKey: ['item_price', 'active'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Add price tiers
const addPriceTiers = async (
  priceId: string,
  tiers: PriceTier[]
): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.tiers(priceId),
    'POST',
    {
      tiers,
    }
  );
  return response;
};

export const useAddPriceTiers = (priceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, PriceTier[]>({
    mutationFn: async (tiers: PriceTier[]) => {
      return addPriceTiers(priceId, tiers);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Price tiers added successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['item_price', 'detail', priceId],
        });
        queryClient.invalidateQueries({ queryKey: ['item_prices', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update price tiers (replace all)
const updatePriceTiers = async (
  priceId: string,
  tiers: PriceTier[]
): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.tiers(priceId),
    'PUT',
    {
      tiers,
    }
  );
  return response;
};

export const useUpdatePriceTiers = (priceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, PriceTier[]>({
    mutationFn: async (tiers: PriceTier[]) => {
      return updatePriceTiers(priceId, tiers);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Price tiers updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['item_price', 'detail', priceId],
        });
        queryClient.invalidateQueries({ queryKey: ['item_prices', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete all price tiers
const deletePriceTiers = async (priceId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.item_prices.tiers(priceId),
    'DELETE'
  );
  return response;
};

export const useDeletePriceTiers = (priceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, void>({
    mutationFn: async () => {
      return deletePriceTiers(priceId);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Price tiers deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['item_price', 'detail', priceId],
        });
        queryClient.invalidateQueries({ queryKey: ['item_prices', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
