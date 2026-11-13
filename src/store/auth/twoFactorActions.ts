/**
 * ==========================
 * 🔐 Two-Factor Authentication Actions
 * ==========================
 *
 * Actions for 2FA setup, verification, and management
 */

import { TwoFactorSetupData } from '@/types';
import { logDebug, logError } from '@/utils';
import { toast } from 'sonner';
import { TwoFactorAPI } from '../api';
import { handleAuthError } from '../utils';
import { AUTH_CONFIG } from './constants';
import { CookieManager } from '../cookies';

/**
 * Setup 2FA - Get QR code and secret
 */
export async function setupTwoFactor(
  setState: (state: any) => void
): Promise<TwoFactorSetupData | null> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await TwoFactorAPI.setup();

    logDebug('[TwoFactorActions] 2FA setup response:', { response, data });

    if (response.ok && data?.success && data?.data) {
      setState({
        twoFactorSetupData: data.data,
        loading: false,
      });

      logDebug('[TwoFactorActions] 2FA setup successful, data:', data.data);
      // Temporarily disable toast to test if it's causing the issue
      // toast.success('2FA setup initiated. Please scan the QR code.');
      return data.data;
    }

    const errorMsg = data?.message || '2FA setup failed';
    logError('[TwoFactorActions] 2FA setup failed:', errorMsg);
    throw new Error(errorMsg);
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[TwoFactorActions] 2FA setup error:', error);
    return null;
  }
}

/**
 * Verify and enable 2FA
 */
export async function verifyAndEnableTwoFactor(
  code: string,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await TwoFactorAPI.verify(code);

    if (response.ok && data?.success) {
      setState({
        twoFactorSetupData: null,
        loading: false,
      });

      logDebug('[TwoFactorActions] 2FA enabled successfully');
      toast.success('2FA enabled successfully!');
      return true;
    }

    if (response.status === 400) {
      throw new Error('Invalid verification code');
    }

    throw new Error(data?.message || '2FA verification failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[TwoFactorActions] 2FA verify error:', error);
    return false;
  }
}

/**
 * Disable 2FA
 */
export async function disableTwoFactor(
  password: string,
  code: string,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await TwoFactorAPI.disable(password, code);

    if (response.ok && data?.success) {
      setState({ loading: false });

      logDebug('[TwoFactorActions] 2FA disabled successfully');
      toast.success('2FA disabled successfully!');
      return true;
    }

    if (response.status === 400) {
      throw new Error('Invalid password or verification code');
    }

    if (response.status === 401) {
      throw new Error('Unauthorized. Please login again.');
    }

    throw new Error(data?.message || '2FA disable failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[TwoFactorActions] 2FA disable error:', error);
    return false;
  }
}

/**
 * Verify 2FA code during login
 */
export async function verifyTwoFactorLogin(
  code: string,
  tempToken: string,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void,
  scheduleRefresh: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await TwoFactorAPI.verifyLogin(tempToken, code);

    if (response.ok && data?.success && data?.data?.access_token) {
      const accessToken = data.data.access_token;
      const expiresIn = data.data.expires_in; // Get expires_in from server

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Set access token with expiry info from server
      setAccessTokenWithExpiry(accessToken, expiresIn);

      // ✅ Keep loading state TRUE while we fetch user info and set permissions
      setState({
        requiresTwoFactor: false,
        tempToken: null,
        isAuthenticated: true,
        loading: true, // Keep loading true
        error: null,
        isInitializing: false,
      });

      try {
        // Fetch user info and wait for it to complete
        const { queryClient } = await import('@/libs');
        await queryClient.invalidateQueries({ queryKey: ['me'] });

        // Wait for user query to be fetched
        await queryClient.refetchQueries({ queryKey: ['me'] });

        // Set cookie for SSR - IMPORTANT for middleware!
        CookieManager.set(AUTH_CONFIG.COOKIE_KEY, 'true', {
          expires: AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE,
          secure: AUTH_CONFIG.IS_PROD,
          sameSite: 'Lax',
        });

        scheduleRefresh();

        logDebug('[TwoFactorActions] 2FA login verification successful');
        toast.success('Login successful!');
      } catch (userFetchError) {
        logError(
          '[TwoFactorActions] Failed to fetch user info:',
          userFetchError
        );
        // Continue anyway - user info will be fetched by useCurrentUser hook
      } finally {
        // ✅ Always set loading to false after everything is complete
        setState({
          loading: false,
        });
      }

      return true;
    }

    if (response.status === 400 || response.status === 401) {
      throw new Error('Invalid verification code');
    }

    throw new Error(data?.message || '2FA verification failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[TwoFactorActions] 2FA login verify error:', error);
    return false;
  }
}

/**
 * Clear 2FA state
 */
export function clearTwoFactorState(setState: (state: any) => void): void {
  setState({
    requiresTwoFactor: false,
    tempToken: null,
    twoFactorSetupData: null,
  });
  logDebug('[TwoFactorActions] 2FA state cleared');
}
