import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type {
  Client,
  Contact,
  CreateClientDTO,
  UpdateClientDTO,
  CreateContactDTO,
  UpdateContactDTO,
  Invoice,
} from '@/types';
import { buildQueryParams, logError } from '@/utils';
import { useErrorHandler } from '@/hooks/use-error-handler';

export interface ClientFilters {
  status?: string;
  search?: string;
  owner_id?: string;
}

export interface ClientInvoiceFilters {
  status?: string; // 'paid', 'pending', 'overdue'
}

// ----------------------------------------------------------------------
// 1. CLIENT HOOKS
// ----------------------------------------------------------------------

// Fetch clients list
const fetchClients = async (
  page = 1,
  filters: ClientFilters = {},
  pageSize = 10
): Promise<any> => {
  try {
    const queryString = buildQueryParams(filters as any, page, pageSize);
    const url = `${endpoints.clients.list}${queryString ? `?${queryString}` : ''}`;

    const response = await handleAPI<any>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching clients:', error);
    throw error;
  }
};

export const useClients = (
  page: number = 1,
  filters: ClientFilters = {},
  refreshKey: number = 0,
  pageSize: number = 10
) => {
  const query = useQuery<any, Error>({
    queryKey: ['clients', 'list', page, filters, refreshKey, pageSize],
    queryFn: () => fetchClients(page, filters, pageSize),
    enabled: page > 0,
    staleTime: 60000,
  });

  const rawData = query.data;
  const clients: Client[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.results)
      ? rawData.data.results
      : Array.isArray(rawData?.results)
        ? rawData.results
        : Array.isArray(rawData)
          ? rawData
          : [];

  const pagination = rawData?.pagination || rawData?.data?.pagination;

  return {
    clients,
    pagination,
    ...query,
  };
};

// Fetch client detail (includes contacts array)
const fetchClientDetail = async (id: string): Promise<Client> => {
  try {
    const response = await handleAPI<any>(endpoints.clients.detail(id), 'GET');
    return response.data?.data || response.data;
  } catch (error) {
    logError('Error fetching client detail:', error);
    throw error;
  }
};

export const useClientDetail = (id?: string, refreshKey: number = 0) => {
  return useQuery<Client, Error>({
    queryKey: ['client', 'detail', id, refreshKey],
    queryFn: () => fetchClientDetail(id!),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create client
const createClient = async (dto: CreateClientDTO): Promise<Client> => {
  const response = await handleAPI<any>(endpoints.clients.create, 'POST', dto);
  return response.data?.data || response.data;
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<Client, Error, CreateClientDTO>({
    mutationFn: (dto) => createClient(dto),
    onSuccess: (data) => {
      handleSuccess(data as any, 'Client created successfully');
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Update client
const updateClient = async (id: string, dto: UpdateClientDTO): Promise<Client> => {
  const response = await handleAPI<any>(endpoints.clients.update(id), 'PUT', dto);
  return response.data?.data || response.data;
};

export const useUpdateClient = (id?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<Client, Error, { id?: string; dto: UpdateClientDTO }>({
    mutationFn: ({ id: clientId, dto }) => {
      const targetId = clientId || id;
      if (!targetId) throw new Error('Client ID is required for update');
      return updateClient(targetId, dto);
    },
    onSuccess: (data, variables) => {
      handleSuccess(data as any, 'Client updated successfully');
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
      const targetId = variables.id || id;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['client', 'detail', targetId] });
      }
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Delete client
const deleteClient = async (id: string): Promise<void> => {
  await handleAPI(endpoints.clients.delete(id), 'DELETE');
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<void, Error, string>({
    mutationFn: (id) => deleteClient(id),
    onSuccess: (_, id) => {
      handleSuccess(null as any, 'Client deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
      queryClient.invalidateQueries({ queryKey: ['client', 'detail', id] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// ----------------------------------------------------------------------
// 2. CONTACT HOOKS
// ----------------------------------------------------------------------

// Add contact
const addContact = async (clientId: string, dto: CreateContactDTO): Promise<Contact> => {
  const response = await handleAPI<any>(
    endpoints.clients.contacts.add(clientId),
    'POST',
    dto
  );
  return response.data?.data || response.data;
};

export const useAddContact = (clientId?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<Contact, Error, { clientId?: string; dto: CreateContactDTO }>({
    mutationFn: ({ clientId: cId, dto }) => {
      const targetId = cId || clientId;
      if (!targetId) throw new Error('Client ID is required to add contact');
      return addContact(targetId, dto);
    },
    onSuccess: (_, variables) => {
      handleSuccess(null as any, 'Contact added successfully');
      const targetId = variables.clientId || clientId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['client', 'detail', targetId] });
      }
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Update contact
const updateContact = async (
  clientId: string,
  contactId: string,
  dto: UpdateContactDTO
): Promise<Contact> => {
  const response = await handleAPI<any>(
    endpoints.clients.contacts.update(clientId, contactId),
    'PUT',
    dto
  );
  return response.data?.data || response.data;
};

export const useUpdateContact = (clientId?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<
    Contact,
    Error,
    { clientId?: string; contactId: string; dto: UpdateContactDTO }
  >({
    mutationFn: ({ clientId: cId, contactId, dto }) => {
      const targetId = cId || clientId;
      if (!targetId) throw new Error('Client ID is required to update contact');
      return updateContact(targetId, contactId, dto);
    },
    onSuccess: (_, variables) => {
      handleSuccess(null as any, 'Contact updated successfully');
      const targetId = variables.clientId || clientId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['client', 'detail', targetId] });
      }
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Delete contact
const deleteContact = async (clientId: string, contactId: string): Promise<void> => {
  await handleAPI(endpoints.clients.contacts.delete(clientId, contactId), 'DELETE');
};

export const useDeleteContact = (clientId?: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<void, Error, { clientId?: string; contactId: string }>({
    mutationFn: ({ clientId: cId, contactId }) => {
      const targetId = cId || clientId;
      if (!targetId) throw new Error('Client ID is required to delete contact');
      return deleteContact(targetId, contactId);
    },
    onSuccess: (_, variables) => {
      handleSuccess(null as any, 'Contact deleted successfully');
      const targetId = variables.clientId || clientId;
      if (targetId) {
        queryClient.invalidateQueries({ queryKey: ['client', 'detail', targetId] });
      }
      queryClient.invalidateQueries({ queryKey: ['clients', 'list'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// ----------------------------------------------------------------------
// 3. INVOICES BY CLIENT HOOKS
// ----------------------------------------------------------------------

const fetchClientInvoices = async (
  clientId: string,
  page = 1,
  filters: ClientInvoiceFilters = {},
  pageSize = 10
): Promise<any> => {
  try {
    const queryString = buildQueryParams(filters as any, page, pageSize);
    const url = `${endpoints.clients.invoices(clientId)}${queryString ? `?${queryString}` : ''}`;

    const response = await handleAPI<any>(url, 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching client invoices:', error);
    throw error;
  }
};

export const useClientInvoices = (
  clientId?: string,
  page: number = 1,
  filters: ClientInvoiceFilters = {},
  refreshKey: number = 0,
  pageSize: number = 10
) => {
  const query = useQuery<any, Error>({
    queryKey: ['client', 'invoices', clientId, page, filters, refreshKey, pageSize],
    queryFn: () => fetchClientInvoices(clientId!, page, filters, pageSize),
    enabled: !!clientId && page > 0,
    staleTime: 30000,
  });

  const rawData = query.data;
  const invoices: Invoice[] = Array.isArray(rawData?.data)
    ? rawData.data
    : Array.isArray(rawData?.data?.results)
      ? rawData.data.results
      : Array.isArray(rawData?.results)
        ? rawData.results
        : Array.isArray(rawData)
          ? rawData
          : [];

  const pagination = rawData?.pagination || rawData?.data?.pagination;

  return {
    invoices,
    pagination,
    ...query,
  };
};
