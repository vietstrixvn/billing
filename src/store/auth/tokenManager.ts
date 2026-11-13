/**
 * ==========================
 * 🔐 Secure Token Manager
 * ==========================
 *
 * Enhanced token management with security features:
 * - Memory-first storage (XSS protection)
 * - Token fingerprinting (theft detection)
 * - Automatic validation before use
 * - Secure token lifecycle management
 */

import { tokenSecurity } from './tokenSecurity';
import { secureStorage } from './secureStorage';
import { logDebug, logWarn } from '@/utils';

class TokenManager {
  private adminToken: string | null = null;
  private userToken: string | null = null;
  private tokenExpiresAt: number | null = null; // Store expiry timestamp
  private listeners: Set<() => void> = new Set();
  private readonly TOKEN_STORAGE_KEY = '_at'; // Obfuscated key name
  private readonly TOKEN_EXPIRY_KEY = '_te'; // Token expiry key

  /**
   * Set auth token with security validation
   */
  setAuthToken(token: string | null, expiresIn?: number) {
    if (token) {
      // Calculate expiry timestamp
      if (expiresIn) {
        this.tokenExpiresAt = Date.now() + expiresIn * 1000;
      }

      // Register token with security manager
      tokenSecurity.registerToken(token);

      // Store in memory (primary)
      this.adminToken = token;

      // Store encrypted in secure storage (backup for page refresh)
      // Fire and forget - don't block on encryption
      secureStorage
        .setItem(this.TOKEN_STORAGE_KEY, token, {
          encrypt: true,
          memoryOnly: false,
          expiresIn: expiresIn || 14400, // Use provided expiresIn or default 4 hours
        })
        .catch((error) => {
          logWarn('[TokenManager] Failed to encrypt token:', error);
        });

      // Store expiry timestamp
      if (this.tokenExpiresAt) {
        secureStorage
          .setItem(this.TOKEN_EXPIRY_KEY, this.tokenExpiresAt.toString(), {
            encrypt: false,
            memoryOnly: false,
          })
          .catch((error) => {
            logWarn('[TokenManager] Failed to store token expiry:', error);
          });
      }

      logDebug('[TokenManager] Token stored securely');
    } else {
      this.clearAuthToken();
    }

    this.notifyListeners();
  }

  /**
   * Get auth token with security validation
   */
  async getAuthToken(): Promise<string | null> {
    // Try memory first (fastest)
    if (this.adminToken) {
      // Validate token security
      if (!tokenSecurity.validateToken(this.adminToken)) {
        logWarn('[TokenManager] Token validation failed');
        this.clearAuthToken();
        return null;
      }
      return this.adminToken;
    }

    // Fallback to secure storage (page refresh scenario)
    const storedToken = await secureStorage.getItem(this.TOKEN_STORAGE_KEY);
    if (storedToken) {
      // Restore expiry timestamp
      const storedExpiry = await secureStorage.getItem(this.TOKEN_EXPIRY_KEY);
      if (storedExpiry) {
        this.tokenExpiresAt = parseInt(storedExpiry, 10);
      }

      // ✅ FIX: Re-register token after page refresh
      // tokenMetadata is lost on refresh (memory-only), so we need to re-register
      tokenSecurity.registerToken(storedToken);

      // Now validate with fresh metadata
      if (tokenSecurity.validateToken(storedToken)) {
        this.adminToken = storedToken;
        logDebug('[TokenManager] Token restored from secure storage');
        return storedToken;
      } else {
        logWarn('[TokenManager] Stored token validation failed');
        this.clearAuthToken();
      }
    } else {
      logDebug('[TokenManager] No token found in secure storage');
    }

    return null;
  }

  /**
   * Get auth token synchronously (memory only)
   * Use this when you need immediate access and can't await
   * Returns null if token is not in memory
   */
  getAuthTokenSync(): string | null {
    if (this.adminToken && tokenSecurity.validateToken(this.adminToken)) {
      return this.adminToken;
    }
    return null;
  }

  /**
   * Check if token needs rotation
   */
  needsRotation(): boolean {
    if (!this.adminToken) return false;
    return tokenSecurity.needsRotation(this.adminToken);
  }

  /**
   * Clear auth token from all storage layers
   */
  clearAuthToken(): void {
    if (this.adminToken) {
      tokenSecurity.revokeToken(this.adminToken);
    }

    this.adminToken = null;
    this.tokenExpiresAt = null;
    secureStorage.removeItem(this.TOKEN_STORAGE_KEY);
    secureStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    logDebug('[TokenManager] Token cleared from all storage');
  }

  /**
   * Check if authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAuthToken();
    return token !== null;
  }

  /**
   * Check if authenticated (synchronous, memory only)
   */
  isAuthenticatedSync(): boolean {
    return this.getAuthTokenSync() !== null;
  }

  /**
   * Subscribe to token changes
   */
  subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Notify all listeners about token changes
   */
  private notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }

  /**
   * Clear all tokens and security data
   */
  clearAll() {
    if (this.adminToken) {
      tokenSecurity.revokeToken(this.adminToken);
    }
    if (this.userToken) {
      tokenSecurity.revokeToken(this.userToken);
    }

    this.adminToken = null;
    this.userToken = null;
    this.tokenExpiresAt = null;
    secureStorage.clear();
    tokenSecurity.clearAll();

    this.notifyListeners();
    logDebug('[TokenManager] All tokens and security data cleared');
  }

  /**
   * Get token expiry timestamp
   */
  getTokenExpiry(): number | null {
    return this.tokenExpiresAt;
  }

  /**
   * Get token security stats for monitoring
   */
  getSecurityStats(): any {
    if (!this.adminToken) return null;
    return tokenSecurity.getTokenStats(this.adminToken);
  }
}

// Singleton instance
export const tokenManager = new TokenManager();
