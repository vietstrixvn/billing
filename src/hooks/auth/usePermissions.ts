import { useMemo } from 'react';
import { useCurrentUser } from './useCurrentUser';

type Resource =
  | 'property'
  | 'admin_user'
  | 'gallery'
  | 'portfolio'
  | 'ticket'
  | 'audit'
  | 'monitor'
  | 'rbac'
  | 'session'
  | 'type'
  | 'property_config'
  | 'property_user'
  | 'billing'
  | 'analytic';

type Action = 'create' | 'read' | 'update' | 'delete' | 'suspend';

/**
 * Hook để kiểm tra quyền của user hiện tại
 *
 * @example
 * const { can, hasAnyPermission, hasAllPermissions, isLoading } = usePermissions();
 *
 * if (can('property', 'create')) {
 *   // Show create button
 * }
 */
export function usePermissions() {
  const { data: user, isLoading } = useCurrentUser();

  const permissions = useMemo(() => user?.permissions || {}, [user]);
  const isSuperAdmin = useMemo(
    () => user?.roles?.includes('super_admin'),
    [user]
  );

  /**
   * Kiểm tra user có quyền thực hiện action trên resource không
   * Super admin bypass tất cả check
   */
  const can = (resource: Resource, action: Action): boolean => {
    // Super admin có full quyền
    if (isSuperAdmin) return true;

    if (!permissions[resource]) return false;
    return permissions[resource]?.includes(action) || false;
  };

  /**
   * Kiểm tra user có ít nhất một trong các quyền được chỉ định
   */
  const hasAnyPermission = (
    checks: Array<{ resource: Resource; action: Action }>
  ): boolean => {
    return checks.some(({ resource, action }) => can(resource, action));
  };

  /**
   * Kiểm tra user có tất cả các quyền được chỉ định
   */
  const hasAllPermissions = (
    checks: Array<{ resource: Resource; action: Action }>
  ): boolean => {
    return checks.every(({ resource, action }) => can(resource, action));
  };

  /**
   * Kiểm tra user có quyền truy cập resource (bất kỳ action nào)
   */
  const canAccess = (resource: Resource): boolean => {
    return !!permissions[resource] && permissions[resource]!.length > 0;
  };

  /**
   * Lấy tất cả actions user có thể thực hiện trên resource
   */
  const getResourceActions = (resource: Resource): Action[] => {
    // Super admin có tất cả actions
    if (isSuperAdmin) return ['create', 'read', 'update', 'delete', 'suspend'];
    return permissions[resource] || [];
  };

  return {
    can,
    hasAnyPermission,
    hasAllPermissions,
    canAccess,
    getResourceActions,
    permissions,
    isLoading,
    user,
    isSuperAdmin,
  };
}
