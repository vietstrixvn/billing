'use client';

import { ReactNode, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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

interface ProtectedRouteProps {
  children: ReactNode;
  resource: Resource;
  action: Action;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Component để bảo vệ route dựa trên quyền
 * Redirect user nếu không có quyền
 *
 * @example
 * <ProtectedRoute resource="admin_user" action="read" redirectTo="/unauthorized">
 *   <AdminUserPage />
 * </ProtectedRoute>
 */
export function ProtectedRoute({
  children,
  resource,
  action,
  redirectTo = '/unauthorized',
  fallback = null,
}: ProtectedRouteProps) {
  const { can, isLoading } = usePermissionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !can(resource, action)) {
      router.push(redirectTo);
    }
  }, [can, resource, action, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!can(resource, action)) {
    return null;
  }

  return <>{children}</>;
}

interface MultiPermissionRouteProps {
  children: ReactNode;
  permissions: Array<{ resource: Resource; action: Action }>;
  requireAll?: boolean;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Component để bảo vệ route với nhiều quyền
 *
 * @example
 * <MultiPermissionRoute
 *   permissions={[
 *     { resource: 'property', action: 'read' },
 *     { resource: 'gallery', action: 'read' }
 *   ]}
 *   requireAll
 * >
 *   <PropertyGalleryPage />
 * </MultiPermissionRoute>
 */
export function MultiPermissionRoute({
  children,
  permissions,
  requireAll = false,
  redirectTo = '/unauthorized',
  fallback = null,
}: MultiPermissionRouteProps) {
  const { hasAnyPermission, hasAllPermissions, isLoading } =
    usePermissionContext();
  const router = useRouter();

  const hasPermission = requireAll
    ? hasAllPermissions(permissions)
    : hasAnyPermission(permissions);

  useEffect(() => {
    if (!isLoading && !hasPermission) {
      router.push(redirectTo);
    }
  }, [hasPermission, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!hasPermission) {
    return null;
  }

  return <>{children}</>;
}

interface ResourceRouteProps {
  children: ReactNode;
  resource: Resource;
  redirectTo?: string;
  fallback?: ReactNode;
}

/**
 * Component để bảo vệ route dựa trên quyền truy cập resource
 *
 * @example
 * <ResourceRoute resource="monitor">
 *   <MonitorPage />
 * </ResourceRoute>
 */
export function ResourceRoute({
  children,
  resource,
  redirectTo = '/unauthorized',
  fallback = null,
}: ResourceRouteProps) {
  const { canAccess, isLoading } = usePermissionContext();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !canAccess(resource)) {
      router.push(redirectTo);
    }
  }, [canAccess, resource, isLoading, router, redirectTo]);

  if (isLoading) {
    return <>{fallback}</>;
  }

  if (!canAccess(resource)) {
    return null;
  }

  return <>{children}</>;
}
