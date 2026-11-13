/**
 * ==========================
 * Auth Initializer
 * ==========================
 *
 * Handles authentication initialization on app start
 */

import { logDebug, logWarn } from '@/utils';
import { CookieManager } from '../cookies';
import { AUTH_CONFIG } from './constants';
import {
  getTokenExpiryFromJWT,
  setupPeriodicTokenCheck,
  setupVisibilityListener,
} from './tokenHelpers';
import { tokenManager } from './tokenManager';

/**
 * Initialize authentication from stored data
 */
export async function initializeAuth(
  getState: () => any,
  setState: (state: any) => void,
  refreshTokenIfNeeded: () => Promise<boolean>,
  scheduleRefresh: () => void,
  handleFailure: () => void,
  shouldRefresh: () => boolean
): Promise<void> {
  // Safety timeout - ensure isInitializing is set to false after max 5 seconds
  const safetyTimeout = setTimeout(() => {
    logWarn(
      '[AuthInit] Safety timeout reached, forcing initialization to complete'
    );
    setState({ isInitializing: false });
  }, 5000);

  try {
    setState({ isInitializing: true });

    // Skip initialization on sign-in page
    if (
      typeof window !== 'undefined' &&
      (window.location.pathname === '/sign-in' ||
        window.location.pathname === '/sign-in' ||
        window.location.pathname.startsWith('/sign-'))
    ) {
      logDebug('[AuthInit] On sign-in page, skipping auth initialization');
      clearTimeout(safetyTimeout);
      setState({ isInitializing: false });
      return;
    }

    // Wait for Zustand hydration to complete
    const maxWaitTime = 1000; // 1 second max wait
    const startTime = Date.now();
    while (!getState()._hasHydrated && Date.now() - startTime < maxWaitTime) {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }

    if (!getState()._hasHydrated) {
      logWarn('[AuthInit] Hydration timeout, proceeding anyway');
    }

    // Try to get token from memory / secureStorage first
    let alreadyRefreshed = false;
    const storedToken = await tokenManager.getAuthToken();

    if (!storedToken) {
      // Token not in memory (e.g. in-memory key was lost after reload).
      // The HttpOnly refresh-token cookie may still be valid — try a refresh
      // before deciding the user is logged out.
      logDebug(
        '[AuthInit] No token in memory, attempting refresh via cookie...'
      );
      const refreshed = await refreshTokenIfNeeded();

      if (!refreshed) {
        logDebug('[AuthInit] Refresh failed — user needs to login');
        clearTimeout(safetyTimeout);
        setState({ isInitializing: false });
        return;
      }

      alreadyRefreshed = true;
      // Refresh succeeded — token is now in memory via setAccessTokenWithExpiry.
      // Fall through to the rest of the initialization (scheduleRefresh, etc.)
      logDebug('[AuthInit] Session recovered via refresh token cookie');
    } else {
      // Token found in memory/secureStorage — restore it into the store
      const expiresAt = getTokenExpiryFromJWT(storedToken);
      setState({ accessToken: storedToken, tokenExpiresAt: expiresAt });
      logDebug('[AuthInit] Auth token restored from secure storage');
    }

    // Setup visibility listener - refresh when user returns to tab
    setupVisibilityListener(() => {
      if (shouldRefresh()) {
        logDebug('[AuthInit] Tab became visible, checking token...');
        refreshTokenIfNeeded();
      }
    });

    // Setup periodic token check - check every minute
    setupPeriodicTokenCheck(
      shouldRefresh,
      () => {
        const state = getState();
        return (
          !state.accessToken ||
          !state.tokenExpiresAt ||
          Date.now() >= state.tokenExpiresAt
        );
      },
      refreshTokenIfNeeded,
      handleFailure
    );

    // Refresh token if near expiry (skip if we already refreshed above)
    const refreshSuccess = alreadyRefreshed || (await refreshTokenIfNeeded());

    if (!refreshSuccess) {
      const currentState = getState();

      // If we still have a token and it's not expired, we can continue
      if (currentState.accessToken && currentState.tokenExpiresAt) {
        if (Date.now() < currentState.tokenExpiresAt) {
          logWarn(
            '[AuthInit] Refresh failed but token still valid, continuing with existing token'
          );
        } else {
          logWarn('[AuthInit] Token expired and refresh failed');
          clearTimeout(safetyTimeout);
          handleFailure();
          return;
        }
      } else {
        logWarn('[AuthInit] No valid token available');
        clearTimeout(safetyTimeout);
        handleFailure();
        return;
      }
    }

    // Invalidate user query to trigger fetch
    const { queryClient } = await import('@/libs');
    await queryClient.invalidateQueries({ queryKey: ['me'] });

    CookieManager.set(AUTH_CONFIG.COOKIE_KEY, 'true', {
      expires: AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE,
      secure: AUTH_CONFIG.IS_PROD,
      sameSite: 'Lax',
    });

    scheduleRefresh();
    logDebug('[AuthInit] Session restored successfully');
    setState({ isInitializing: false });
  } catch (error) {
    logWarn('[AuthInit] Failed to restore session:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (!errorMessage.includes('Network') && !errorMessage.includes('fetch')) {
      handleFailure();
    }
    setState({ isInitializing: false });
  } finally {
    // Clear safety timeout and ensure isInitializing is always set to false
    clearTimeout(safetyTimeout);
    setState({ isInitializing: false });
  }
}

/**
 * Verify authentication and refresh if needed
 */
export async function verifyAndRefreshAuth(
  refreshTokenIfNeeded: () => Promise<boolean>,
  handleFailure: () => void,
  scheduleRefresh: () => void,
  getState: () => any,
  setState: (state: any) => void,
  requiredRole?: string
): Promise<boolean> {
  try {
    setState({ loading: true });

    const refreshSuccess = await refreshTokenIfNeeded();

    if (!refreshSuccess) {
      const currentState = getState();

      if (!currentState.accessToken) {
        logWarn('[AuthVerify] No access token available');
        handleFailure();
        return false;
      }

      // Check if token is still valid
      if (
        currentState.tokenExpiresAt &&
        Date.now() < currentState.tokenExpiresAt
      ) {
        logWarn(
          '[AuthVerify] Refresh failed but token still valid, continuing...'
        );
      } else {
        logWarn('[AuthVerify] Token expired and refresh failed');
        handleFailure();
        return false;
      }
    }

    const { AuthAPI } = await import('../api');
    const { response, data } = await AuthAPI.getCurrentUser();

    if (response.status === 401 || response.status === 403) {
      logWarn('[AuthVerify] User info request unauthorized');
      handleFailure();
      return false;
    }

    if (response.status !== 200 || !data?.data) {
      logWarn('[AuthVerify] Failed to fetch user info');
      if (response.status >= 500) {
        const { toast } = await import('sonner');
        toast.error('Server error, please try again later');
        return false;
      }
      handleFailure();
      return false;
    }

    const userInfo = data.data;
    const userRole = userInfo.role;

    if (requiredRole) {
      const allowedRoles =
        requiredRole === 'Auth' ? ['Auth'] : ['Auth', 'manager', 'user'];

      if (!allowedRoles.includes(userRole)) {
        logWarn(
          `[AuthVerify] Unauthorized role: ${userRole}. Required: ${requiredRole}`
        );
        setState({ loading: false });
        return false;
      }
    }

    CookieManager.set(AUTH_CONFIG.COOKIE_KEY, 'true', {
      expires: AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE,
      secure: AUTH_CONFIG.IS_PROD,
      sameSite: 'Lax',
    });

    setState({ loading: false });
    scheduleRefresh();
    return true;
  } catch (error) {
    logWarn('[AuthVerify] Auth verification failed:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    if (errorMessage.includes('Network') || errorMessage.includes('fetch')) {
      const { toast } = await import('sonner');
      toast.error('Network error, please check connection');
      return false;
    }
    handleFailure();
    return false;
  } finally {
    setState({ loading: false });
  }
}
