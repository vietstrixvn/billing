import {
  Subscription,
  SubscriptionStatus,
  BillingCycle,
} from '@/types/billing/responses';
import { CreateSubscriptionDTO } from '@/types/billing/dto';

/**
 * Subscription Service — Clean Architecture Usecase
 * Quản lý vòng đời đăng ký dịch vụ theo customer_id
 */
export class SubscriptionService {
  /**
   * Tính ngày hết hạn dựa theo billing_cycle từ thời điểm bắt đầu
   */
  public static calculateExpiryDate(startDate: Date, cycle: BillingCycle): Date {
    const expiry = new Date(startDate);
    switch (cycle) {
      case 'monthly':
        expiry.setMonth(expiry.getMonth() + 1);
        break;
      case 'quarterly':
        expiry.setMonth(expiry.getMonth() + 3);
        break;
      case 'semi-annually':
        expiry.setMonth(expiry.getMonth() + 6);
        break;
      case 'annual':
        expiry.setFullYear(expiry.getFullYear() + 1);
        break;
      case 'biennial':
        expiry.setFullYear(expiry.getFullYear() + 2);
        break;
      default:
        expiry.setMonth(expiry.getMonth() + 1);
    }
    return expiry;
  }

  /**
   * Khởi tạo đối tượng Subscription mới cho Customer
   */
  public static createSubscription(dto: CreateSubscriptionDTO): Partial<Subscription> {
    const startedAt = new Date();
    const expiresAt = this.calculateExpiryDate(startedAt, dto.billing_cycle as BillingCycle);

    return {
      id: Date.now().toString(),
      property_id: Number(dto.property_id), // customer_id Snowflake ID
      plan_code: dto.plan_code.toUpperCase(),
      status: 'active' as SubscriptionStatus,
      started_at: startedAt.toISOString(),
      expires_at: expiresAt.toISOString(),
      billing_cycle: dto.billing_cycle as BillingCycle,
      currency: 'VND',
      auto_renew: dto.auto_renew ?? true,
      discount_code: dto.discount_code || undefined,
      notes: dto.notes || null,
      created_at: startedAt.toISOString(),
      updated_at: startedAt.toISOString(),
    };
  }
}
