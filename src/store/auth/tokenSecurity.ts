/**
 * ==========================
 * 🛡️ Token Security Manager
 * ==========================
 *
 * Advanced token security with multiple protection layers
 *
 * Security Features:
 * - Token age validation (prevents old tokens)
 * - Use count tracking (detects excessive usage)
 * - Suspicious activity detection (rate limiting)
 * - Device fingerprinting (monitoring only, not blocking)
 * - Automatic token rotation recommendations
 *
 * Note: Device fingerprinting is used for monitoring/alerting only.
 * It does NOT block tokens due to:
 * - High false positive rate (browser updates, zoom, resolution changes)
 * - Weak security (easy to spoof User-Agent and other attributes)
 * - Server-side validation is the ultimate authority
 */

import { logDebug, logWarn, logError } from '@/utils';
import { AUTH_CONFIG } from './constants';

interface TokenMetadata {
  fingerprint: string;
  issuedAt: number;
  lastUsed: number;
  useCount: number;
  deviceInfo: string;
}

class TokenSecurity {
  private tokenMetadata: Map<string, TokenMetadata> = new Map();
  // Align with server-issued token lifetime (AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE = 4h).
  // Using a longer value here creates a false sense of security: the server
  // rejects the token after 4h, but validateToken() would still return true.
  private readonly MAX_TOKEN_AGE = AUTH_CONFIG.ACCESS_TOKEN_MAX_AGE * 1000; // 4h in ms
  private readonly MAX_USE_COUNT = 10000; // Max uses before rotation
  private readonly SUSPICIOUS_USE_THRESHOLD = 100; // Uses per minute

  /**
   * Generate device fingerprint for token binding
   *
   * ⚠️ WARNING: This is for MONITORING ONLY, not security enforcement
   *
   * Limitations:
   * - Easy to spoof (User-Agent, screen size can be faked)
   * - High false positives (browser updates, zoom, resolution changes)
   * - Not reliable for blocking access
   *
   * Use cases:
   * - Security monitoring and alerting
   * - Anomaly detection (log suspicious patterns)
   * - Analytics (track device changes)
   *
   * DO NOT use for:
   * - Blocking token validation
   * - Primary security mechanism
   * - Access control decisions
   */
  generateFingerprint(): string {
    if (typeof window === 'undefined') return 'server';

    try {
      const components = [
        navigator.userAgent,
        navigator.language,
        new Date().getTimezoneOffset(),
        screen.colorDepth,
        screen.width + 'x' + screen.height,
      ];

      const fingerprint = components.join('|');
      return this.simpleHash(fingerprint);
    } catch (error) {
      logWarn('Failed to generate fingerprint:', error);
      return 'unknown';
    }
  }

  /**
   * Simple hash function for fingerprinting
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash).toString(36);
  }

  /**
   * Register token with security metadata
   */
  registerToken(token: string): void {
    const fingerprint = this.generateFingerprint();
    const deviceInfo =
      typeof window !== 'undefined' ? navigator.userAgent : 'server';

    // Check if we have existing metadata in localStorage (for hard refresh)
    let issuedAt = Date.now();
    let useCount = 0;

    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('_tm'); // token metadata
        if (stored) {
          const parsed = JSON.parse(stored);
          // Reuse issuedAt if token hash matches (same token after refresh)
          const tokenHash = this.simpleHash(token);
          if (parsed.tokenHash === tokenHash) {
            issuedAt = parsed.issuedAt || Date.now();
            useCount = parsed.useCount || 0;
            logDebug('[TokenSecurity] Restored token metadata from storage');
          }
        }
      } catch (error) {
        logWarn('[TokenSecurity] Failed to restore metadata:', error);
      }
    }

    const metadata: TokenMetadata = {
      fingerprint,
      issuedAt,
      lastUsed: Date.now(),
      useCount,
      deviceInfo,
    };

    this.tokenMetadata.set(token, metadata);

    // Persist metadata to localStorage for hard refresh
    if (typeof window !== 'undefined') {
      try {
        const tokenHash = this.simpleHash(token);
        localStorage.setItem(
          '_tm',
          JSON.stringify({
            tokenHash,
            issuedAt,
            useCount,
            fingerprint,
          })
        );
      } catch (error) {
        logWarn('[TokenSecurity] Failed to persist metadata:', error);
      }
    }

    logDebug('[TokenSecurity] Token registered with fingerprint:', fingerprint);
  }

  /**
   * Validate token security before use
   * Returns true if token is safe to use
   */
  validateToken(token: string): boolean {
    if (!token) return false;

    const metadata = this.tokenMetadata.get(token);
    if (!metadata) {
      logWarn('[TokenSecurity] Token not registered');
      return false;
    }

    // ⚠️ Fingerprint check for monitoring only (not blocking)
    // Fingerprints are weak and can cause false positives (browser updates, resolution changes)
    const currentFingerprint = this.generateFingerprint();
    if (metadata.fingerprint !== currentFingerprint) {
      logWarn(
        '[TokenSecurity] Fingerprint mismatch detected (monitoring only)',
        {
          original: metadata.fingerprint,
          current: currentFingerprint,
        }
      );
      // ✅ Don't block - just log for security monitoring
      // Update fingerprint to current one (handles hard refresh case)
      metadata.fingerprint = currentFingerprint;
    }

    // Check token age
    const age = Date.now() - metadata.issuedAt;
    if (age > this.MAX_TOKEN_AGE) {
      logWarn('[TokenSecurity] Token too old, needs rotation');
      return false;
    }

    // Check use count
    if (metadata.useCount > this.MAX_USE_COUNT) {
      logWarn('[TokenSecurity] Token used too many times, needs rotation');
      return false;
    }

    // Check for suspicious activity (too many uses in short time)
    const timeSinceLastUse = Date.now() - metadata.lastUsed;
    if (
      timeSinceLastUse < 600 &&
      metadata.useCount > this.SUSPICIOUS_USE_THRESHOLD
    ) {
      logError('[TokenSecurity] Suspicious activity detected!');
      this.revokeToken(token);
      return false;
    }

    // Update metadata
    metadata.lastUsed = Date.now();
    metadata.useCount++;

    // Persist updated useCount
    if (typeof window !== 'undefined') {
      try {
        const tokenHash = this.simpleHash(token);
        localStorage.setItem(
          '_tm',
          JSON.stringify({
            tokenHash,
            issuedAt: metadata.issuedAt,
            useCount: metadata.useCount,
            fingerprint: metadata.fingerprint,
          })
        );
      } catch {
        // Ignore persistence errors
      }
    }

    return true;
  }

  /**
   * Revoke token and clear metadata
   */
  revokeToken(token: string): void {
    this.tokenMetadata.delete(token);

    // Clear persisted metadata
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('_tm');
      } catch {
        // Ignore
      }
    }

    logDebug('[TokenSecurity] Token revoked');
  }

  /**
   * Check if token needs rotation
   */
  needsRotation(token: string): boolean {
    const metadata = this.tokenMetadata.get(token);
    if (!metadata) return true;

    const age = Date.now() - metadata.issuedAt;
    return (
      age > this.MAX_TOKEN_AGE / 2 || metadata.useCount > this.MAX_USE_COUNT / 2
    );
  }

  /**
   * Clear all token metadata
   */
  clearAll(): void {
    this.tokenMetadata.clear();

    // Clear persisted metadata
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('_tm');
      } catch {
        // Ignore
      }
    }

    logDebug('[TokenSecurity] All token metadata cleared');
  }

  /**
   * Get token statistics for monitoring
   */
  getTokenStats(token: string): TokenMetadata | null {
    return this.tokenMetadata.get(token) || null;
  }
}

export const tokenSecurity = new TokenSecurity();
