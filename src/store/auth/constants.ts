/**
 * ==========================
 *  Auth Constants
 * ==========================
 *
 * Centralized constants for authentication
 */

export const AUTH_CONFIG = {
  // Token refresh settings
  REFRESH_BUFFER: 1800, // 30 minutes (1800 seconds) before expiry to refresh
  MAX_REFRESH_RETRIES: 3,
  RETRY_DELAY: 2000, // milliseconds

  // Storage keys
  STORAGE_KEY: 'auth-storage',
  COOKIE_KEY: 'isAuthenticated',

  // Token settings
  ACCESS_TOKEN_MAX_AGE: 14400, // 4 hours in seconds (from server)
  REFRESH_TOKEN_MAX_AGE: 6, // 6 days (for cookie expiry)

  // Environment
  IS_PROD: process.env.NODE_ENV === 'production',
  IS_CLIENT: typeof window !== 'undefined',
} as const;
