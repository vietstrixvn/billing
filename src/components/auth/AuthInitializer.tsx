'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/store';
import { logDebug, logWarn } from '@/utils';
import { migrateAuthStorage } from '@/libs';

export function AuthInitializer() {
  const pathname = usePathname();
  const hasInitialized = useRef(false);
  const initTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    // Setup debug tools in development
    if (process.env.NODE_ENV === 'development') {
      import('../../utils/debug-auth.utilt').then(({ setupAuthDebug }) => {
        setupAuthDebug();
      });
    }

    // Only run once
    if (hasInitialized.current) {
      return;
    }

    hasInitialized.current = true;

    // Skip auth initialization on sign-in page
    if (
      pathname === '/sign-in' ||
      pathname.startsWith('/sign-') ||
      pathname === '/login'
    ) {
      logDebug('Skipping auth initialization on auth page');
      // Ensure isInitializing is false on auth pages
      useAuthStore.setState({ isInitializing: false });
      return;
    }

    // Run migration
    logDebug('Running auth storage migration...');
    migrateAuthStorage();

    // Always call initializeAuth — it will attempt a token refresh via the
    // HttpOnly refresh-token cookie even when no access token is in memory
    // (e.g. after a hard reload where the in-memory encryption key was lost).
    logDebug('Initializing auth on app startup...');
    const initializeAuth = useAuthStore.getState().initializeAuth;
    initializeAuth();

    // Safety timeout at component level — slightly longer than the internal one
    initTimeoutRef.current = setTimeout(() => {
      const currentState = useAuthStore.getState();
      if (currentState.isInitializing) {
        logWarn(
          '[AuthInitializer] Component-level timeout, forcing isInitializing to false'
        );
        useAuthStore.setState({ isInitializing: false });
      }
    }, 8000);

    return () => {
      if (initTimeoutRef.current) {
        clearTimeout(initTimeoutRef.current);
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return null;
}
