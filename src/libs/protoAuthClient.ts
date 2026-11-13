/**
 * Proto Auth Client
 * Interface & client methods matching `proto/auth.proto` (AuthService)
 */

export interface ProtoUserInfo {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  avatar_url?: string;
  status: string;
}

export interface ProtoLoginRequest {
  username: string;
  password: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ProtoLoginResponse {
  success: boolean;
  message?: string;
  requires_2fa: boolean;
  temp_token?: string;
  access_token?: string;
  refresh_token?: string;
  token_type?: string;
  expires_in?: number;
  user?: ProtoUserInfo;
}

export interface ProtoVerify2FARequest {
  temp_token: string;
  code: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ProtoRefreshTokenRequest {
  refresh_token: string;
  ip_address?: string;
  user_agent?: string;
}

export interface ProtoRefreshTokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
}

export interface ProtoValidateTokenRequest {
  access_token: string;
}

export interface ProtoValidateTokenResponse {
  is_valid: boolean;
  user_id: number;
  username: string;
  email: string;
  role: string;
  permissions: string[];
  error_message?: string;
}

export interface ProtoGetProfileResponse {
  user: ProtoUserInfo;
  roles: string[];
  permissions: Record<string, { actions: string[] }>;
}

/**
 * Service Client wrapping gRPC Auth Server endpoints
 */
export const ProtoAuthService = {
  /**
   * RPC Login (Username/Password -> LoginResponse)
   */
  async login(payload: ProtoLoginRequest): Promise<ProtoLoginResponse> {
    const { endpoints, handleAPI } = await import('@/apis');
    const { response, data } = await handleAPI(endpoints.auth.login, 'POST', payload);
    if (!response.ok) {
      throw new Error(data?.message || 'Login failed via AuthService');
    }
    return data?.data || data;
  },

  /**
   * RPC Verify2FA (temp_token + code -> LoginResponse)
   */
  async verify2FA(payload: ProtoVerify2FARequest): Promise<ProtoLoginResponse> {
    const { endpoints, handleAPI } = await import('@/apis');
    const { response, data } = await handleAPI(endpoints.two_fa.verifyLogin, 'POST', payload);
    if (!response.ok) {
      throw new Error(data?.message || '2FA Verification failed via AuthService');
    }
    return data?.data || data;
  },

  /**
   * RPC RefreshToken (refresh_token -> RefreshTokenResponse)
   */
  async refreshToken(payload: ProtoRefreshTokenRequest): Promise<ProtoRefreshTokenResponse> {
    const { endpoints, handleAPI } = await import('@/apis');
    const { response, data } = await handleAPI(endpoints.auth.refresh, 'POST', payload);
    if (!response.ok) {
      throw new Error(data?.message || 'Token refresh failed via AuthService');
    }
    return data?.data || data;
  },

  /**
   * RPC GetProfile (user_id -> GetProfileResponse)
   */
  async getProfile(): Promise<ProtoGetProfileResponse> {
    const { endpoints, handleAPI } = await import('@/apis');
    const { response, data } = await handleAPI(endpoints.auth.profile, 'GET');
    if (!response.ok) {
      throw new Error(data?.message || 'Failed to fetch profile via AuthService');
    }
    return data?.data || data;
  },
};
