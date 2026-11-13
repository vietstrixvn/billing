/**
 * ==========================
 * 🔐 Passkey Authentication Actions
 * ==========================
 *
 * Actions for WebAuthn/FIDO2 passkey authentication
 */

import {
  PasskeyRegistrationBeginData,
  PasskeyLoginBeginData,
  PasskeyItem,
} from '@/types';
import { logDebug, logError } from '@/utils';
import { toast } from 'sonner';
import { PasskeyAPI } from '../api';
import { handleAuthError } from '../utils';
import { AUTH_CONFIG } from './constants';
import { CookieManager } from '../cookies';

/**
 * Helper: Convert base64url to ArrayBuffer
 */
function base64urlToBuffer(base64url: string): ArrayBuffer {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Helper: Convert ArrayBuffer to base64url
 */
function bufferToBase64url(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  const base64 = btoa(binary);
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}

/**
 * Begin Passkey Registration
 */
export async function beginPasskeyRegistration(
  name: string,
  setState: (state: any) => void
): Promise<PasskeyRegistrationBeginData | null> {
  try {
    setState({ loading: true, error: null });

    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const { response, data } = await PasskeyAPI.beginRegistration(name);

    if (response.ok && data?.success && data?.data) {
      setState({
        passkeyRegistrationOptions: data.data,
        loading: false,
      });

      logDebug('[PasskeyActions] Passkey registration initiated');
      return data.data;
    }

    throw new Error(data?.message || 'Passkey registration setup failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[PasskeyActions] Passkey registration begin error:', error);
    return null;
  }
}

/**
 * Finish Passkey Registration
 */
export async function finishPasskeyRegistration(
  name: string,
  options: PasskeyRegistrationBeginData,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    // Prepare credential creation options
    const publicKey = options.options.publicKey;

    // Convert challenge from base64url to ArrayBuffer
    const credentialCreationOptions: CredentialCreationOptions = {
      publicKey: {
        rp: publicKey.rp,
        user: {
          id: base64urlToBuffer(publicKey.user.id),
          name: publicKey.user.name,
          displayName: publicKey.user.displayName,
        },
        challenge: base64urlToBuffer(publicKey.challenge),
        pubKeyCredParams:
          publicKey.pubKeyCredParams as PublicKeyCredentialParameters[],
        timeout: publicKey.timeout,
        attestation: publicKey.attestation as AttestationConveyancePreference,
        authenticatorSelection: publicKey.authenticatorSelection,
        excludeCredentials: publicKey.excludeCredentials?.map((cred: any) => ({
          id: base64urlToBuffer(cred.id),
          type: 'public-key' as const,
          transports: cred.transports,
        })),
      },
    };

    // Create credential
    const credential = await navigator.credentials.create(
      credentialCreationOptions
    );

    if (!credential) {
      throw new Error('Failed to create credential');
    }

    // Type assertion for PublicKeyCredential
    const pkCredential = credential as PublicKeyCredential;
    const response = pkCredential.response as AuthenticatorAttestationResponse;

    // Prepare credential data for server
    const credentialData = {
      id: pkCredential.id,
      rawId: bufferToBase64url(pkCredential.rawId),
      response: {
        attestationObject: bufferToBase64url(response.attestationObject),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
      },
      type: pkCredential.type,
    };

    // Send to server
    const { response: apiResponse, data } = await PasskeyAPI.finishRegistration(
      name,
      credentialData
    );

    if (apiResponse.ok && data?.success) {
      setState({
        passkeyRegistrationOptions: null,
        loading: false,
      });

      logDebug('[PasskeyActions] Passkey registered successfully');
      toast.success('Passkey registered successfully!');
      return true;
    }

    throw new Error(data?.message || 'Passkey registration failed');
  } catch (error: any) {
    const errorMessage =
      error.name === 'NotAllowedError'
        ? 'Passkey registration was cancelled'
        : handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[PasskeyActions] Passkey registration finish error:', error);
    return false;
  }
}

/**
 * Begin Passkey Login
 */
export async function beginPasskeyLogin(
  username: string | undefined,
  setState: (state: any) => void
): Promise<PasskeyLoginBeginData | null> {
  try {
    setState({ loading: true, error: null });

    // Check WebAuthn support
    if (!window.PublicKeyCredential) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    const { response, data } = await PasskeyAPI.beginLogin(username);

    if (response.ok && data?.success && data?.data) {
      setState({
        passkeyLoginOptions: data.data,
        loading: false,
      });

      logDebug('[PasskeyActions] Passkey login initiated');
      return data.data;
    }

    throw new Error(data?.message || 'Passkey login setup failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[PasskeyActions] Passkey login begin error:', error);
    return null;
  }
}

/**
 * Finish Passkey Login
 */
export async function finishPasskeyLogin(
  options: PasskeyLoginBeginData,
  setAccessTokenWithExpiry: (token: string | null, expiresIn?: number) => void,
  scheduleRefresh: () => void,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    // Prepare credential request options
    const publicKey = options.options.publicKey;

    const credentialRequestOptions: CredentialRequestOptions = {
      publicKey: {
        challenge: base64urlToBuffer(publicKey.challenge),
        timeout: publicKey.timeout,
        rpId: publicKey.rpId,
        allowCredentials:
          publicKey.allowCredentials?.map((cred: any) => ({
            id: base64urlToBuffer(cred.id),
            type: 'public-key' as const,
            transports: cred.transports,
          })) || [],
        userVerification:
          publicKey.userVerification as UserVerificationRequirement,
      },
    };

    // Get credential
    const credential = await navigator.credentials.get(
      credentialRequestOptions
    );

    if (!credential) {
      throw new Error('Failed to get credential');
    }

    // Type assertion for PublicKeyCredential
    const pkCredential = credential as PublicKeyCredential;
    const response = pkCredential.response as AuthenticatorAssertionResponse;

    // Prepare credential data for server
    const credentialData = {
      id: pkCredential.id,
      rawId: bufferToBase64url(pkCredential.rawId),
      response: {
        authenticatorData: bufferToBase64url(response.authenticatorData),
        clientDataJSON: bufferToBase64url(response.clientDataJSON),
        signature: bufferToBase64url(response.signature),
        userHandle: response.userHandle
          ? bufferToBase64url(response.userHandle)
          : '',
      },
      type: pkCredential.type,
    };

    // Send to server
    const { response: apiResponse, data } =
      await PasskeyAPI.finishLogin(credentialData);

    if (apiResponse.ok && data?.success && data?.data?.access_token) {
      const accessToken = data.data.access_token;
      const expiresIn = data.data.expires_in; // Get expires_in from server

      if (!accessToken) {
        throw new Error('No access token received from server');
      }

      // Set access token with expiry info from server
      setAccessTokenWithExpiry(accessToken, expiresIn);

      // ✅ Keep loading state TRUE while we fetch user info and set permissions
      setState({
        passkeyLoginOptions: null,
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

        logDebug('[PasskeyActions] Passkey login successful');
        toast.success('Login successful!');
      } catch (userFetchError) {
        logError('[PasskeyActions] Failed to fetch user info:', userFetchError);
        // Continue anyway - user info will be fetched by useCurrentUser hook
      } finally {
        // ✅ Always set loading to false after everything is complete
        setState({
          loading: false,
        });
      }

      return true;
    }

    throw new Error(data?.message || 'Passkey login failed');
  } catch (error: any) {
    const errorMessage =
      error.name === 'NotAllowedError'
        ? 'Passkey login was cancelled'
        : handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[PasskeyActions] Passkey login finish error:', error);
    return false;
  }
}

/**
 * List Passkeys
 */
export async function listPasskeys(
  setState: (state: any) => void
): Promise<PasskeyItem[]> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await PasskeyAPI.list();

    if (response.ok && data?.success && data?.data) {
      setState({
        registeredPasskeys: data.data,
        loading: false,
      });

      logDebug('[PasskeyActions] Passkeys loaded');
      return data.data;
    }

    throw new Error(data?.message || 'Failed to load passkeys');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    logError('[PasskeyActions] List passkeys error:', error);
    return [];
  }
}

/**
 * Delete Passkey
 */
export async function deletePasskey(
  id: string,
  setState: (state: any) => void,
  getState: () => any
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await PasskeyAPI.delete(id);

    if (response.ok && data?.success) {
      // Remove from state
      const currentPasskeys = getState().registeredPasskeys;
      setState({
        registeredPasskeys: currentPasskeys.filter(
          (pk: PasskeyItem) => pk.id !== id
        ),
        loading: false,
      });

      logDebug('[PasskeyActions] Passkey deleted');
      toast.success('Passkey deleted successfully!');
      return true;
    }

    throw new Error(data?.message || 'Failed to delete passkey');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[PasskeyActions] Delete passkey error:', error);
    return false;
  }
}

/**
 * Clear Passkey State
 */
export function clearPasskeyState(setState: (state: any) => void): void {
  setState({
    passkeyRegistrationOptions: null,
    passkeyLoginOptions: null,
  });
  logDebug('[PasskeyActions] Passkey state cleared');
}

/**
 * Check WebAuthn Support
 */
export async function checkWebAuthnSupport(): Promise<{
  isSupported: boolean;
  isPlatformAuthenticatorAvailable: boolean;
  isConditionalMediationAvailable: boolean;
}> {
  const isSupported = !!window.PublicKeyCredential;

  let isPlatformAuthenticatorAvailable = false;
  let isConditionalMediationAvailable = false;

  if (isSupported) {
    try {
      isPlatformAuthenticatorAvailable =
        await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      logError('Error checking platform authenticator:', error);
    }

    try {
      isConditionalMediationAvailable =
        await PublicKeyCredential.isConditionalMediationAvailable?.();
    } catch (error) {
      logError('Error checking conditional mediation:', error);
    }
  }

  return {
    isSupported,
    isPlatformAuthenticatorAvailable,
    isConditionalMediationAvailable: !!isConditionalMediationAvailable,
  };
}
