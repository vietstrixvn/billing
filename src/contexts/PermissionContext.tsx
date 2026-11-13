'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from '@/hooks/auth/usePermissions';

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

interface PermissionContextValue {
  can: (resource: Resource, action: Action) => boolean;
  hasAnyPermission: (
    checks: Array<{ resource: Resource; action: Action }>
  ) => boolean;
  hasAllPermissions: (
    checks: Array<{ resource: Resource; action: Action }>
  ) => boolean;
  canAccess: (resource: Resource) => boolean;
  getResourceActions: (resource: Resource) => Action[];
  isLoading: boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(
  undefined
);

interface PermissionProviderProps {
  children: ReactNode;
  fallback?: ReactNode;
}

/**
 * Provider để cung cấp permission context cho toàn bộ app
 * Nên wrap ở root level sau khi user đã login
 *
 * @example
 * <PermissionProvider fallback={<LoadingScreen />}>
 *   <App />
 * </PermissionProvider>
 */
export function PermissionProvider({
  children,
  fallback,
}: PermissionProviderProps) {
  const permissionHook = usePermissions();

  // Show loading state while fetching user permissions
  if (permissionHook.isLoading && fallback) {
    return <>{fallback}</>;
  }

  return (
    <PermissionContext.Provider value={permissionHook}>
      {children}
    </PermissionContext.Provider>
  );
}

/**
 * Hook để sử dụng permission context
 * Phải được sử dụng bên trong PermissionProvider
 */
export function usePermissionContext() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error(
      'usePermissionContext must be used within PermissionProvider'
    );
  }
  return context;
}
