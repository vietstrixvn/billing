import { Quote, BillingLineItem } from '@/types/billing/responses';
import { CreateQuoteDTO, CreateQuoteLineItemDTO } from '@/types/billing/dto';

/**
 * Quote Service — Usecase Layer cho Báo Giá Doanh Nghiệp (Enterprise B2B Quote)
 */
export class QuoteService {
  /**
   * Tính toán tổng tiền Báo giá từ danh sách dòng chi tiết (Quote Line Items)
   */
  public static calculateQuoteTotal(items: CreateQuoteLineItemDTO[], discountBps: number = 0, taxRateBps: number = 0): {
    subtotal: number;
    discountAmount: number;
    taxAmount: number;
    totalAmount: number;
  } {
    let subtotal = 0;

    for (const item of items) {
      const lineTotal = item.quantity * item.unit_price;
      const lineDiscountBps = item.discount_bps || 0;
      const lineDiscount = Math.round((lineTotal * lineDiscountBps) / 100);
      subtotal += lineTotal - lineDiscount;
    }

    const discountAmount = Math.round((subtotal * discountBps) / 10000);
    const afterDiscount = Math.max(0, subtotal - discountAmount);

    const taxAmount = Math.round((afterDiscount * taxRateBps) / 10000);
    const totalAmount = afterDiscount + taxAmount;

    return {
      subtotal,
      discountAmount,
      taxAmount,
      totalAmount,
    };
  }

  /**
   * Tự động sinh mã Báo giá QUOTE-YYYY-XXXXXX
   */
  public static generateQuoteNumber(year: number, seq: number): string {
    const padded = String(seq).padStart(6, '0');
    return `QUOTE-${year}-${padded}`;
  }
}
