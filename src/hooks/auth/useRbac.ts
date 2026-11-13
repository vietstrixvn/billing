import { endpoints, handleAPI } from '@/apis';
import { ERROR_MESSAGE, Filters } from '@/types';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useErrorHandler } from '../use-error-handler';
import { buildCursorQueryParams } from '@/utils';
import { useCallback, useRef } from 'react';
import {
  FetchRoleListResponse,
  FetchPermissionListResponse,
  FetchResourcesListResponse,
  RolesResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  PermissionsResponse,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  ResourcesResponse,
  UserEffectivePermissionsResponse,
} from '@/types';

// ============================================================================
// ROLES
// ============================================================================

const fetchRoles = async (
  pageParam = '0',
  filters: Filters,
  pageSize?: number
): Promise<FetchRoleListResponse> => {
  const queryString = buildCursorQueryParams(filters, pageParam, pageSize);
  const response = await handleAPI(
    `${endpoints.rbac.roles.list}${queryString ? `?${queryString}` : ''}`,
    'GET'
  );
  return response.data;
};

const useRoles = (
  page: string,
  filters: Filters = {},
  refreshKey: number,
  pageSize?: number
) => {
  return useQuery<FetchRoleListResponse, Error>({
    queryKey: ['roles', 'list', page, filters, refreshKey, pageSize],
    queryFn: () => fetchRoles(page, filters, pageSize),
    enabled: true,
    staleTime: 60000,
  });
};

const fetchRoleDetail = async (id: string): Promise<RolesResponse> => {
  if (!endpoints.rbac.roles.detail) {
    throw new Error(ERROR_MESSAGE.ENPOINT_ERROR);
  }
  const response = await handleAPI(`${endpoints.rbac.roles.detail(id)}`, 'GET');
  return response.data;
};

const useRoleDetail = (id: string, refreshKey: number) => {
  return useQuery<RolesResponse, Error>({
    queryKey: ['roles', 'detail', id, refreshKey],
    queryFn: () => fetchRoleDetail(id),
    enabled: !!id,
    staleTime: 60000,
  });
};

const createRole = async (newRole: {
  title: string;
  description: string;
  is_system?: boolean;
}) => {
  const response = await handleAPI(
    `${endpoints.rbac.roles.list}`,
    'POST',
    newRole
  );
  return response;
};

const useCreateRole = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (newRole: {
      title: string;
      description: string;
      is_system?: boolean;
    }) => {
      return createRole(newRole);
    },
    onMutate: async (newRole) => {
      await queryClient.cancelQueries({ queryKey: ['roles', 'list'] });

      const previousData = queryClient.getQueriesData<FetchRoleListResponse>({
        queryKey: ['roles', 'list'],
      });

      queryClient.setQueriesData<FetchRoleListResponse>(
        { queryKey: ['roles', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          const tempRole = {
            id: `temp-${Date.now()}`,
            title: newRole.title,
            description: newRole.description,
            is_system: newRole.is_system || false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            isPending: true,
          } as any;

          return {
            ...oldData,
            results: [tempRole, ...oldData.results],
          };
        }
      );

      return { previousData };
    },
    onSuccess: async (response) => {
      queryClient.setQueriesData<FetchRoleListResponse>(
        { queryKey: ['roles', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.results.map((role) =>
              (role as any).isPending ? response : role
            ),
          };
        }
      );

      handleSuccess(response, 'Role created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
      }, 1000);
    },
    onError: (error, _newRole, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

const updateRole = async (
  updateData: { title?: string; description?: string },
  roleId: string
) => {
  const response = await handleAPI(
    `${endpoints.rbac.roles.detail(roleId)}`,
    'PUT',
    updateData
  );
  return response;
};

const useUpdateRole = (roleId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (updateData: {
      title?: string;
      description?: string;
    }) => {
      return updateRole(updateData, roleId);
    },
    onMutate: async (updateData) => {
      await queryClient.cancelQueries({ queryKey: ['roles', 'list'] });
      await queryClient.cancelQueries({
        queryKey: ['roles', 'detail', roleId],
      });

      const previousListData =
        queryClient.getQueriesData<FetchRoleListResponse>({
          queryKey: ['roles', 'list'],
        });
      const previousDetailData = queryClient.getQueryData([
        'roles',
        'detail',
        roleId,
      ]);

      queryClient.setQueriesData<FetchRoleListResponse>(
        { queryKey: ['roles', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.results.map((role) =>
              role.id === roleId
                ? ({ ...role, ...updateData, isUpdating: true } as any)
                : role
            ),
          };
        }
      );

      return { previousListData, previousDetailData };
    },
    onSuccess: async (response) => {
      queryClient.setQueriesData<FetchRoleListResponse>(
        { queryKey: ['roles', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;

          return {
            ...oldData,
            results: oldData.results.map((role) =>
              role.id === roleId ? { ...response, isUpdating: false } : role
            ),
          };
        }
      );

      queryClient.setQueryData(['roles', 'detail', roleId], response);

      handleSuccess(response, 'Role updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
        queryClient.invalidateQueries({
          queryKey: ['roles', 'detail', roleId],
        });
      }, 1000);
    },
    onError: (error, _updateData, context) => {
      if (context?.previousListData) {
        context.previousListData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      if (context?.previousDetailData) {
        queryClient.setQueryData(
          ['roles', 'detail', roleId],
          context.previousDetailData
        );
      }
      handleError(error);
    },
  });
};

const deleteRole = async (
  roleId: string
): Promise<{ code: number; success: boolean; message?: string }> => {
  if (!endpoints.rbac.roles.detail) {
    throw new Error(ERROR_MESSAGE.ENPOINT_ERROR);
  }
  const response = await handleAPI<{
    code: number;
    success: boolean;
    message?: string;
  }>(endpoints.rbac.roles.detail(roleId), 'DELETE');
  return response;
};

const useDeleteRole = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();
  const pendingDeletes = useRef<Map<string, ReturnType<typeof setTimeout>>>(
    new Map()
  );

  const cancelDelete = useCallback((roleId: string) => {
    const timeoutId = pendingDeletes.current.get(roleId);
    if (timeoutId) {
      clearTimeout(timeoutId);
      pendingDeletes.current.delete(roleId);
      return true;
    }
    return false;
  }, []);

  const mutation = useMutation({
    mutationFn: (
      roleId: string
    ): Promise<{ code: number; success: boolean; message?: string }> => {
      return new Promise((resolve, reject) => {
        const DELAY_MS = 4000;
        const timeoutId = setTimeout(async () => {
          pendingDeletes.current.delete(roleId);
          try {
            const result = await deleteRole(roleId);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        }, DELAY_MS);
        pendingDeletes.current.set(roleId, timeoutId);
      });
    },

    onSuccess: async (response, roleId) => {
      queryClient.setQueriesData<FetchRoleListResponse>(
        { queryKey: ['roles', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.filter((role) => role.id !== roleId),
          };
        }
      );

      handleSuccess(response, 'Role deleted successfully.');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
      }, 1000);
    },

    onError: (error) => {
      queryClient.invalidateQueries({ queryKey: ['roles', 'list'] });
      handleError(error);
    },
  });

  return { ...mutation, cancelDelete };
};

// ============================================================================
// PERMISSIONS
// ============================================================================

const fetchPermissions = async (
  pageParam = '0',
  filters: Filters,
  pageSize?: number
): Promise<FetchPermissionListResponse> => {
  const queryString = buildCursorQueryParams(filters, pageParam, pageSize);
  const response = await handleAPI(
    `${endpoints.rbac.permissions.list}${queryString ? `?${queryString}` : ''}`,
    'GET'
  );
  return response.data;
};

const usePermissions = (
  page: string,
  filters: Filters = {},
  refreshKey: number,
  pageSize?: number
) => {
  return useQuery<FetchPermissionListResponse, Error>({
    queryKey: ['permissions', 'list', page, filters, refreshKey, pageSize],
    queryFn: () => fetchPermissions(page, filters, pageSize),
    enabled: true,
    staleTime: 60000,
  });
};

const createPermission = async (data: {
  action: string;
  description: string;
}) => {
  const response = await handleAPI(
    `${endpoints.rbac.permissions.list}`,
    'POST',
    data
  );
  return response;
};

const useCreatePermission = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (data: { action: string; description: string }) =>
      createPermission(data),
    onSuccess: (response) => {
      handleSuccess(response, 'Permission created successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['permissions', 'list'] });
      }, 1000);
    },
    onError: (error) => handleError(error),
  });
};

const updatePermission = async (
  id: string,
  data: { action?: string; description?: string }
) => {
  const response = await handleAPI(
    `${endpoints.rbac.permissions.detail(id)}`,
    'PUT',
    data
  );
  return response;
};

const useUpdatePermission = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { action?: string; description?: string };
    }) => updatePermission(id, data),
    onSuccess: (response) => {
      handleSuccess(response, 'Permission updated successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['permissions', 'list'] });
      }, 1000);
    },
    onError: (error) => handleError(error),
  });
};

const deletePermission = async (id: string) => {
  const response = await handleAPI(
    `${endpoints.rbac.permissions.detail(id)}`,
    'DELETE'
  );
  return response;
};

const useDeletePermission = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (id: string) => deletePermission(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['permissions', 'list'] });
      const previousData =
        queryClient.getQueriesData<FetchPermissionListResponse>({
          queryKey: ['permissions', 'list'],
        });
      queryClient.setQueriesData<FetchPermissionListResponse>(
        { queryKey: ['permissions', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.filter((p) => p.id !== id),
          };
        }
      );
      return { previousData };
    },
    onSuccess: (response) => {
      handleSuccess(response, 'Permission deleted successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['permissions', 'list'] });
      }, 1000);
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// ============================================================================
// RESOURCES
// ============================================================================

const fetchResources = async (
  pageParam = '0',
  filters: Filters,
  pageSize?: number
): Promise<FetchResourcesListResponse> => {
  const queryString = buildCursorQueryParams(filters, pageParam, pageSize);
  const response = await handleAPI(
    `${endpoints.rbac.resources.list}${queryString ? `?${queryString}` : ''}`,
    'GET'
  );
  return response.data;
};

const useResources = (
  page: string,
  filters: Filters = {},
  refreshKey: number,
  pageSize?: number
) => {
  return useQuery<FetchResourcesListResponse, Error>({
    queryKey: ['resources', 'list', page, filters, refreshKey, pageSize],
    queryFn: () => fetchResources(page, filters, pageSize),
    enabled: true,
    staleTime: 60000,
  });
};

const createResource = async (data: { title: string; description: string }) => {
  const response = await handleAPI(
    `${endpoints.rbac.resources.list}`,
    'POST',
    data
  );
  return response;
};

const useCreateResource = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (data: { title: string; description: string }) =>
      createResource(data),
    onSuccess: (response) => {
      handleSuccess(response, 'Resource created successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
      }, 1000);
    },
    onError: (error) => handleError(error),
  });
};

const updateResource = async (
  id: string,
  data: { title?: string; description?: string }
) => {
  const response = await handleAPI(
    `${endpoints.rbac.resources.detail(id)}`,
    'PUT',
    data
  );
  return response;
};

const useUpdateResource = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: { title?: string; description?: string };
    }) => updateResource(id, data),
    onSuccess: (response) => {
      handleSuccess(response, 'Resource updated successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
      }, 1000);
    },
    onError: (error) => handleError(error),
  });
};

const deleteResource = async (id: string) => {
  const response = await handleAPI(
    `${endpoints.rbac.resources.detail(id)}`,
    'DELETE'
  );
  return response;
};

const useDeleteResource = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: (id: string) => deleteResource(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['resources', 'list'] });
      const previousData =
        queryClient.getQueriesData<FetchResourcesListResponse>({
          queryKey: ['resources', 'list'],
        });
      queryClient.setQueriesData<FetchResourcesListResponse>(
        { queryKey: ['resources', 'list'] },
        (oldData) => {
          if (!oldData) return oldData;
          return {
            ...oldData,
            results: oldData.results.filter((r) => r.id !== id),
          };
        }
      );
      return { previousData };
    },
    onSuccess: (response) => {
      handleSuccess(response, 'Resource deleted successfully');
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['resources', 'list'] });
      }, 1000);
    },
    onError: (error, _id, context) => {
      if (context?.previousData) {
        context.previousData.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      handleError(error);
    },
  });
};

// ============================================================================
// USER EFFECTIVE PERMISSIONS
// ============================================================================

const fetchUserEffectivePermissions = async (
  userId: string
): Promise<UserEffectivePermissionsResponse> => {
  if (!endpoints.rbac.utils.effectivePermissions) {
    throw new Error(ERROR_MESSAGE.ENPOINT_ERROR);
  }
  const response = await handleAPI(
    `${endpoints.rbac.utils.effectivePermissions(userId)}`,
    'GET'
  );
  return response.data;
};

const useUserEffectivePermissions = (userId: string, refreshKey: number) => {
  return useQuery<UserEffectivePermissionsResponse, Error>({
    queryKey: ['user-permissions', 'effective', userId, refreshKey],
    queryFn: () => fetchUserEffectivePermissions(userId),
    enabled: !!userId,
    staleTime: 60000,
  });
};

// ============================================================================
// ASSIGN/REMOVE ROLE TO/FROM USER
// ============================================================================

const assignRoleToUser = async (data: { user_id: string; role_id: string }) => {
  const response = await handleAPI(
    `${endpoints.rbac.userRoles.assign}`,
    'POST',
    data
  );
  return response;
};

const useAssignRoleToUser = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (data: { user_id: string; role_id: string }) => {
      return assignRoleToUser(data);
    },
    onSuccess: async (response, variables) => {
      handleSuccess(response, 'Role assigned to user successfully');

      queryClient.invalidateQueries({
        queryKey: ['user-permissions', 'effective', variables.user_id],
      });

      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

const removeRoleFromUser = async (data: {
  user_id: string;
  role_id: string;
}) => {
  const response = await handleAPI(
    `${endpoints.rbac.userRoles.remove}`,
    'DELETE',
    data
  );
  return response;
};

const useRemoveRoleFromUser = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (data: { user_id: string; role_id: string }) => {
      return removeRoleFromUser(data);
    },
    onSuccess: async (response, variables) => {
      handleSuccess(response, 'Role removed from user successfully');

      queryClient.invalidateQueries({
        queryKey: ['user-permissions', 'effective', variables.user_id],
      });

      queryClient.invalidateQueries({ queryKey: ['me'] });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// ============================================================================
// ROLE PERMISSIONS (fetch what a role has)
// ============================================================================

export interface RolePermissionEntry {
  id: string;
  role_id: string;
  permission_id: string;
  resource_id: string;
  permission: {
    id: string;
    action: string;
    description: string;
  };
  resource: {
    id: string;
    title: string;
    description: string;
  };
  created_at: string;
}

const fetchRolePermissions = async (
  roleId: string
): Promise<RolePermissionEntry[]> => {
  const response = await handleAPI(
    `${endpoints.rbac.rolePermissions.list(roleId)}`,
    'GET'
  );
  return response.data ?? [];
};

const useRolePermissions = (roleId: string, enabled = true) => {
  return useQuery<RolePermissionEntry[], Error>({
    queryKey: ['roles', 'permissions', roleId],
    queryFn: () => fetchRolePermissions(roleId),
    enabled: !!roleId && enabled,
    staleTime: 30000,
  });
};

// ============================================================================
// ASSIGN/REMOVE PERMISSIONS TO/FROM ROLE
// ============================================================================

const assignPermissionsToRole = async (
  roleId: string,
  data: { permission_ids: string[]; resource_id: string }
) => {
  const response = await handleAPI(
    `${endpoints.rbac.rolePermissions.assign(roleId)}`,
    'POST',
    data
  );
  return response;
};

const useAssignPermissionsToRole = (roleId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (data: {
      permission_ids: string[];
      resource_id: string;
    }) => {
      return assignPermissionsToRole(roleId, data);
    },
    onSuccess: async (response) => {
      handleSuccess(response, 'Permissions assigned to role successfully');

      queryClient.invalidateQueries({
        queryKey: ['roles', 'permissions', roleId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-permissions', 'effective'],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

const removePermissionsFromRole = async (
  roleId: string,
  data: { permission_ids: string[]; resource_id: string }
) => {
  const response = await handleAPI(
    `${endpoints.rbac.rolePermissions.remove(roleId)}`,
    'DELETE',
    data
  );
  return response;
};

const useRemovePermissionsFromRole = (roleId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation({
    mutationFn: async (data: {
      permission_ids: string[];
      resource_id: string;
    }) => {
      return removePermissionsFromRole(roleId, data);
    },
    onSuccess: async (response) => {
      handleSuccess(response, 'Permissions removed from role successfully');

      queryClient.invalidateQueries({
        queryKey: ['roles', 'permissions', roleId],
      });

      queryClient.invalidateQueries({
        queryKey: ['user-permissions', 'effective'],
      });
    },
    onError: (error) => {
      handleError(error);
    },
  });
};

// Export all hooks
export {
  // Roles
  useRoles,
  useRoleDetail,
  useCreateRole,
  useUpdateRole,
  useDeleteRole,
  // Permissions
  usePermissions,
  useCreatePermission,
  useUpdatePermission,
  useDeletePermission,
  // Resources
  useResources,
  useCreateResource,
  useUpdateResource,
  useDeleteResource,
  // Role Permissions
  useRolePermissions,
  // User Permissions
  useUserEffectivePermissions,
  // User Role Assignment
  useAssignRoleToUser,
  useRemoveRoleFromUser,
  // Role Permission Assignment
  useAssignPermissionsToRole,
  useRemovePermissionsFromRole,
};
