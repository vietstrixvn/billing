import {
  JournalEntry,
  JournalEntryLine,
  JournalEntryType,
  JournalEntryStatus,
  CreateJournalEntryDTO,
} from '@/types/billing/accounting';

/**
 * Clean Architecture - Usecase/Service Layer for Accounting
 * Logic xử lý nghiệp vụ hạch toán kế toán kép (VAS Standard)
 */
export class AccountingService {
  /**
   * Validate quy tắc kế toán kép: Tổng Nợ (Debit) phải bằng Tổng Có (Credit)
   */
  public static validateBalancedEntry(lines: { debit_amount: number; credit_amount: number }[]): {
    isValid: boolean;
    totalDebit: number;
    totalCredit: number;
    errorMessage?: string;
  } {
    if (!lines || lines.length < 2) {
      return {
        isValid: false,
        totalDebit: 0,
        totalCredit: 0,
        errorMessage: 'Một bút toán phải chứa ít nhất 2 dòng (1 dòng Nợ và 1 dòng Có).',
      };
    }

    let totalDebit = 0;
    let totalCredit = 0;

    for (const line of lines) {
      const debit = Math.round(Number(line.debit_amount) || 0);
      const credit = Math.round(Number(line.credit_amount) || 0);

      if (debit > 0 && credit > 0) {
        return {
          isValid: false,
          totalDebit,
          totalCredit,
          errorMessage: 'Một dòng chi tiết không được chứa cả Nợ và Có đồng thời.',
        };
      }

      totalDebit += debit;
      totalCredit += credit;
    }

    if (totalDebit !== totalCredit) {
      return {
        isValid: false,
        totalDebit,
        totalCredit,
        errorMessage: `Bút toán không cân: Tổng Nợ (${totalDebit.toLocaleString()} VND) != Tổng Có (${totalCredit.toLocaleString()} VND).`,
      };
    }

    return { isValid: true, totalDebit, totalCredit };
  }

  /**
   * Tự động sinh mã Bút toán chuẩn JE-YYYY-XXXXXX
   */
  public static generateEntryNumber(year: number, sequence: number): string {
    const paddedSeq = String(sequence).padStart(6, '0');
    return `JE-${year}-${paddedSeq}`;
  }

  /**
   * Bút toán tự động khi Xuất Hóa đơn (Invoice Issued) cho Customer
   * Nợ 131 (Phải thu): Total
   *   Có 5113 (Doanh thu DV): Subtotal
   *   Có 33311 (Thuế GTGT): Tax
   */
  public static createInvoiceIssuedEntry(params: {
    customerId: string;
    invoiceId: string;
    invoiceNumber: string;
    subtotal: number;
    taxAmount: number;
    totalAmount: number;
    currency?: string;
  }): Partial<JournalEntry> {
    const currency = params.currency || 'VND';
    const lines: Partial<JournalEntryLine>[] = [
      {
        account_code: '131',
        account_name: 'Phải thu của khách hàng',
        debit_amount: params.totalAmount,
        credit_amount: 0,
        currency,
        description: `Xuất hóa đơn ${params.invoiceNumber}`,
        sort_order: 1,
      },
      {
        account_code: '5113',
        account_name: 'Doanh thu cung cấp dịch vụ',
        debit_amount: 0,
        credit_amount: params.subtotal,
        currency,
        description: `Doanh thu hóa đơn ${params.invoiceNumber}`,
        sort_order: 2,
      },
    ];

    if (params.taxAmount > 0) {
      lines.push({
        account_code: '33311',
        account_name: 'Thuế GTGT đầu ra phải nộp',
        debit_amount: 0,
        credit_amount: params.taxAmount,
        currency,
        description: `Thuế GTGT hóa đơn ${params.invoiceNumber}`,
        sort_order: 3,
      });
    }

    return {
      customer_id: params.customerId,
      type: 'invoice_issued',
      status: 'posted',
      source_type: 'invoice',
      source_id: params.invoiceId,
      total_debit: params.totalAmount,
      total_credit: params.totalAmount,
      currency,
      notes: `Hạch toán hóa đơn ${params.invoiceNumber} cho khách hàng #${params.customerId}`,
      lines: lines as JournalEntryLine[],
    };
  }

  /**
   * Bút toán tự động khi Nhận Thanh toán (Payment Received) cho Customer
   * Nợ 1121 (Tiền gửi NH): Paid Amount
   *   Có 131 (Phải thu): Paid Amount
   */
  public static createPaymentReceivedEntry(params: {
    customerId: string;
    billingRecordId: string;
    paymentRef: string;
    paidAmount: number;
    currency?: string;
  }): Partial<JournalEntry> {
    const currency = params.currency || 'VND';
    return {
      customer_id: params.customerId,
      type: 'payment_received',
      status: 'posted',
      source_type: 'billing_record',
      source_id: params.billingRecordId,
      total_debit: params.paidAmount,
      total_credit: params.paidAmount,
      currency,
      notes: `Thu tiền thanh toán #${params.paymentRef} cho khách hàng #${params.customerId}`,
      lines: [
        {
          account_code: '1121',
          account_name: 'Tiền gửi ngân hàng - VND',
          debit_amount: params.paidAmount,
          credit_amount: 0,
          currency,
          description: `Thu tiền thanh toán ${params.paymentRef}`,
          sort_order: 1,
        },
        {
          account_code: '131',
          account_name: 'Phải thu của khách hàng',
          debit_amount: 0,
          credit_amount: params.paidAmount,
          currency,
          description: `Ghi giảm nợ phải thu ${params.paymentRef}`,
          sort_order: 2,
        },
      ] as JournalEntryLine[],
    };
  }
}
