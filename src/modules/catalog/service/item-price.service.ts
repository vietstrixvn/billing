import { ItemPrice, PriceTier } from '@/types/billing/responses';

/**
 * Item Price Service — Usecase Layer for Pricing Models
 * Xử lý tính toán đơn giá theo các mô hình: flat, per_unit, tiered, volume, stairstep
 */
export class ItemPriceService {
  /**
   * Tính toán tổng tiền của 1 ServiceItem dựa theo số lượng và Pricing Model
   */
  public static calculateItemTotal(
    price: ItemPrice,
    quantity: number
  ): { totalAmount: number; unitPrice: number; breakdown?: string } {
    if (quantity <= 0) {
      return { totalAmount: 0, unitPrice: 0 };
    }

    const unitAmount = price.unit_amount || price.price || 0;
    const flatAmount = price.flat_amount || 0;
    const pricingModel = price.pricing_model || 'flat';

    switch (pricingModel) {
      case 'flat':
        // Cố định không phụ thuộc số lượng
        return {
          totalAmount: unitAmount + flatAmount,
          unitPrice: unitAmount,
          breakdown: `Flat price: ${unitAmount.toLocaleString()} VND`,
        };

      case 'per_unit':
        // Nhân trực tiếp số lượng: (Unit * Qty) + Flat
        const total = unitAmount * quantity + flatAmount;
        return {
          totalAmount: total,
          unitPrice: unitAmount,
          breakdown: `${quantity} units x ${unitAmount.toLocaleString()} VND`,
        };

      case 'tiered':
        // Tính lũy tiến từng bậc (Tiered Pricing)
        return this.calculateTieredPrice(price.price_tiers || [], quantity, flatAmount);

      case 'volume':
        // Tìm bậc phù hợp rồi áp dụng giá bậc đó cho toàn bộ số lượng
        return this.calculateVolumePrice(price.price_tiers || [], quantity, unitAmount, flatAmount);

      default:
        return {
          totalAmount: unitAmount * quantity,
          unitPrice: unitAmount,
        };
    }
  }

  /**
   * Tính giá lũy tiến bậc thang (Tiered)
   */
  private static calculateTieredPrice(
    tiers: PriceTier[],
    quantity: number,
    flatAmount: number
  ): { totalAmount: number; unitPrice: number; breakdown: string } {
    if (!tiers || tiers.length === 0) {
      return { totalAmount: 0, unitPrice: 0, breakdown: 'No tiers defined' };
    }

    let remaining = quantity;
    let total = flatAmount;
    let breakdownLines: string[] = [];

    // Sắp xếp tiers tăng dần theo min_quantity
    const sortedTiers = [...tiers].sort((a, b) => a.min_quantity - b.min_quantity);

    for (const tier of sortedTiers) {
      if (remaining <= 0) break;

      const tierCapacity =
        tier.max_quantity === null
          ? remaining
          : tier.max_quantity - tier.min_quantity + 1;

      const qtyInTier = Math.min(remaining, tierCapacity);
      const tierCost = qtyInTier * tier.unit_price;

      total += tierCost;
      remaining -= qtyInTier;

      breakdownLines.push(
        `Tier (${tier.min_quantity}-${tier.max_quantity || '∞'}): ${qtyInTier} x ${tier.unit_price.toLocaleString()} VND`
      );
    }

    const avgUnitPrice = quantity > 0 ? Math.round(total / quantity) : 0;

    return {
      totalAmount: total,
      unitPrice: avgUnitPrice,
      breakdown: breakdownLines.join(' | '),
    };
  }

  /**
   * Tính giá Volume (Volume Pricing)
   */
  private static calculateVolumePrice(
    tiers: PriceTier[],
    quantity: number,
    defaultUnitPrice: number,
    flatAmount: number
  ): { totalAmount: number; unitPrice: number; breakdown: string } {
    if (!tiers || tiers.length === 0) {
      const total = defaultUnitPrice * quantity + flatAmount;
      return { totalAmount: total, unitPrice: defaultUnitPrice, breakdown: 'Default volume price' };
    }

    // Tìm bậc mà quantity rơi vào
    const matchedTier = tiers.find(
      (t) =>
        quantity >= t.min_quantity &&
        (t.max_quantity === null || quantity <= t.max_quantity)
    );

    const applicableUnitPrice = matchedTier ? matchedTier.unit_price : defaultUnitPrice;
    const total = applicableUnitPrice * quantity + flatAmount;

    return {
      totalAmount: total,
      unitPrice: applicableUnitPrice,
      breakdown: `Volume Tier: All ${quantity} units at ${applicableUnitPrice.toLocaleString()} VND/unit`,
    };
  }
}
