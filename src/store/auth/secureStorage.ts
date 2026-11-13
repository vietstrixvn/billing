/**
 * ==========================
 *  Secure Storage Manager
 * ==========================
 *
 * Encrypted storage for sensitive data with multiple security layers
 *
 * Security Features:
 * - AES-GCM encryption using Web Crypto API
 * - Cryptographically secure key generation
 * - Memory-first storage (fastest access)
 * - Automatic data expiration
 * - XSS protection through strong encryption
 *
 * Note: Encryption key is stored in memory and regenerated per session.
 * This provides defense-in-depth but is not a replacement for HttpOnly cookies.
 */

import { logError, logWarn } from '@/utils';

interface StorageItem {
  value: string;
  expiresAt?: number;
  encrypted?: boolean;
  iv?: string; // Initialization vector for AES-GCM
}

class SecureStorage {
  private memoryStore: Map<string, StorageItem> = new Map();
  private cryptoKey: CryptoKey | null = null;
  private keyInitialized: Promise<void> | null = null;

  constructor() {
    // Remove any stale encryption key that may have been persisted by a
    // previous version of this code. Keeping it in localStorage is a
    // security vulnerability (XSS can read key + ciphertext together).
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('_ck');
      } catch {
        // ignore
      }
    }
    this.initEncryptionKey();
  }

  /**
   * Initialize encryption key using Web Crypto API
   * Generates a cryptographically secure AES-GCM key.
   *
   * Security: Key is kept in memory only (never persisted to localStorage).
   * Storing the key alongside the encrypted data defeats encryption entirely —
   * an XSS attacker who can read localStorage can read both the key and the
   * ciphertext. Memory-only keys are cleared on tab/session close, which is
   * the correct scope for access tokens.
   */
  private async initEncryptionKey(): Promise<void> {
    if (typeof window === 'undefined' || !window.crypto?.subtle) {
      logWarn('Web Crypto API not available, encryption disabled');
      return;
    }

    try {
      // Always generate a fresh in-memory key — never persist to localStorage.
      // Access tokens should not survive a hard refresh anyway; if the token
      // is gone after refresh the app will use the HttpOnly refresh-token
      // cookie to obtain a new one.
      this.cryptoKey = await crypto.subtle.generateKey(
        { name: 'AES-GCM', length: 256 },
        false, // non-extractable: key cannot be exported or read by JS
        ['encrypt', 'decrypt']
      );
    } catch (error) {
      logError('Failed to init encryption key:', error);
      this.cryptoKey = null;
    }
  }

  /**
   * Ensure crypto key is initialized
   */
  private async ensureKeyInitialized(): Promise<boolean> {
    if (this.cryptoKey) return true;

    if (!this.keyInitialized) {
      this.keyInitialized = this.initEncryptionKey();
    }

    await this.keyInitialized;
    return this.cryptoKey !== null;
  }

  /**
   * Encrypt data using AES-GCM
   */
  private async encrypt(
    data: string
  ): Promise<{ encrypted: string; iv: string }> {
    const keyReady = await this.ensureKeyInitialized();
    if (!keyReady || !this.cryptoKey) {
      // Fallback: return base64 encoded (better than nothing)
      logWarn('Encryption not available, using base64 encoding');
      return { encrypted: btoa(data), iv: '' };
    }

    try {
      // Generate random IV (12 bytes for GCM)
      const iv = crypto.getRandomValues(new Uint8Array(12));

      // Encode data to bytes
      const encoder = new TextEncoder();
      const dataBytes = encoder.encode(data);

      // Encrypt using AES-GCM
      const encryptedBuffer = await crypto.subtle.encrypt(
        { name: 'AES-GCM', iv },
        this.cryptoKey,
        dataBytes
      );

      // Convert to base64 for storage
      const encryptedArray = new Uint8Array(encryptedBuffer);
      const encrypted = btoa(String.fromCharCode(...encryptedArray));
      const ivBase64 = btoa(String.fromCharCode(...iv));

      return { encrypted, iv: ivBase64 };
    } catch (error) {
      logError('Encryption failed:', error);
      // Fallback: return base64 encoded
      return { encrypted: btoa(data), iv: '' };
    }
  }

  /**
   * Decrypt data using AES-GCM.
   *
   * Returns null when decryption fails (e.g. key mismatch after page reload).
   * Callers must treat null as "data not available" and clear the stale entry.
   */
  private async decrypt(encrypted: string, iv: string): Promise<string | null> {
    const keyReady = await this.ensureKeyInitialized();
    if (!keyReady || !this.cryptoKey || !iv) {
      // No key available — cannot decrypt; signal caller to discard the entry.
      return null;
    }

    try {
      const encryptedBytes = Uint8Array.from(atob(encrypted), (c) =>
        c.charCodeAt(0)
      );
      const ivBytes = Uint8Array.from(atob(iv), (c) => c.charCodeAt(0));

      const decryptedBuffer = await crypto.subtle.decrypt(
        { name: 'AES-GCM', iv: ivBytes },
        this.cryptoKey,
        encryptedBytes
      );

      const decoder = new TextDecoder();
      return decoder.decode(decryptedBuffer);
    } catch {
      // Key mismatch (e.g. new in-memory key after reload) — stale ciphertext.
      // Return null so the caller can evict the entry cleanly.
      return null;
    }
  }

  /**
   * Set item with optional encryption and expiration
   */
  async setItem(
    key: string,
    value: string,
    options?: {
      encrypt?: boolean;
      expiresIn?: number; // seconds
      memoryOnly?: boolean;
    }
  ): Promise<void> {
    let itemValue = value;
    let iv: string | undefined;

    // Encrypt if requested AND crypto is available
    if (options?.encrypt && typeof window !== 'undefined') {
      try {
        const encrypted = await this.encrypt(value);
        itemValue = encrypted.encrypted;
        iv = encrypted.iv;
      } catch (error) {
        logWarn('[SecureStorage] Encryption failed, storing as base64:', error);
        // Fallback: store as base64
        itemValue = btoa(value);
      }
    }

    const item: StorageItem = {
      value: itemValue,
      encrypted: options?.encrypt,
      iv,
      expiresAt: options?.expiresIn
        ? Date.now() + options.expiresIn * 1000
        : undefined,
    };

    // Always store in memory
    this.memoryStore.set(key, item);

    // Store in localStorage if not memory-only
    if (!options?.memoryOnly && typeof window !== 'undefined') {
      try {
        localStorage.setItem(key, JSON.stringify(item));
      } catch (error) {
        logWarn('Failed to store in localStorage:', error);
      }
    }
  }

  /**
   * Get item with automatic decryption and expiration check
   */
  async getItem(key: string): Promise<string | null> {
    // Check memory first
    let item = this.memoryStore.get(key);

    // Fallback to localStorage
    if (!item && typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem(key);
        if (stored) {
          item = JSON.parse(stored);
          // Restore to memory
          if (item) {
            this.memoryStore.set(key, item);
          }
        }
      } catch (error) {
        logWarn('Failed to read from localStorage:', error);
      }
    }

    if (!item) return null;

    // Check expiration
    if (item.expiresAt && Date.now() > item.expiresAt) {
      this.removeItem(key);
      return null;
    }

    // Decrypt if needed
    if (item.encrypted && item.iv) {
      const decrypted = await this.decrypt(item.value, item.iv);
      if (decrypted === null) {
        // Stale ciphertext — key has rotated (e.g. new session after reload).
        // Evict the entry so the app falls back to the refresh-token flow.
        this.removeItem(key);
        return null;
      }
      return decrypted;
    }

    return item.value;
  }

  /**
   * Remove item from all storage layers
   */
  removeItem(key: string): void {
    this.memoryStore.delete(key);
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem(key);
      } catch (error) {
        logWarn('Failed to remove from localStorage:', error);
      }
    }
  }

  /**
   * Clear all stored data
   */
  clear(): void {
    this.memoryStore.clear();
    if (typeof window !== 'undefined') {
      try {
        // Only clear our keys, not all localStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key?.startsWith('auth_') || key?.startsWith('_')) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach((key) => localStorage.removeItem(key));
      } catch (error) {
        logWarn('Failed to clear localStorage:', error);
      }
    }
  }

  /**
   * Check if item exists and is not expired
   */
  async hasItem(key: string): Promise<boolean> {
    const value = await this.getItem(key);
    return value !== null;
  }
}

export const secureStorage = new SecureStorage();
