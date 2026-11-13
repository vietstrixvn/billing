import { getErrorMessage, isSuccess, logWarn, type ErrorCode } from '@/utils';
import { useCallback } from 'react';
import { toast } from 'sonner';

export interface ErrorResponse {
  code?: ErrorCode;
  message?: string;
  success?: boolean;
  data?: any;
}

export interface ApiError {
  response?: {
    data?: ErrorResponse;
    status?: number;
  };
  message?: string;
}

/**
 * Safely unwrap response or error object from various API transport formats:
 * - handleAPI return: { response: Response, data: ErrorResponse | any }
 * - Axios error return: { response: { data: ErrorResponse } }
 * - Direct backend payload: { code: 0, success: true, message: "...", data: ... }
 * - Standard REST/Next.js API payload: { success: true, message: "..." }
 */
export function unwrapApiResponse(raw: any): {
  code?: ErrorCode;
  message?: string;
  success?: boolean;
  data?: any;
  hasStructure: boolean;
} {
  if (!raw || typeof raw !== 'object') {
    return { hasStructure: false };
  }

  // Handle handleAPI return: { response: Response, data: ... }
  if ('data' in raw && raw.data && typeof raw.data === 'object' && ('code' in raw.data || 'success' in raw.data || 'message' in raw.data)) {
    return { ...raw.data, hasStructure: true };
  }

  // Handle Axios error shape: { response: { data: ... } }
  if ('response' in raw && raw.response && typeof raw.response === 'object' && 'data' in raw.response && raw.response.data && typeof raw.response.data === 'object') {
    return { ...raw.response.data, hasStructure: true };
  }

  // Handle direct API response object: { code: ..., success: ..., message: ... }
  if ('code' in raw || 'success' in raw || 'message' in raw) {
    return { ...raw, hasStructure: true };
  }

  return { hasStructure: false };
}

/**
 * Custom hook to handle API error & success responses
 * Automatically unwraps nested response objects and displays appropriate toasts
 */
export const useErrorHandler = () => {
  /**
   * Handle error response from backend
   * @param error - Error response from API (can be ErrorResponse, handleAPI result, or ApiError)
   * @param customMessages - Optional custom messages for specific error codes
   */
  const handleError = useCallback(
    (
      error: ErrorResponse | ApiError | unknown,
      customMessages?: Partial<Record<ErrorCode, string>>
    ) => {
      const unwrapped = unwrapApiResponse(error);

      if (unwrapped.hasStructure) {
        const { code, message, success } = unwrapped;

        // Don't show error toast if code or success flag indicates success
        if (code !== undefined && isSuccess(code)) {
          return;
        }
        if (success === true && (code === undefined || isSuccess(code))) {
          return;
        }

        // Priority: custom message > API message > default message for error code > fallback
        const displayMessage =
          (code !== undefined ? customMessages?.[code] : undefined) ||
          message ||
          (code !== undefined ? getErrorMessage(code) : undefined) ||
          'An error occurred';

        toast.error(displayMessage);
        return;
      }

      // Case: Error object with message property (e.g. standard Error object)
      if (
        error &&
        typeof error === 'object' &&
        'message' in error &&
        typeof (error as any).message === 'string'
      ) {
        toast.error((error as any).message);
        return;
      }

      // Case: Direct string error
      if (typeof error === 'string') {
        toast.error(error);
        return;
      }

      // Fallback for unknown error format
      toast.error('An unknown error occurred');
    },
    []
  );

  /**
   * Handle success response from backend
   * @param response - Success response from API (can be handleAPI return or direct payload)
   * @param successMessage - Optional custom success message
   */
  const handleSuccess = useCallback(
    (response: any, successMessage?: string) => {
      if (!response) {
        if (successMessage) {
          toast.success(successMessage);
        }
        return;
      }

      const unwrapped = unwrapApiResponse(response);

      if (unwrapped.hasStructure) {
        const { code, message, success } = unwrapped;

        // Check if code or success flag explicitly indicates failure
        const codeIsFailure = code !== undefined && !isSuccess(code);
        const successIsFailure = success === false;

        if (codeIsFailure || successIsFailure) {
          logWarn('[WARNING] Response in handleSuccess indicates error:', unwrapped);
          const displayMessage =
            (code !== undefined ? getErrorMessage(code) : undefined) ||
            message ||
            'Operation failed';
          toast.error(displayMessage);
          return;
        }

        // Success!
        const displayMessage =
          successMessage ||
          message ||
          (code !== undefined ? getErrorMessage(code) : undefined) ||
          'Operation completed successfully';

        toast.success(displayMessage);
        return;
      }

      // Primitive response or custom object without standard structure:
      const displayMessage =
        successMessage ||
        (typeof response === 'string'
          ? response
          : 'Operation completed successfully');
      toast.success(displayMessage);
    },
    []
  );

  return {
    handleError,
    handleSuccess,
  };
};

