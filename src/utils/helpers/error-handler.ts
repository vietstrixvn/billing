import { toast } from 'sonner';
import { getErrorMessage, isSuccess, type ErrorCode } from './code.helper';

interface ErrorResponse {
  code?: ErrorCode;
  message?: string;
  success?: boolean;
}

const unwrap = (raw: any): { code?: ErrorCode; message?: string; success?: boolean } | null => {
  if (!raw || typeof raw !== 'object') return null;
  if ('data' in raw && raw.data && typeof raw.data === 'object' && ('code' in raw.data || 'success' in raw.data || 'message' in raw.data)) {
    return raw.data;
  }
  if ('response' in raw && raw.response && typeof raw.response === 'object' && 'data' in raw.response && raw.response.data && typeof raw.response.data === 'object') {
    return raw.response.data;
  }
  if ('code' in raw || 'success' in raw || 'message' in raw) {
    return raw;
  }
  return null;
};

/**
 * Handle error response from backend (for non-hook usage like Zustand stores)
 * @param error - Error response from API
 * @param customMessages - Optional custom messages for specific error codes
 * @param showToast - Whether to show toast notification (default: false for store usage)
 * @returns Error message string
 */
export const handleErrorResponse = (
  error: ErrorResponse | unknown,
  customMessages?: Partial<Record<ErrorCode, string>>,
  showToast: boolean = false
): string => {
  const extracted = unwrap(error);

  if (extracted) {
    const { code, message, success } = extracted;

    if (code !== undefined && isSuccess(code)) {
      return getErrorMessage(code);
    }
    if (success === true && (code === undefined || isSuccess(code))) {
      return message || 'Success';
    }

    const errorMsg =
      (code !== undefined ? customMessages?.[code] : undefined) ||
      message ||
      (code !== undefined ? getErrorMessage(code) : undefined) ||
      'Đã xảy ra lỗi không xác định';

    if (showToast) {
      toast.error(errorMsg);
    }

    return errorMsg;
  }

  const fallbackMessage =
    error && typeof error === 'object' && 'message' in error && typeof (error as any).message === 'string'
      ? (error as any).message
      : 'Đã xảy ra lỗi không xác định';

  if (showToast) {
    toast.error(fallbackMessage);
  }

  return fallbackMessage;
};

/**
 * Handle success response from backend (for non-hook usage)
 * @param response - Success response from API
 * @param successMessage - Optional custom success message
 */
export const handleSuccessResponse = (
  response: any,
  successMessage?: string
): void => {
  const extracted = unwrap(response);
  if (!extracted) {
    if (successMessage) toast.success(successMessage);
    return;
  }

  if (extracted.code !== undefined ? isSuccess(extracted.code) : extracted.success !== false) {
    toast.success(
      successMessage || extracted.message || (extracted.code !== undefined ? getErrorMessage(extracted.code) : 'Thành công')
    );
  }
};

/**
 * Extract error code from API response data
 * @param data - Response data from API
 * @returns Error code if found, null otherwise
 */
export const extractErrorCode = (data: any): ErrorCode | null => {
  const extracted = unwrap(data);
  if (extracted && extracted.code !== undefined) {
    return extracted.code;
  }
  return null;
};

/**
 * Check if response data indicates an error
 * @param data - Response data from API
 * @returns true if response indicates error
 */
export const isErrorResponse = (data: any): boolean => {
  const extracted = unwrap(data);
  if (!extracted) return false;

  if (extracted.success === false) return true;
  if (extracted.code !== undefined && !isSuccess(extracted.code)) return true;

  return false;
};

