/**
 * ==========================
 * 📧 Email Verification Actions
 * ==========================
 *
 * Actions for email verification with OTP
 */

import { logDebug, logError } from '@/utils';
import { toast } from 'sonner';
import { EmailVerificationAPI } from '../api';
import { handleAuthError } from '../utils';

/**
 * Send OTP to user's email
 */
export async function sendEmailOtp(
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await EmailVerificationAPI.sendOtp();

    logDebug('[EmailVerificationActions] Send OTP response:', {
      response,
      data,
    });

    if (response.ok && data?.success) {
      setState({ loading: false });

      logDebug('[EmailVerificationActions] OTP sent successfully');
      toast.success(data?.message || 'Verification code sent to your email!');
      return true;
    }

    const errorMsg = data?.message || 'Failed to send verification code';
    logError('[EmailVerificationActions] Send OTP failed:', errorMsg);
    throw new Error(errorMsg);
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[EmailVerificationActions] Send OTP error:', error);
    return false;
  }
}

/**
 * Verify OTP code
 */
export async function verifyEmailOtp(
  otpCode: string,
  setState: (state: any) => void
): Promise<boolean> {
  try {
    setState({ loading: true, error: null });

    const { response, data } = await EmailVerificationAPI.verifyOtp(otpCode);

    if (response.ok && data?.success) {
      setState({ loading: false });

      // Invalidate user query to refresh verified status
      try {
        const { queryClient } = await import('@/libs');
        await queryClient.invalidateQueries({ queryKey: ['me'] });
      } catch (queryError) {
        logError(
          '[EmailVerificationActions] Failed to invalidate user query:',
          queryError
        );
      }

      logDebug('[EmailVerificationActions] Email verified successfully');
      toast.success('Email verified successfully!');
      return true;
    }

    if (response.status === 400) {
      throw new Error('Invalid or expired verification code');
    }

    throw new Error(data?.message || 'Email verification failed');
  } catch (error) {
    const errorMessage = handleAuthError(error);
    setState({ loading: false, error: errorMessage });
    toast.error(errorMessage);
    logError('[EmailVerificationActions] Verify OTP error:', error);
    return false;
  }
}
