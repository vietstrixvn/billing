import { Addon, AddonPrice, SubscriptionAddon } from '@/types/billing/responses';
import { CreateAddonDTO, CreateAddonPriceDTO, AddAddonToSubscriptionDTO } from '@/types/billing/dto';

/**
 * Addon Service — Clean Architecture Usecase Layer
 * Quản lý các dịch vụ mua thêm ngoài gói (Extra seat, Extra storage, Dedicated IP)
 */
export class AddonService {
  /**
   * Validate dữ liệu khi tạo Addon mới
   */
  public static validateAddon(dto: CreateAddonDTO): { isValid: boolean; errorMessage?: string } {
    if (!dto.name || dto.name.trim().length === 0) {
      return { isValid: false, errorMessage: 'Tên dịch vụ Addon không được để trống.' };
    }
    if (!dto.slug || dto.slug.trim().length === 0) {
      return { isValid: false, errorMessage: 'Mã slug Addon không được để trống.' };
    }
    return { isValid: true };
  }

  /**
   * Tính toán chi phí Addon gắn vào Subscription dựa theo số lượng
   */
  public static calculateAddonCost(
    addonPrice: AddonPrice,
    quantity: number
  ): { totalCost: number; unitPrice: number } {
    const qty = Math.max(1, quantity);
    const unitPrice = addonPrice.unit_amount || 0;

    if (addonPrice.pricing_model === 'flat') {
      return { totalCost: unitPrice, unitPrice };
    }

    // Default per_unit
    return { totalCost: unitPrice * qty, unitPrice };
  }

  /**
   * Khởi tạo đối tượng SubscriptionAddon mới
   */
  public static attachAddonToSubscription(
    subscriptionId: string,
    dto: AddAddonToSubscriptionDTO,
    unitPrice: number
  ): Record<string, unknown> {
    const totalAmount = unitPrice * dto.quantity;
    return {
      id: Date.now().toString(),
      subscription_id: subscriptionId,
      addon_id: dto.addon_id,
      price_id: dto.price_id,
      quantity: dto.quantity,
      unit_price: unitPrice,
      total_price: totalAmount,
      currency: 'VND',
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
  }
}
