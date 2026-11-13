// ==============================================
// 📁 store/api.ts - OPTIMIZED VERSION WITH SECURITY
// ==============================================

import { endpoints } from '@/apis';
import {
  handleErrorResponse,
  isErrorResponse,
  logDebug,
  logError,
} from '../utils';
import { csrfProtection } from './auth/csrfProtection';
import {
  AuthResponse,
  CreateUserDto,
  UpdateProfileDTO,
  TwoFactorSetupResponse,
  TwoFactorStatusResponse,
  TwoFactorLoginResponse,
  TwoFactorVerifyRequest,
  TwoFactorDisableRequest,
  TwoFactorLoginRequest,
  PasskeyRegistrationBeginRequest,
  PasskeyRegistrationBeginResponse,
  PasskeyRegistrationFinishRequest,
  PasskeyRegistrationFinishResponse,
  PasskeyLoginBeginRequest,
  PasskeyLoginBeginResponse,
  PasskeyLoginFinishRequest,
  PasskeyLoginFinishResponse,
  PasskeyListResponse,
  PasskeyDetailResponse,
  SendOtpResponse,
  VerifyOtpRequest,
  VerifyOtpResponse,
} from '@/types';

/**
 * Add security headers to all requests
 */
function getSecureHeaders(): HeadersInit {
  return csrfProtection.addTokenToHeaders({
    'X-Requested-With': 'XMLHttpRequest', // Prevent CSRF
  });
}

export const AuthAPI = {
  async login(username: string, password: string): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.auth.login, {
        method: 'POST',
        skipAuth: true,
        headers: getSecureHeaders(),
        body: JSON.stringify({ username, password }),
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'Unauthorized request or session expired' },
        };
      }

      const contentType = response.headers.get('content-type');

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => ({ success: false, message: 'Failed to parse server response' }));

        // Check if backend returned error code
        if (isErrorResponse(data)) {
          handleErrorResponse(data);
        }
      } else {
        const textData = await response.text();
        data = { success: false, message: 'Server returned non-JSON response', rawResponse: textData };
      }

      return { response, data };
    } catch (error) {
      logError('Login API error:', error);
      throw new Error('Network error during login');
    }
  },

  async register(userData: CreateUserDto): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.auth.login, {
        method: 'POST',
        skipAuth: true,
        headers: getSecureHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'Unauthorized request or session expired' },
        };
      }

      const contentType = response.headers.get('content-type');

      let data;
      if (contentType && contentType.includes('application/json')) {
        data = await response.json().catch(() => ({ success: false, message: 'Failed to parse server response' }));

        // Check if backend returned error code
        if (isErrorResponse(data)) {
          handleErrorResponse(data);
        }
      } else {
        const textData = await response.text();
        data = { success: false, message: 'Server returned non-JSON response', rawResponse: textData };
      }

      return { response, data };
    } catch (error) {
      logError('Register API error:', error);
      throw new Error('Network error during registration');
    }
  },

  async update(data: UpdateProfileDTO): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.auth.profile, {
        method: 'PATCH',
        headers: getSecureHeaders(),
        body: JSON.stringify(data),
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'Unauthorized request or session expired' },
        };
      }

      const contentType = response.headers.get('content-type');

      let responseData;
      if (contentType && contentType.includes('application/json')) {
        responseData = await response.json().catch(() => ({ success: false, message: 'Failed to parse server response' }));

        // Check if backend returned error code
        if (isErrorResponse(responseData)) {
          handleErrorResponse(responseData);
        }
      } else {
        const textData = await response.text();
        responseData = {
          success: false,
          message: 'Server returned non-JSON response',
          rawResponse: textData,
        };
      }

      return { response, data: responseData };
    } catch (error) {
      logError('Update profile API error:', error);
      throw new Error('Network error during update');
    }
  },

  async logout(): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');
      const response = await fetchWithAuth(endpoints.auth.logout, {
        method: 'POST',
        headers: getSecureHeaders(),
      });

      if (!response) {
        csrfProtection.clearToken();
        return {
          response: new Response(null, { status: 401 }),
          data: { success: true, message: 'Logged out' },
        };
      }

      const data = await response.json().catch(() => ({ success: true }));

      // Clear CSRF token on logout
      csrfProtection.clearToken();

      return { response, data };
    } catch (error) {
      logError('Logout API error:', error);
      throw new Error('Network error during logout');
    }
  },

  async getCurrentUser(): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');
      const response = await fetchWithAuth(endpoints.auth.profile, {
        method: 'GET',
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'No auth token available' },
        };
      }

      logDebug('getCurrentUser HTTP status:', response.status);

      if (!response.ok || response.status === 204) {
        return {
          response,
          data: { success: false, message: 'Unauthorized or no content' },
        };
      }

      const text = await response.text();
      const data = text ? JSON.parse(text) : { success: false };

      logDebug('getCurrentUser response data:', data);
      return { response, data };
    } catch (error) {
      logError('GetCurrentUser API error:', error);
      return {
        response: new Response(null, { status: 500 }),
        data: { success: false, message: 'Failed to get current user' },
      };
    }
  },


  async changePassword(
    oldPassword: string,
    newPassword: string
  ): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.auth.password, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'Unauthorized request or session expired' },
        };
      }

      const data = await response.json().catch(() => ({ success: false }));
      logDebug('changePassword response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Change password API error:', error);
      throw new Error('Network error during password change');
    }
  },

  async refreshToken(): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');
      const response = await fetchWithAuth(endpoints.auth.refresh, {
        method: 'POST',
        skipAuth: true,
        skipRefresh: true,
      });

      if (!response) {
        return {
          response: new Response(null, { status: 401 }),
          data: { success: false, message: 'Unauthorized request' },
        };
      }

      const data = await response.json().catch(() => ({ success: false }));
      logDebug('refreshToken HTTP status:', response.status);
      logDebug('refreshToken response data:', data);

      return { response, data };
    } catch (error) {
      logError('RefreshToken API error:', error);
      logError('RefreshToken API error:', error);
      throw new Error('Network error while refreshing token');
    }
  },
};

/**
 * Two-Factor Authentication API
 */
export const TwoFactorAPI = {
  /**
   * Setup 2FA - Get QR code and secret
   */
  async setup(): Promise<AuthResponse<TwoFactorSetupResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.two_fa.setup, {
        method: 'POST',
        headers: getSecureHeaders(),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('2FA setup response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('2FA setup API error:', error);
      throw new Error('Network error during 2FA setup');
    }
  },

  /**
   * Verify and enable 2FA
   */
  async verify(code: string): Promise<AuthResponse<TwoFactorStatusResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: TwoFactorVerifyRequest = { code };

      const response = await fetchWithAuth(endpoints.two_fa.verify, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('2FA verify response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('2FA verify API error:', error);
      throw new Error('Network error during 2FA verification');
    }
  },

  /**
   * Disable 2FA
   */
  async disable(
    password: string,
    code: string
  ): Promise<AuthResponse<TwoFactorStatusResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: TwoFactorDisableRequest = { password, code };

      const response = await fetchWithAuth(endpoints.two_fa.disable, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('2FA disable response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('2FA disable API error:', error);
      throw new Error('Network error during 2FA disable');
    }
  },

  /**
   * Verify 2FA code during login
   */
  async verifyLogin(
    tempToken: string,
    code: string
  ): Promise<AuthResponse<TwoFactorLoginResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: TwoFactorLoginRequest = { temp_token: tempToken, code };

      const response = await fetchWithAuth(endpoints.two_fa.verifyLogin, {
        method: 'POST',
        skipAuth: true,
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('2FA login verify response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('2FA login verify API error:', error);
      throw new Error('Network error during 2FA login verification');
    }
  },
};

/**
 * Passkey Authentication API (WebAuthn/FIDO2)
 */
export const PasskeyAPI = {
  /**
   * Begin Passkey Registration - Get creation options
   */
  async beginRegistration(
    name: string
  ): Promise<AuthResponse<PasskeyRegistrationBeginResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: PasskeyRegistrationBeginRequest = { name };

      const response = await fetchWithAuth(endpoints.passkeys.begin, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey registration begin response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey registration begin API error:', error);
      throw new Error('Network error during passkey registration setup');
    }
  },

  /**
   * Finish Passkey Registration - Submit credential
   */
  async finishRegistration(
    name: string,
    credential: any
  ): Promise<AuthResponse<PasskeyRegistrationFinishResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: PasskeyRegistrationFinishRequest = { name, credential };

      const response = await fetchWithAuth(endpoints.passkeys.finish, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey registration finish response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey registration finish API error:', error);
      throw new Error('Network error during passkey registration completion');
    }
  },

  /**
   * Begin Passkey Login - Get request options
   */
  async beginLogin(
    username?: string
  ): Promise<AuthResponse<PasskeyLoginBeginResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: PasskeyLoginBeginRequest = username ? { username } : {};

      const response = await fetchWithAuth(endpoints.auth.bigin, {
        method: 'POST',
        skipAuth: true,
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey login begin response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey login begin API error:', error);
      throw new Error('Network error during passkey login setup');
    }
  },

  /**
   * Finish Passkey Login - Submit credential
   */
  async finishLogin(
    credential: any
  ): Promise<AuthResponse<PasskeyLoginFinishResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: PasskeyLoginFinishRequest = { credential };

      const response = await fetchWithAuth(endpoints.auth.finish, {
        method: 'POST',
        skipAuth: true,
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey login finish response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey login finish API error:', error);
      throw new Error('Network error during passkey login completion');
    }
  },

  /**
   * List all registered passkeys
   */
  async list(): Promise<AuthResponse<PasskeyListResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.passkeys.list, {
        method: 'GET',
        headers: getSecureHeaders(),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey list response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey list API error:', error);
      throw new Error('Network error while fetching passkeys');
    }
  },

  /**
   * Get passkey details
   */
  async getDetail(id: string): Promise<AuthResponse<PasskeyDetailResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.passkeys.detail(id), {
        method: 'GET',
        headers: getSecureHeaders(),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Passkey detail response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey detail API error:', error);
      throw new Error('Network error while fetching passkey details');
    }
  },

  /**
   * Delete a passkey
   */
  async delete(id: string): Promise<AuthResponse> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.passkeys.detail(id), {
        method: 'DELETE',
        headers: getSecureHeaders(),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' },
        };
      }

      const data = await response.json();
      logDebug('Passkey delete response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Passkey delete API error:', error);
      throw new Error('Network error while deleting passkey');
    }
  },
};

/**
 * Email Verification API
 */
export const EmailVerificationAPI = {
  /**
   * Send OTP to user's email
   */
  async sendOtp(): Promise<AuthResponse<SendOtpResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const response = await fetchWithAuth(endpoints.auth.otp, {
        method: 'POST',
        headers: getSecureHeaders(),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Send OTP response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Send OTP API error:', error);
      throw new Error('Network error while sending OTP');
    }
  },

  /**
   * Verify OTP code
   */
  async verifyOtp(otpCode: string): Promise<AuthResponse<VerifyOtpResponse>> {
    try {
      const { fetchWithAuth } = await import('@/libs');

      const body: VerifyOtpRequest = { otp_code: otpCode };

      const response = await fetchWithAuth(endpoints.auth.verify, {
        method: 'POST',
        headers: getSecureHeaders(),
        body: JSON.stringify(body),
      });

      if (!response) {
        return {
          response: null,
          data: { success: false, message: 'Unauthorized request' } as any,
        };
      }

      const data = await response.json();
      logDebug('Verify OTP response:', data);

      if (isErrorResponse(data)) {
        handleErrorResponse(data);
      }

      return { response, data };
    } catch (error) {
      logError('Verify OTP API error:', error);
      throw new Error('Network error during OTP verification');
    }
  },
};
