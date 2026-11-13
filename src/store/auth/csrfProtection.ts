/**
 * ==========================
 *  CSRF Protection
 * ==========================
 *
 * Cross-Site Request Forgery protection for API requests
 *
 * Features:
 * - CSRF token generation and validation
 * - Automatic token refresh
 * - Double-submit cookie pattern
 * - SameSite cookie enforcement
 */

import { logDebug, logWarn } from '@/utils';

class CSRFProtection {
  private csrfToken: string | null = null;
  private readonly CSRF_HEADER = 'X-CSRF-Token';
  private readonly CSRF_COOKIE = 'csrf_token';

  /**
   * Generate CSRF token
   */
  generateToken(): string {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    const token = Array.from(array, (byte) =>
      byte.toString(16).padStart(2, '0')
    ).join('');

    this.csrfToken = token;
    this.storeCookie(token);

    logDebug('[CSRF] Token generated');
    return token;
  }

  /**
   * Store CSRF token in cookie
   */
  private storeCookie(token: string): void {
    if (typeof document === 'undefined') return;

    const isProd = process.env.NODE_ENV === 'production';
    const cookieOptions = [
      `${this.CSRF_COOKIE}=${token}`,
      'Path=/',
      'SameSite=Strict',
      isProd ? 'Secure' : '',
      'Max-Age=3600', // 1 hour
    ]
      .filter(Boolean)
      .join('; ');

    document.cookie = cookieOptions;
  }

  /**
   * Get CSRF token from cookie
   */
  private getTokenFromCookie(): string | null {
    if (typeof document === 'undefined') return null;

    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === this.CSRF_COOKIE) {
        return value;
      }
    }
    return null;
  }

  /**
   * Get current CSRF token (generate if not exists)
   */
  getToken(): string {
    if (!this.csrfToken) {
      // Try to get from cookie first
      const cookieToken = this.getTokenFromCookie();
      if (cookieToken) {
        this.csrfToken = cookieToken;
      } else {
        // Generate new token
        return this.generateToken();
      }
    }
    return this.csrfToken;
  }

  /**
   * Add CSRF token to request headers
   */
  addTokenToHeaders(headers: HeadersInit = {}): HeadersInit {
    const token = this.getToken();
    return {
      ...headers,
      [this.CSRF_HEADER]: token,
    };
  }

  /**
   * Validate CSRF token from request
   */
  validateToken(token: string): boolean {
    const cookieToken = this.getTokenFromCookie();

    if (!cookieToken || !token) {
      logWarn('[CSRF] Missing token');
      return false;
    }

    if (cookieToken !== token) {
      logWarn('[CSRF] Token mismatch');
      return false;
    }

    return true;
  }

  /**
   * Clear CSRF token
   */
  clearToken(): void {
    this.csrfToken = null;

    if (typeof document !== 'undefined') {
      document.cookie = `${this.CSRF_COOKIE}=; Path=/; Max-Age=0`;
    }

    logDebug('[CSRF] Token cleared');
  }

  /**
   * Refresh CSRF token
   */
  refreshToken(): string {
    this.clearToken();
    return this.generateToken();
  }
}

export const csrfProtection = new CSRFProtection();
