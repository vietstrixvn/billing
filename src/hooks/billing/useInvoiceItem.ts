import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type {
  InvoiceItem,
  AddItemToInvoiceRequest,
  UpdateInvoiceItemRequest,
  SetInvoiceItemsRequest,
  ApiResponse,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';
import { logError } from '@/utils';

/**
 * ==========================
 * 📌 Invoice Item Hooks
 * ==========================
 */

type InvoiceItemsResponse = ApiResponse<InvoiceItem[]>;
type InvoiceItemResponse = ApiResponse<InvoiceItem>;

// Fetch invoice items by invoice ID
const fetchInvoiceItems = async (invoiceId: string): Promise<InvoiceItem[]> => {
  try {
    const response = await handleAPI<InvoiceItemsResponse>(
      endpoints.invoices_item.detail(invoiceId),
      'GET'
    );

    return response.data?.data || [];
  } catch (error) {
    logError('Error fetching invoice items:', error);
    throw error;
  }
};

export const useInvoiceItems = (invoiceId: string, refreshKey: number) => {
  return useQuery<InvoiceItem[], Error>({
    queryKey: ['invoice_items', 'list', invoiceId, refreshKey],
    queryFn: () => fetchInvoiceItems(invoiceId),
    enabled: !!invoiceId,
    staleTime: 30000,
  });
};

// Fetch invoice item detail
const fetchInvoiceItemDetail = async (id: string): Promise<InvoiceItem> => {
  try {
    const response = await handleAPI<InvoiceItemResponse>(
      endpoints.invoices_item.item(id),
      'GET'
    );
    return response.data.data;
  } catch (error) {
    logError('Error fetching invoice item detail:', error);
    throw error;
  }
};

export const useInvoiceItemDetail = (id: string, refreshKey: number) => {
  return useQuery<InvoiceItem, Error>({
    queryKey: ['invoice_item', 'detail', id, refreshKey],
    queryFn: () => fetchInvoiceItemDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Add item to invoice
const addItemToInvoice = async (
  invoiceId: string,
  createDto: AddItemToInvoiceRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.invoices_item.detail(invoiceId),
    'POST',
    createDto
  );
  return response;
};

export const useAddItemToInvoice = (invoiceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, AddItemToInvoiceRequest>({
    mutationFn: async (createDto: AddItemToInvoiceRequest) => {
      return addItemToInvoice(invoiceId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item added to invoice successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['invoice_items', 'list', invoiceId],
        });
        queryClient.invalidateQueries({
          queryKey: ['invoice', 'detail', invoiceId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update invoice item
const updateInvoiceItem = async (
  id: string,
  updateDto: UpdateInvoiceItemRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.invoices_item.item(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateInvoiceItem = (id: string, invoiceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateInvoiceItemRequest>({
    mutationFn: async (updateDto: UpdateInvoiceItemRequest) => {
      return updateInvoiceItem(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Invoice item updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['invoice_items', 'list', invoiceId],
        });
        queryClient.invalidateQueries({
          queryKey: ['invoice_item', 'detail', id],
        });
        queryClient.invalidateQueries({
          queryKey: ['invoice', 'detail', invoiceId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete invoice item
const deleteInvoiceItem = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.invoices_item.item(id), 'DELETE');
  return response;
};

export const useDeleteInvoiceItem = (invoiceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteInvoiceItem(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Item removed from invoice successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['invoice_items', 'list', invoiceId],
        });
        queryClient.invalidateQueries({
          queryKey: ['invoice', 'detail', invoiceId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Bulk replace invoice items
const setInvoiceItems = async (
  invoiceId: string,
  data: SetInvoiceItemsRequest
): Promise<any> => {
  const response = await handleAPI(
    endpoints.invoices_item.detail(invoiceId),
    'PUT',
    data
  );
  return response;
};

export const useSetInvoiceItems = (invoiceId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, SetInvoiceItemsRequest>({
    mutationFn: async (data: SetInvoiceItemsRequest) => {
      return setInvoiceItems(invoiceId, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Invoice items updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['invoice_items', 'list', invoiceId],
        });
        queryClient.invalidateQueries({
          queryKey: ['invoice', 'detail', invoiceId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
