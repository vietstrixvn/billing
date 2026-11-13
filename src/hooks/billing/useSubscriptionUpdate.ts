import { useMutation, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { UpdateBillingDTO, ToggleAutoRenewDTO } from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

// Update billing information
const updateBilling = async (
  id: string,
  data: UpdateBillingDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.billing(id),
    'PATCH',
    data
  );
  return response;
};

export const useUpdateBilling = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateBillingDTO>({
    mutationFn: async (data: UpdateBillingDTO) => {
      return updateBilling(id, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Billing information updated successfully');

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

// Toggle auto-renewal
const toggleAutoRenew = async (
  id: string,
  data: ToggleAutoRenewDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.subscriptions.auto_renew(id),
    'PATCH',
    data
  );
  return response;
};

export const useToggleAutoRenew = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, ToggleAutoRenewDTO>({
    mutationFn: async (data: ToggleAutoRenewDTO) => {
      return toggleAutoRenew(id, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(
        response,
        `Auto-renewal ${response.data?.auto_renew ? 'enabled' : 'disabled'} successfully`
      );

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
