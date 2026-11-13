import { Refund } from '@/types/billing/responses';

/**
 * Refund Service — Usecase Layer cho Quản lý Hoàn Tiền
 */
export class RefundService {
  /**
   * Validate yêu cầu hoàn tiền
   */
  public static validateRefund(
    paidAmount: number,
    requestedRefundAmount: number
  ): { isValid: boolean; errorMessage?: string } {
    if (requestedRefundAmount <= 0) {
      return { isValid: false, errorMessage: 'Số tiền hoàn phải lớn hơn 0.' };
    }
    if (requestedRefundAmount > paidAmount) {
      return {
        isValid: false,
        errorMessage: `Số tiền yêu cầu hoàn (${requestedRefundAmount.toLocaleString()} VND) không được vượt quá số tiền đã thanh toán (${paidAmount.toLocaleString()} VND).`,
      };
    }
    return { isValid: true };
  }
}
