/**
 * ==========================
 * 🏪 Auth Store (Refactored)
 * ==========================
 *
 * Modular authentication store using Zustand
 *
 * Architecture:
 * - Separated concerns into focused modules
 * - Easy to test and maintain
 * - Clear separation of state and actions
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import * as AuthActions from './auth/authActions';
import * as TwoFactorActions from './auth/twoFactorActions';
import * as PasskeyActions from './auth/passkeyActions';
import * as EmailVerificationActions from './auth/emailVerificationActions';
import { initializeAuth, verifyAndRefreshAuth } from './auth/authInitializer';
import { AUTH_CONFIG } from './auth/constants';
import {
  clearTokenRefresh,
  refreshToken,
  refreshTokenIfNeeded,
  scheduleTokenRefresh,
} from './auth/tokenRefresh';
import {
  getTokenExpiryFromJWT,
  isTokenExpired,
  isTokenNearExpiry,
  shouldRefreshToken as shouldRefreshTokenHelper,
} from './auth/tokenHelpers';
import { tokenManager } from './auth/tokenManager';
import { AuthStore } from '@/types';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      // ==========================================
      // STATE
      // ==========================================

      // Core token state
      accessToken: null,
      tokenExpiresAt: null,

      // Legacy state (to be removed in later tasks)
      isAuthenticated: false,
      loading: false,
      error: null,
      userInfo: null,
      isRefreshing: false,
      requiresTwoFactor: false,
      tempToken: null,
      twoFactorSetupData: null,

      // Passkey state
      passkeyRegistrationOptions: null,
      passkeyLoginOptions: null,
      registeredPasskeys: [],

      // Track if store has been hydrated from storage
      _hasHydrated: false,

      // Track initialization state to prevent premature redirects
      isInitializing: true,

      // ==========================================
      // TOKEN MANAGEMENT
      // ==========================================

      clearError: () => set({ error: null }),

      clearAccessToken: () => {
        set({ accessToken: null, tokenExpiresAt: null });
        tokenManager.clearAuthToken();
      },

      setAccessToken: (token: string | null) => {
        if (token) {
          const expiresAt = getTokenExpiryFromJWT(token);
          set({ accessToken: token, tokenExpiresAt: expiresAt });
          tokenManager.setAuthToken(token);
        } else {
          set({ accessToken: null, tokenExpiresAt: null });
          tokenManager.clearAuthToken();
        }
      },

      setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => {
        if (token) {
          // Prefer expires_in from server, fallback to JWT exp claim
          const expiresAt = expiresIn
            ? Date.now() + expiresIn * 1000
            : getTokenExpiryFromJWT(token);

          set({ accessToken: token, tokenExpiresAt: expiresAt });
          tokenManager.setAuthToken(token, expiresIn);
        } else {
          set({ accessToken: null, tokenExpiresAt: null });
          tokenManager.clearAuthToken();
        }
      },

      getTokenExpiryFromJWT,

      isTokenNearExpiry: (): boolean => {
        const { tokenExpiresAt, accessToken } = get();
        return isTokenNearExpiry(tokenExpiresAt, accessToken);
      },

      isTokenExpired: (): boolean => {
        const { tokenExpiresAt, accessToken } = get();
        return isTokenExpired(tokenExpiresAt, accessToken);
      },

      shouldRefreshToken: (): boolean => {
        const { tokenExpiresAt, accessToken } = get();
        return shouldRefreshTokenHelper(tokenExpiresAt, accessToken);
      },

      // ==========================================
      // TOKEN REFRESH
      // ==========================================

      refreshToken: async (): Promise<void> => {
        const { setAccessTokenWithExpiry, clearAccessToken } = get();
        return refreshToken(setAccessTokenWithExpiry, clearAccessToken);
      },

      refreshTokenIfNeeded: async (retryCount = 0): Promise<boolean> => {
        const { accessToken, shouldRefreshToken, refreshToken } = get();
        return refreshTokenIfNeeded(
          accessToken,
          shouldRefreshToken,
          refreshToken,
          (value) => set({ isRefreshing: value }),
          retryCount
        );
      },

      scheduleTokenRefresh: () => {
        const { tokenExpiresAt, refreshTokenIfNeeded, handleAuthFailure } =
          get();
        scheduleTokenRefresh(
          tokenExpiresAt,
          refreshTokenIfNeeded,
          handleAuthFailure,
          get().scheduleTokenRefresh
        );
      },

      clearTokenRefresh,

      // ==========================================
      // AUTH ACTIONS
      // ==========================================

      handleAuthFailure: () => {
        AuthActions.handleAuthFailure(get().clearTokenRefresh, set);
      },

      login: async (username: string, password: string): Promise<boolean> => {
        const {
          setAccessTokenWithExpiry,
          scheduleTokenRefresh,
          handleAuthFailure,
        } = get();
        return AuthActions.login(
          username,
          password,
          setAccessTokenWithExpiry,
          scheduleTokenRefresh,
          handleAuthFailure,
          set
        );
      },

      logout: async (): Promise<void> => {
        const { clearTokenRefresh, clearAccessToken } = get();
        return AuthActions.logout(clearTokenRefresh, clearAccessToken, set);
      },

      register: async (userData): Promise<boolean> => {
        return AuthActions.register(userData, set);
      },

      updateProfile: async (profileData): Promise<boolean> => {
        return AuthActions.updateProfile(profileData, set, get);
      },

      changePassword: async (
        oldPassword: string,
        newPassword: string
      ): Promise<boolean> => {
        return AuthActions.changePassword(oldPassword, newPassword, set);
      },

      // ==========================================
      // TWO-FACTOR AUTHENTICATION
      // ==========================================

      setupTwoFactor: async () => {
        return TwoFactorActions.setupTwoFactor(set);
      },

      verifyAndEnableTwoFactor: async (code: string): Promise<boolean> => {
        return TwoFactorActions.verifyAndEnableTwoFactor(code, set);
      },

      disableTwoFactor: async (
        password: string,
        code: string
      ): Promise<boolean> => {
        return TwoFactorActions.disableTwoFactor(password, code, set);
      },

      verifyTwoFactorLogin: async (code: string): Promise<boolean> => {
        const { tempToken, setAccessTokenWithExpiry, scheduleTokenRefresh } =
          get();

        if (!tempToken) {
          set({ error: 'No temporary token found' });
          return false;
        }

        return TwoFactorActions.verifyTwoFactorLogin(
          code,
          tempToken,
          setAccessTokenWithExpiry,
          scheduleTokenRefresh,
          set
        );
      },

      clearTwoFactorState: () => {
        TwoFactorActions.clearTwoFactorState(set);
      },

      // ==========================================
      // PASSKEY AUTHENTICATION
      // ==========================================

      beginPasskeyRegistration: async (name: string) => {
        return PasskeyActions.beginPasskeyRegistration(name, set);
      },

      finishPasskeyRegistration: async (name: string): Promise<boolean> => {
        const { passkeyRegistrationOptions } = get();

        if (!passkeyRegistrationOptions) {
          set({ error: 'No registration options found' });
          return false;
        }

        return PasskeyActions.finishPasskeyRegistration(
          name,
          passkeyRegistrationOptions,
          set
        );
      },

      beginPasskeyLogin: async (username?: string) => {
        return PasskeyActions.beginPasskeyLogin(username, set);
      },

      finishPasskeyLogin: async (_credential: any): Promise<boolean> => {
        const {
          passkeyLoginOptions,
          setAccessTokenWithExpiry,
          scheduleTokenRefresh,
        } = get();

        if (!passkeyLoginOptions) {
          set({ error: 'No login options found' });
          return false;
        }

        return PasskeyActions.finishPasskeyLogin(
          passkeyLoginOptions,
          setAccessTokenWithExpiry,
          scheduleTokenRefresh,
          set
        );
      },

      listPasskeys: async () => {
        return PasskeyActions.listPasskeys(set);
      },

      deletePasskey: async (id: string): Promise<boolean> => {
        return PasskeyActions.deletePasskey(id, set, get);
      },

      clearPasskeyState: () => {
        PasskeyActions.clearPasskeyState(set);
      },

      // ==========================================
      // EMAIL VERIFICATION
      // ==========================================

      sendEmailOtp: async (): Promise<boolean> => {
        return EmailVerificationActions.sendEmailOtp(set);
      },

      verifyEmailOtp: async (otpCode: string): Promise<boolean> => {
        return EmailVerificationActions.verifyEmailOtp(otpCode, set);
      },

      // ==========================================
      // INITIALIZATION
      // ==========================================

      initializeAuth: async (): Promise<void> => {
        const {
          refreshTokenIfNeeded,
          scheduleTokenRefresh,
          handleAuthFailure,
          shouldRefreshToken,
        } = get();

        return initializeAuth(
          get,
          set,
          refreshTokenIfNeeded,
          scheduleTokenRefresh,
          handleAuthFailure,
          shouldRefreshToken
        );
      },

      verifyAndRefreshAuth: async (requiredRole?: string): Promise<boolean> => {
        const {
          refreshTokenIfNeeded,
          handleAuthFailure,
          scheduleTokenRefresh,
        } = get();

        return verifyAndRefreshAuth(
          refreshTokenIfNeeded,
          handleAuthFailure,
          scheduleTokenRefresh,
          get,
          set,
          requiredRole
        );
      },
    }),
    {
      name: AUTH_CONFIG.STORAGE_KEY,
      storage: AUTH_CONFIG.IS_CLIENT
        ? createJSONStorage(() => localStorage)
        : undefined,
      partialize: (state) => ({
        // ⚠️ SECURITY: Never persist accessToken to localStorage (XSS vulnerability)
        // Token is managed securely by tokenManager with encryption
        // Only persist non-sensitive metadata for UX
        tokenExpiresAt: state.tokenExpiresAt,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) {
          state._hasHydrated = true;
        }
      },
    }
  )
);

// ==========================================
// COMPUTED PROPERTIES
// ==========================================

// Implement isAuthenticated as a computed property
if (typeof window !== 'undefined') {
  useAuthStore.subscribe((state) => {
    const computedIsAuthenticated =
      state.accessToken !== null && !state.isTokenExpired();

    // Only update if the computed value differs from current state
    if (state.isAuthenticated !== computedIsAuthenticated) {
      useAuthStore.setState({ isAuthenticated: computedIsAuthenticated });
    }
  });

  // Also check token expiry periodically and update isAuthenticated
  let _authFailureInProgress = false;
  setInterval(() => {
    const state = useAuthStore.getState();
    const computedIsAuthenticated =
      state.accessToken !== null && !state.isTokenExpired();

    if (state.isAuthenticated !== computedIsAuthenticated) {
      useAuthStore.setState({ isAuthenticated: computedIsAuthenticated });

      // If token expired, trigger auth failure — but only once at a time
      // to prevent the interval from stacking up repeated handleAuthFailure
      // calls if the handler throws or takes longer than 30s.
      if (
        !computedIsAuthenticated &&
        state.accessToken !== null &&
        !_authFailureInProgress
      ) {
        _authFailureInProgress = true;
        try {
          state.handleAuthFailure();
        } finally {
          _authFailureInProgress = false;
        }
      }
    }
  }, 30000); // Check every 30 seconds
}
