/**
 * Migration script for cleaning up deprecated fields from localStorage
 *
 * This migration removes server data (userInfo, refreshToken) from the auth-storage
 * and keeps only client state (accessToken, tokenExpiresAt).
 *
 * Requirements: 13.1, 13.2
 */

import { logDebug, logError, logWarn } from '@/utils';

const AUTH_STORAGE_KEY = 'auth-storage';

interface LegacyAuthState {
  accessToken?: string | null;
  tokenExpiresAt?: number | null;
  userInfo?: any; // Deprecated
  refreshToken?: string | null; // Deprecated
  [key: string]: any; // Other deprecated fields
}

interface CleanAuthState {
  accessToken: string | null;
  tokenExpiresAt: number | null;
}

/**
 * Migrates auth storage by removing deprecated fields
 *
 * Removes:
 * - userInfo (now managed by TanStack Query)
 * - refreshToken (now managed by HTTP-only cookies)
 * - Any other server data
 *
 * Keeps:
 * - accessToken (client state)
 * - tokenExpiresAt (client state)
 *
 * Handles corrupted data by clearing localStorage
 */
export function migrateAuthStorage(): void {
  // Only run in browser environment
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const authStorage = localStorage.getItem(AUTH_STORAGE_KEY);

    // No storage to migrate
    if (!authStorage) {
      logDebug('No auth storage found, skipping migration');
      return;
    }

    // Parse the storage
    let parsed: { state: LegacyAuthState };
    try {
      parsed = JSON.parse(authStorage);
    } catch (parseError) {
      // Corrupted data - clear it (Requirement: Handle corrupted data)
      logWarn('Corrupted auth storage detected, clearing localStorage');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    // Validate structure
    if (!parsed || typeof parsed !== 'object' || !parsed.state) {
      logWarn('Invalid auth storage structure, clearing localStorage');
      localStorage.removeItem(AUTH_STORAGE_KEY);
      return;
    }

    const legacyState = parsed.state;

    // Check if migration is needed
    const hasDeprecatedFields =
      'userInfo' in legacyState ||
      'refreshToken' in legacyState ||
      Object.keys(legacyState).some(
        (key) => key !== 'accessToken' && key !== 'tokenExpiresAt'
      );

    if (!hasDeprecatedFields) {
      logDebug('Auth storage already migrated, skipping');
      return;
    }

    // Create clean state with ONLY accessToken and tokenExpiresAt
    const cleanState: CleanAuthState = {
      accessToken: legacyState.accessToken || null,
      tokenExpiresAt: legacyState.tokenExpiresAt || null,
    };

    // Save migrated state
    const migratedStorage = {
      state: cleanState,
      version: 0, // Zustand persist version
    };

    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(migratedStorage));

    logDebug('Auth storage migrated successfully', {
      removed: Object.keys(legacyState).filter(
        (key) => key !== 'accessToken' && key !== 'tokenExpiresAt'
      ),
      kept: ['accessToken', 'tokenExpiresAt'],
    });
  } catch (error) {
    // Unexpected error during migration - clear storage to be safe
    logError('Failed to migrate auth storage:', error);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      logWarn('Cleared auth storage due to migration error');
    } catch (clearError) {
      logError('Failed to clear corrupted auth storage:', clearError);
    }
  }
}
