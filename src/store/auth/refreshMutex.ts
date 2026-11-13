/**
 * ==========================
 * 🔄 Refresh Mutex
 * ==========================
 *
 * Prevents concurrent token refresh requests
 * Ensures only one refresh happens at a time
 */

import { logDebug } from '@/utils';

export class RefreshMutex {
  private promise: Promise<boolean> | null = null;
  private resolvers: Array<(value: boolean) => void> = [];

  /**
   * Acquire mutex and execute refresh function
   * If refresh is already in progress, wait for result
   */
  async acquire(refreshFn: () => Promise<boolean>): Promise<boolean> {
    if (this.promise) {
      logDebug('[RefreshMutex] Refresh in progress, waiting for result...');
      return this.promise;
    }

    this.promise = new Promise<boolean>(async (resolve) => {
      try {
        const result = await refreshFn();
        // Resolve all waiters
        this.resolvers.forEach((r) => r(result));
        resolve(result);
      } catch {
        this.resolvers.forEach((r) => r(false));
        resolve(false);
      } finally {
        this.promise = null;
        this.resolvers = [];
      }
    });

    return this.promise;
  }

  /**
   * Check if refresh is currently in progress
   */
  isRefreshing(): boolean {
    return this.promise !== null;
  }
}

export const refreshMutex = new RefreshMutex();
