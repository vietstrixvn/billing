/**
 * ==========================
 * 🎫 Token Helper Functions
 * ==========================
 *
 * Utility functions for token management
 */

import { logError, logWarn } from '@/utils';
import { AUTH_CONFIG } from './constants';

/**
 * Extract expiry timestamp from JWT token
 * @param token - JWT token string
 * @returns Expiry timestamp in milliseconds or null if invalid
 */
export function getTokenExpiryFromJWT(token: string): number | null {
  try {
    if (!token || typeof token !== 'string') return null;

    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const payload = JSON.parse(atob(parts[1]));
    return payload.exp ? payload.exp * 1000 : null;
  } catch {
    logWarn('[TokenHelpers] Failed to decode JWT token');
    return null;
  }
}

/**
 * Calculate token expiry from expires_in value
 * @param expiresIn - Expiry duration in seconds from server
 * @returns Expiry timestamp in milliseconds
 */
export function calculateTokenExpiry(expiresIn: number): number {
  return Date.now() + expiresIn * 1000;
}

/**
 * Check if token is near expiry (within buffer period)
 */
export function isTokenNearExpiry(
  tokenExpiresAt: number | null,
  accessToken: string | null
): boolean {
  if (!accessToken || !tokenExpiresAt) return true;

  const now = Date.now();
  const bufferMs = AUTH_CONFIG.REFRESH_BUFFER * 1000;

  // Near expiry = within buffer period but not yet expired
  return tokenExpiresAt - now <= bufferMs && tokenExpiresAt > now;
}

/**
 * Check if token is expired
 */
export function isTokenExpired(
  tokenExpiresAt: number | null,
  accessToken: string | null
): boolean {
  if (!accessToken || !tokenExpiresAt) return true;
  return Date.now() >= tokenExpiresAt;
}

/**
 * Check if token should be refreshed
 */
export function shouldRefreshToken(
  tokenExpiresAt: number | null,
  accessToken: string | null
): boolean {
  if (!accessToken) return false; // No token = no need to refresh

  return (
    isTokenExpired(tokenExpiresAt, accessToken) ||
    isTokenNearExpiry(tokenExpiresAt, accessToken)
  );
}

/**
 * Setup visibility listener for tab focus
 */
export function setupVisibilityListener(
  onVisible: () => void
): (() => void) | undefined {
  if (!AUTH_CONFIG.IS_CLIENT) return;

  const handleVisibilityChange = () => {
    if (document.visibilityState === 'visible') {
      onVisible();
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () =>
    document.removeEventListener('visibilitychange', handleVisibilityChange);
}

/**
 * Setup periodic token check
 * Checks token expiry every minute and triggers refresh/logout if needed
 */
export function setupPeriodicTokenCheck(
  shouldRefresh: () => boolean,
  isTokenExpired: () => boolean,
  refreshTokenIfNeeded: () => Promise<boolean>,
  handleAuthFailure: () => void
): (() => void) | undefined {
  if (!AUTH_CONFIG.IS_CLIENT) return;

  const CHECK_INTERVAL = 60000; // Check every 1 minute

  const intervalId = setInterval(async () => {
    // Check if token is expired
    if (isTokenExpired()) {
      const success = await refreshTokenIfNeeded();

      if (!success) {
        logError('[TokenCheck] Token refresh failed, logging out');
        handleAuthFailure();

        // Redirect to login if not already there
        if (!window.location.pathname.includes('/sign-in')) {
          window.location.href = '/sign-in';
        }
      }
    } else if (shouldRefresh()) {
      await refreshTokenIfNeeded();
    }
  }, CHECK_INTERVAL);

  return () => clearInterval(intervalId);
}
