import { logError, logWarn } from '@/utils';
import { useAuthStore } from './store';
import { tokenManager } from './auth/tokenManager';

export const handleAuthError = (error: unknown): string => {
  if (error instanceof Error) {
    if (error.message.includes('Network')) {
      return 'Network connection error. Please check your internet connection.';
    }
    if (
      error.message.includes('401') ||
      error.message.includes('Unauthorized')
    ) {
      return 'Your session has expired. Please login again.';
    }
    if (error.message.includes('403') || error.message.includes('Forbidden')) {
      return 'You do not have permission to access this resource.';
    }
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'An unexpected error occurred. Please try again.';
};

export const fetchWithAuth = async (
  url: string,
  options: RequestInit & { skipAuth?: boolean; skipRefresh?: boolean } = {}
): Promise<Response | null> => {
  const headers = new Headers(options.headers);
  if (!headers.has('Content-Type')) {
    headers.append('Content-Type', 'application/json');
  }

  if (!headers.has('X-Billing-Scope')) {
    headers.set('X-Billing-Scope', 'partner');
  }

  if (!options.skipAuth && !headers.has('Authorization')) {
    const authState = useAuthStore.getState();
    const token =
      authState.accessToken || (await tokenManager.getAuthToken());
    if (token) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (response.status === 401 && !options.skipAuth) {
      logWarn('Unauthorized access detected, logging out...');
      const authStore = useAuthStore.getState();
      await authStore.logout();
      return null;
    }

    return response;
  } catch (error) {
    logError('Fetch with auth error:', error);
    throw new Error('Network error occurred');
  }
};

export const validateUserRole = (userRole: string): boolean => {
  const allowedRoles = ['admin', 'manager'];
  return allowedRoles.includes(userRole.toLowerCase());
};

export const handleApiResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `HTTP ${response.status}: ${response.statusText}`
    );
  }
  return response.json();
};
