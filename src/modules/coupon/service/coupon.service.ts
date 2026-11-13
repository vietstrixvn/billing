import { Coupon, CouponCode } from '@/types/billing/responses';
import { ValidateCouponCodeDTO } from '@/types/billing/dto';

/**
 * Coupon Service — Usecase Layer cho Mã Giảm Giá & Khuyến Mãi
 */
export class CouponService {
  /**
   * Validate tính hợp lệ của Mã Coupon khi áp dụng vào Đơn hàng
   */
  public static validateCoupon(
    coupon: Coupon,
    couponCode: CouponCode,
    dto: ValidateCouponCodeDTO
  ): {
    isValid: boolean;
    discountAmount: number;
    finalAmount: number;
    errorMessage?: string;
  } {
    // 1. Kiểm tra trạng thái Kích hoạt
    if (!coupon.is_active || !couponCode.is_active) {
      return { isValid: false, discountAmount: 0, finalAmount: dto.subscription_amount, errorMessage: 'Mã giảm giá đã bị khóa hoặc ngừng áp dụng.' };
    }

    // 2. Kiểm tra Hạn sử dụng
    const now = new Date();
    if (coupon.valid_from && new Date(coupon.valid_from) > now) {
      return { isValid: false, discountAmount: 0, finalAmount: dto.subscription_amount, errorMessage: 'Mã giảm giá chưa đến đợt áp dụng.' };
    }
    if (coupon.valid_until && new Date(coupon.valid_until) < now) {
      return { isValid: false, discountAmount: 0, finalAmount: dto.subscription_amount, errorMessage: 'Mã giảm giá đã hết hạn sử dụng.' };
    }

    // 3. Kiểm tra Giới hạn số lượt dùng (Max Redemptions)
    const timesRedeemed = (couponCode as any).times_redeemed || 0;
    if (couponCode.max_redemptions && timesRedeemed >= couponCode.max_redemptions) {
      return { isValid: false, discountAmount: 0, finalAmount: dto.subscription_amount, errorMessage: 'Mã giảm giá đã hết lượt sử dụng.' };
    }

    // 4. Tính toán số tiền giảm
    let discountAmount = 0;
    const originalAmount = dto.subscription_amount;
    const couponAmount = (coupon as any).amount || (coupon as any).discount_value || 0;

    if (coupon.discount_type === 'percentage') {
      // Giảm theo %
      discountAmount = Math.round((originalAmount * couponAmount) / 100);
    } else if (coupon.discount_type === 'fixed_amount') {
      // Giảm theo số tiền cố định
      discountAmount = couponAmount;
    }

    // Đảm bảo discount không vượt quá tổng tiền
    discountAmount = Math.min(discountAmount, originalAmount);
    const finalAmount = Math.max(0, originalAmount - discountAmount);

    return {
      isValid: true,
      discountAmount,
      finalAmount,
    };
  }
}
