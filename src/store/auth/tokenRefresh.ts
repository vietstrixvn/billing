/**
 * ==========================
 * 🔄 Token Refresh Logic
 * ==========================
 *
 * Handles token refresh operations
 */

import { logDebug, logError, logWarn } from '@/utils';
import { toast } from 'sonner';
import { AuthAPI } from '../api';
import { AUTH_CONFIG } from './constants';
import { refreshMutex } from './refreshMutex';
import { tokenManager } from './tokenManager';

let refreshTimer: NodeJS.Timeout | null = null;

/**
 * Refresh access token using refresh token
 */
export async function refreshToken(
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void,
  clearAccessToken: () => void
): Promise<void> {
  try {
    logDebug('[TokenRefresh] Attempting to refresh token...');

    const { response, data } = await AuthAPI.refreshToken();

    if (response.ok && data?.success && data?.data?.access_token) {
      const newAccessToken = data.data.access_token;
      const expiresIn = data.data.expires_in
        ? Number(data.data.expires_in)
        : 14400; // Get expires_in from server (default 4h)

      // Set token with expiry info from server
      setAccessTokenWithExpiry(newAccessToken, expiresIn);

      // Invalidate user query
      const { queryClient } = await import('@/libs');
      await queryClient.invalidateQueries({ queryKey: ['me'] });

      logDebug(
        `[TokenRefresh] Token refreshed successfully, expires in ${expiresIn}s (${Math.round(expiresIn / 60)} minutes)`
      );
      return;
    }

    // Auth error - clear token and redirect
    if (response.status === 401 || response.status === 403) {
      clearAccessToken();
      tokenManager.clearAll();
      throw new Error('Refresh token expired'); // ← chỉ throw, KHÔNG redirect ở đây
      // Để caller quyết định redirect
    }

    // Server error - throw to allow retry
    throw new Error(`Refresh failed with status ${response.status}`);
  } catch (error) {
    logError('[TokenRefresh] Token refresh error:', error);
    throw error;
  }
}

/**
 * Refresh token if needed with retry logic
 */
export async function refreshTokenIfNeeded(
  accessToken: string | null,
  shouldRefresh: () => boolean,
  refreshFn: () => Promise<void>,
  setRefreshing: (value: boolean) => void,
  retryCount = 0
): Promise<boolean> {
  // If no token in store, check tokenManager (memory/secureStorage)
  if (!accessToken) {
    const storedToken = await tokenManager.getAuthToken();

    if (storedToken) {
      // Token found in storage — sync it into the store
      const { useAuthStore } = await import('../store');
      const store = useAuthStore.getState();
      store.setAccessToken(storedToken);

      const freshShouldRefresh = useAuthStore.getState().shouldRefreshToken;
      if (!freshShouldRefresh()) return true; // token valid, no refresh needed
    } else {
      // No token anywhere (memory lost after reload, or never logged in).
      // Still attempt a refresh — the HttpOnly refresh-token cookie may be
      // valid and the server can issue a new access token.
      logDebug(
        '[TokenRefresh] No token in memory, attempting refresh via cookie...'
      );
      return refreshMutex.acquire(async () => {
        setRefreshing(true);
        try {
          await refreshFn();
          return true;
        } catch (error) {
          const msg = error instanceof Error ? error.message : String(error);
          if (msg.includes('expired')) return false;
          // Network/server error — retry
          if (retryCount < AUTH_CONFIG.MAX_REFRESH_RETRIES - 1) {
            await new Promise((r) => setTimeout(r, AUTH_CONFIG.RETRY_DELAY));
            return refreshTokenIfNeeded(
              null,
              shouldRefresh,
              refreshFn,
              setRefreshing,
              retryCount + 1
            );
          }
          return false;
        } finally {
          setRefreshing(false);
        }
      });
    }
  }

  // If token is still valid, no refresh needed
  if (!shouldRefresh()) {
    logDebug('[TokenRefresh] Token still valid, no refresh needed');
    return true;
  }

  // Use mutex to handle concurrent refresh requests
  return refreshMutex.acquire(async () => {
    // Double-check after acquiring mutex
    if (!shouldRefresh()) {
      logDebug('[TokenRefresh] Token refreshed by another request');
      return true;
    }

    setRefreshing(true);

    const doRefresh = async (attempt: number): Promise<boolean> => {
      try {
        logDebug(
          `[TokenRefresh] Attempting token refresh... (attempt ${
            attempt + 1
          }/${AUTH_CONFIG.MAX_REFRESH_RETRIES})`
        );

        await refreshFn();
        setRefreshing(false);
        return true;
      } catch (error) {
        // Check if it's an auth error (401/403) - don't retry
        const errorMessage =
          error instanceof Error ? error.message : String(error);
        if (errorMessage.includes('expired')) {
          setRefreshing(false);
          return false;
        }

        // Retry with delay for other errors
        if (attempt < AUTH_CONFIG.MAX_REFRESH_RETRIES - 1) {
          logWarn(
            `[TokenRefresh] Refresh failed, retrying in ${AUTH_CONFIG.RETRY_DELAY}ms... (attempt ${
              attempt + 1
            }/${AUTH_CONFIG.MAX_REFRESH_RETRIES})`,
            error
          );
          await new Promise((resolve) =>
            setTimeout(resolve, AUTH_CONFIG.RETRY_DELAY)
          );
          return doRefresh(attempt + 1);
        }

        logError(
          `[TokenRefresh] Token refresh failed after ${AUTH_CONFIG.MAX_REFRESH_RETRIES} attempts:`,
          error
        );
        setRefreshing(false);
        return false;
      }
    };

    try {
      return await doRefresh(retryCount);
    } finally {
      setRefreshing(false);
    }
  });
}

/**
 * Schedule automatic token refresh
 */
export function scheduleTokenRefresh(
  tokenExpiresAt: number | null,
  refreshFn: () => Promise<boolean>,
  handleAuthFailure: () => void,
  reschedule: () => void
): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }

  if (!tokenExpiresAt) {
    logWarn('[TokenRefresh] Cannot schedule refresh: no token expiry time');
    return;
  }

  const now = Date.now();
  const bufferMs = AUTH_CONFIG.REFRESH_BUFFER * 1000;
  const refreshAt = tokenExpiresAt - bufferMs;
  const refreshIn = Math.max(refreshAt - now, 0);

  // If token is already expired, handle auth failure immediately
  if (now >= tokenExpiresAt) {
    logWarn('[TokenRefresh] Token already expired, logging out');
    handleAuthFailure();
    if (
      AUTH_CONFIG.IS_CLIENT &&
      !window.location.pathname.includes('/sign-in')
    ) {
      window.location.href = '/sign-in';
    }
    return;
  }

  // If token is already near expiry or expired, refresh immediately
  if (refreshIn === 0) {
    logDebug(
      '[TokenRefresh] Token already near expiry, refreshing immediately'
    );
    refreshFn().then((success) => {
      if (success) {
        reschedule();
      } else {
        logWarn('[TokenRefresh] Immediate refresh failed, logging out');
        handleAuthFailure();
        if (
          AUTH_CONFIG.IS_CLIENT &&
          !window.location.pathname.includes('/sign-in')
        ) {
          window.location.href = '/sign-in';
        }
      }
    });
    return;
  }

  logDebug(
    `[TokenRefresh] Scheduling token refresh in ${Math.round(
      refreshIn / 1000 / 60
    )} minutes`
  );

  refreshTimer = setTimeout(async () => {
    try {
      const success = await refreshFn();
      if (success) {
        logDebug('[TokenRefresh] Auto-refresh successful');
        reschedule();
      } else {
        // Handle refresh failure
        logWarn('[TokenRefresh] Auto-refresh failed, logging out');
        toast.warning('Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại');
        handleAuthFailure();
        if (
          AUTH_CONFIG.IS_CLIENT &&
          !window.location.pathname.includes('/sign-in')
        ) {
          window.location.href = '/sign-in';
        }
      }
    } catch (error) {
      logError('[TokenRefresh] Auto-refresh error:', error);
      // Don't retry on error, logout instead
      handleAuthFailure();
      if (
        AUTH_CONFIG.IS_CLIENT &&
        !window.location.pathname.includes('/sign-in')
      ) {
        window.location.href = '/sign-in';
      }
    }
  }, refreshIn);
}

/**
 * Clear scheduled token refresh
 */
export function clearTokenRefresh(): void {
  if (refreshTimer) {
    clearTimeout(refreshTimer);
    refreshTimer = null;
  }
}
