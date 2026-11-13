import { Invoice } from '@/types/billing/responses';
import { CreateInvoiceDTO } from '@/types/billing/dto';

/**
 * Invoice Service — Clean Architecture Usecase
 * Quản lý tính toán thuế, phát hành Hóa đơn VAT
 */
export class InvoiceService {
  /**
   * Tính toán tiền thuế GTGT (VAT) dựa trên subtotal và tax_rate_bps (1000 bps = 10%)
   */
  public static calculateTax(subtotal: number, taxRateBps: number): {
    taxAmount: number;
    totalAmount: number;
  } {
    const taxAmount = Math.round((subtotal * taxRateBps) / 10000);
    const totalAmount = subtotal + taxAmount;
    return { taxAmount, totalAmount };
  }

  /**
   * Tự động sinh mã Hóa đơn INV-YYYY-XXXXXX
   */
  public static generateInvoiceNumber(year: number, seq: number): string {
    const padded = String(seq).padStart(6, '0');
    return `INV-${year}-${padded}`;
  }
}
