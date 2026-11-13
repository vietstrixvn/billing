/**
 * ==========================
 *  Rate Limiter
 * ==========================
 *
 * Client-side rate limiting for API requests
 *
 * Features:
 * - Sliding window rate limiting
 * - Per-endpoint limits
 * - Automatic cleanup
 * - Configurable limits
 */

import { logWarn } from '@/utils';

interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

interface RequestRecord {
  timestamp: number;
  endpoint: string;
}

class RateLimiter {
  private requests: Map<string, RequestRecord[]> = new Map();

  // Default limits per endpoint
  private limits: Map<string, RateLimitConfig> = new Map([
    ['login', { maxRequests: 5, windowMs: 60000 }], // 5 requests per minute
    ['register', { maxRequests: 3, windowMs: 60000 }], // 3 requests per minute
    ['refresh', { maxRequests: 10, windowMs: 60000 }], // 10 requests per minute
    ['default', { maxRequests: 30, windowMs: 60000 }], // 30 requests per minute
  ]);

  /**
   * Check if request is allowed
   */
  isAllowed(endpoint: string): boolean {
    const now = Date.now();
    const config = this.getConfig(endpoint);

    // Get or create request history for this endpoint
    let history = this.requests.get(endpoint) || [];

    // Remove old requests outside the window
    history = history.filter(
      (record) => now - record.timestamp < config.windowMs
    );

    // Check if limit exceeded
    if (history.length >= config.maxRequests) {
      logWarn(`[RateLimit] Limit exceeded for ${endpoint}`);
      return false;
    }

    // Add current request
    history.push({ timestamp: now, endpoint });
    this.requests.set(endpoint, history);

    return true;
  }

  /**
   * Get rate limit config for endpoint
   */
  private getConfig(endpoint: string): RateLimitConfig {
    // Extract endpoint name from URL
    const endpointName = this.extractEndpointName(endpoint);
    return this.limits.get(endpointName) || this.limits.get('default')!;
  }

  /**
   * Extract endpoint name from URL
   */
  private extractEndpointName(url: string): string {
    try {
      const urlObj = new URL(url);
      const path = urlObj.pathname;
      const parts = path.split('/').filter(Boolean);
      return parts[parts.length - 1] || 'default';
    } catch {
      return 'default';
    }
  }

  /**
   * Get remaining requests for endpoint
   */
  getRemaining(endpoint: string): number {
    const config = this.getConfig(endpoint);
    const history = this.requests.get(endpoint) || [];
    const now = Date.now();

    const recentRequests = history.filter(
      (record) => now - record.timestamp < config.windowMs
    );

    return Math.max(0, config.maxRequests - recentRequests.length);
  }

  /**
   * Get time until next request is allowed
   */
  getRetryAfter(endpoint: string): number {
    const config = this.getConfig(endpoint);
    const history = this.requests.get(endpoint) || [];

    if (history.length === 0) return 0;

    const now = Date.now();
    const oldestInWindow = history.find(
      (record) => now - record.timestamp < config.windowMs
    );

    if (!oldestInWindow) return 0;

    const timeUntilExpiry = config.windowMs - (now - oldestInWindow.timestamp);
    return Math.max(0, timeUntilExpiry);
  }

  /**
   * Clear rate limit history for endpoint
   */
  clear(endpoint?: string): void {
    if (endpoint) {
      this.requests.delete(endpoint);
    } else {
      this.requests.clear();
    }
  }

  /**
   * Set custom limit for endpoint
   */
  setLimit(endpoint: string, config: RateLimitConfig): void {
    this.limits.set(endpoint, config);
  }
}

export const rateLimiter = new RateLimiter();
