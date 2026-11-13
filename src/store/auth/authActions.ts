/**
 * ==========================
 * 🔐 Auth Actions
 * ==========================
 *
 * Core authentication actions (login, logout, register, etc.)
 */

import { AppError, ERROR_MESSAGE, LogCode } from '@/types';
import { logDebug, logError, logWarn } from '@/utils';
import { toast } from 'sonner';
import { AuthAPI } from '../api';
import { CookieManager } from '../cookies';
import { handleAuthError } from '../utils';
import { AUTH_CONFIG } from './constants';
import { tokenManager } from './tokenManager';
import { CreateUserDto, UpdateProfileDTO } from '@/types';

/**
 * Handle authentication failure
 */
export function handleAuthFailure(
  clearTokenRefresh: () => void,
  setState: (state: any) => void
): void {
  logWarn('[AuthActions] Handling authentication failure');

  // Clear scheduled refresh
  clearTokenRefresh();

  // Clear cookies and storage
  CookieManager.delete(AUTH_CONFIG.COOKIE_KEY);
  if (AUTH_CONFIG.IS_CLIENT) {
    localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
  }

  // Clear token with security cleanup
  tokenManager.clearAll();
  logDebug(
    '[AuthActions] Auth token and security data cleared on auth failure'
  );

  // Clear query cache
  if (AUTH_CONFIG.IS_CLIENT) {
    import('@/libs').then(({ queryClient }) => {
      queryClient.clear();
    });
  }

  // Reset all auth state
  setState({
    accessToken: null,
    tokenExpiresAt: null,
    isAuthenticated: false,
    loading: false,
    error: null,
    isRefreshing: false,
    userInfo: null,
    requiresTwoFactor: false,
    tempToken: null,
    twoFactorSetupData: null,
    passkeyRegistrationOptions: null,
    passkeyLoginOptions: null,
    registeredPasskeys: [],
  });

  logDebug('[AuthActions] All auth state cleared');
}

/**
 * Login with username and password
 */
export async function login(
  username: string,
  password: string,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void,
  scheduleRefresh: () => void,
  handleFailure: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await AuthAPI.login(username, password);

    if (response.ok && data?.success) {
      // Check if 2FA is required
      if (data?.data?.requires_2fa && data?.data?.temp_token) {
        setState({
          requiresTwoFactor: true,
          tempToken: data.data.temp_token,
          loading: false,
          error: null,
        });

        logDebug('[AuthActions] 2FA required for login');
        toast.info('Please enter your 2FA code to continue');
        return false; // Return false to indicate 2FA is needed
      }

      // Normal login flow (no 2FA)
      if (data?.data?.access_token) {
        const accessToken = data.data.access_token;
        const expiresIn = data.data.expires_in ? Number(data.data.expires_in) : 14400; // Default 4 hours if omitted


        if (!accessToken) {
          throw new Error('No access token received from server');
        }

        // Set access token with expiry info from server
        setAccessTokenWithExpiry(accessToken, expiresIn);

        // ✅ Keep loading state TRUE while we fetch user info and set permissions
        setState({
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

          // Set cookie for SSR
          CookieManager.set(AUTH_CONFIG.COOKIE_KEY, 'true', {
            expires: AUTH_CONFIG.REFRESH_TOKEN_MAX_AGE,
            secure: AUTH_CONFIG.IS_PROD,
            sameSite: 'Lax',
          });

          scheduleRefresh();

          logDebug('[AuthActions] Login successful, user authenticated');
          toast.success('Login successful! Redirecting...');
        } catch (userFetchError) {
          logWarn('[AuthActions] Failed to fetch user info:', userFetchError);
          // Continue anyway - user info will be fetched by useCurrentUser hook
        } finally {
          // ✅ Always set loading to false after everything is complete
          setState({
            loading: false,
          });
        }

        return true;
      }
    }

    // Handle login errors
    if (response.status === 401 || response.status === 400) {
      throw new Error('Invalid username or password');
    }

    throw new Error(data?.message || 'Login failed');
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Login failed';
    handleFailure();
    setState({ error: errorMessage, loading: false });
    toast.error(errorMessage);
    return false;
  }
}

/**
 * Logout user
 */
export async function logout(
  clearTokenRefresh: () => void,
  clearAccessToken: () => void,
  setState: (state: any) => void
): Promise<void> {
  try {
    setState({ loading: true });
    clearTokenRefresh();

    // Call server logout
    try {
      const { response } = await AuthAPI.logout();
      if (!response.ok) {
        logWarn(
          '[AuthActions] Server logout failed, continuing with local logout'
        );
      }
    } catch (error) {
      logWarn('[AuthActions] Server logout error:', error);
    }

    clearAccessToken();

    // Clear query cache
    const { queryClient } = await import('@/libs');
    queryClient.clear();

    // Clear cookies and storage
    CookieManager.delete(AUTH_CONFIG.COOKIE_KEY);
    if (AUTH_CONFIG.IS_CLIENT) {
      localStorage.removeItem(AUTH_CONFIG.STORAGE_KEY);
    }

    setState({
      userInfo: null,
      loading: false,
      error: null,
      isRefreshing: false,
      requiresTwoFactor: false,
      tempToken: null,
      twoFactorSetupData: null,
    });

    toast.success('Logout Successfully!');
    window.location.href = '/sign-in';
  } catch (error) {
    logError('[AuthActions] Catastrophic error during logout:', error);
    clearAccessToken();

    const { queryClient } = await import('@/libs');
    queryClient.clear();

    window.location.href = '/sign-in';
  }
}

/**
 * Register new user
 */
export async function register(
  userData: CreateUserDto,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await AuthAPI.register(userData);

    if (response.ok && data?.success) {
      setState({ loading: false });
      toast.success(
        'Đăng ký thành công! Vui lòng đăng nhập bằng thông tin đăng nhập của bạn.'
      );
      return true;
    }

    if (response.status === 400) {
      throw new AppError(
        LogCode.INVALID_CREDENTIALS,
        data?.message || ERROR_MESSAGE.INCORRECT_INFORMATION
      );
    }

    if (response.status === 409) {
      throw new Error('User already exists with this username or email');
    }

    throw new Error(data?.message || 'Registration failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    return false;
  }
}

/**
 * Update user profile
 */
export async function updateProfile(
  profileData: UpdateProfileDTO,
  setState: (state: any) => void,
  getState: () => any
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await AuthAPI.update(profileData);

    if (response.ok && data?.success) {
      const currentUser = getState().userInfo;
      if (currentUser) {
        setState({
          userInfo: {
            ...currentUser,
            fullName: `${profileData.first_name} ${profileData.last_name}`,
          },
          loading: false,
        });
      }

      toast.success('Cập nhật thông tin thành công!');
      return true;
    }

    if (response.status === 400) {
      throw new AppError(
        LogCode.INVALID_CREDENTIALS,
        data?.message || 'Thông tin không hợp lệ'
      );
    }

    throw new Error(data?.message || 'Cập nhật thất bại');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    return false;
  }
}

/**
 * Change user password
 */
export async function changePassword(
  oldPassword: string,
  newPassword: string,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await AuthAPI.changePassword(
      oldPassword,
      newPassword
    );

    if (response.ok && data?.success) {
      setState({ loading: false });
      logDebug('[AuthActions] Password changed successfully');
      return true;
    }

    if (response.status === 400) {
      throw new AppError(
        LogCode.INVALID_CREDENTIALS,
        data?.message || 'Invalid password'
      );
    }

    if (response.status === 401) {
      throw new Error('Current password is incorrect');
    }

    throw new Error(data?.message || 'Password change failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    throw error;
  }
}
