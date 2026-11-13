/**
 * ==========================
 * 📌 Service Hooks (Re-exports)
 * ==========================
 *
 * This file provides convenient re-exports for service-related hooks.
 * Use this for backward compatibility or simplified imports.
 */

// Service Categories
export {
  useServiceCategories,
  useServiceCategoryDetail,
  useServiceCategoryByCode,
  useCreateServiceCategory,
  useUpdateServiceCategory,
  useDeleteServiceCategory,
} from './useServiceCategory';

// Service Items
export {
  useServiceItems,
  useServiceItemDetail,
  useServiceItemByCode,
  useCreateServiceItem,
  useUpdateServiceItem,
  useDeleteServiceItem,
} from './useServiceItem';
