'use client';

import { ReactNode } from 'react';
import { usePermissionContext } from '@/contexts/PermissionContext';

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

interface PermissionGateProps {
  children: ReactNode;
  resource: Resource;
  action: Action;
  fallback?: ReactNode;
}

/**
 * Component để ẩn/hiện UI dựa trên quyền
 *
 * @example
 * <PermissionGate resource="property" action="create">
 *   <CreateButton />
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  resource,
  action,
  fallback = null,
}: PermissionGateProps) {
  const { can } = usePermissionContext();

  if (!can(resource, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface MultiPermissionGateProps {
  children: ReactNode;
  permissions: Array<{ resource: Resource; action: Action }>;
  requireAll?: boolean;
  fallback?: ReactNode;
}

/**
 * Component để kiểm tra nhiều quyền cùng lúc
 *
 * @example
 * // Cần ít nhất 1 quyền
 * <MultiPermissionGate permissions={[
 *   { resource: 'property', action: 'create' },
 *   { resource: 'property', action: 'update' }
 * ]}>
 *   <EditButton />
 * </MultiPermissionGate>
 *
 * // Cần tất cả quyền
 * <MultiPermissionGate
 *   permissions={[...]}
 *   requireAll
 * >
 *   <AdminPanel />
 * </MultiPermissionGate>
 */
export function MultiPermissionGate({
  children,
  permissions,
  requireAll = false,
  fallback = null,
}: MultiPermissionGateProps) {
  const { hasAnyPermission, hasAllPermissions } = usePermissionContext();

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  if (!hasPermission) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

interface ResourceGateProps {
  children: ReactNode;
  resource: Resource;
  fallback?: ReactNode;
}

/**
 * Component để kiểm tra quyền truy cập resource (bất kỳ action nào)
 *
 * @example
 * <ResourceGate resource="monitor">
 *   <MonitorDashboard />
 * </ResourceGate>
 */
export function ResourceGate({
  children,
  resource,
  fallback = null,
}: ResourceGateProps) {
  const { canAccess } = usePermissionContext();

  if (!canAccess(resource)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
