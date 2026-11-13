import {
  ServiceCategory,
  ServiceItem,
  Plan,
  PlanIncludedItem,
  CreateServiceCategoryRequest,
  CreateServiceItemRequest,
  CreatePlanRequest,
} from '@/types/billing/responses';

/**
 * Clean Architecture - Usecase/Service Layer for Service Catalog & Plans
 */
export class CatalogService {
  /**
   * Chuẩn hóa Mã Code cho Category / Item / Plan (slug-like, uppercase)
   */
  public static formatCode(raw: string): string {
    return raw
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_]/g, '_');
  }

  /**
   * Validation khi tạo Danh mục dịch vụ (Service Category)
   */
  public static validateCategory(req: CreateServiceCategoryRequest): {
    isValid: boolean;
    errorMessage?: string;
  } {
    if (!req.name || req.name.trim().length === 0) {
      return { isValid: false, errorMessage: 'Tên danh mục không được để trống.' };
    }
    if (!req.code || req.code.trim().length === 0) {
      return { isValid: false, errorMessage: 'Mã danh mục (code) không được để trống.' };
    }
    return { isValid: true };
  }

  /**
   * Validation khi tạo Dịch vụ/Tính năng (Service Item)
   */
  public static validateServiceItem(req: CreateServiceItemRequest): {
    isValid: boolean;
    errorMessage?: string;
  } {
    if (!req.category_id) {
      return { isValid: false, errorMessage: 'Vui lòng chọn danh mục dịch vụ.' };
    }
    if (!req.name || req.name.trim().length === 0) {
      return { isValid: false, errorMessage: 'Tên dịch vụ không được để trống.' };
    }
    if (!req.code || req.code.trim().length === 0) {
      return { isValid: false, errorMessage: 'Mã dịch vụ không được để trống.' };
    }
    return { isValid: true };
  }

  /**
   * Calculate plan total estimated monthly value from included items
   */
  public static calculatePlanValue(includedItems: { quantity: number; unit_price?: number }[]): number {
    return includedItems.reduce((acc, item) => {
      const price = item.unit_price || 0;
      return acc + price * item.quantity;
    }, 0);
  }
}
