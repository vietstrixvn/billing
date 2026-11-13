import {
  useCoupons,
  useCouponDetail,
  useCouponCodes,
  useCouponCanRedeem,
  useCouponCodeById,
  useCouponCodeByCode,
} from '@/hooks/billing/useCoupon';
import type { Filters } from '@/types';

/**
 * Coupons List Response Lib
 */
export const CouponList = (
  currentPage: number,
  filters: Filters,
  refreshKey: number
) => {
  const { data, isLoading, isError } = useCoupons(
    currentPage,
    filters,
    refreshKey
  );

  const pagination = data?.data?.pagination ?? {
    current_page: 1,
    page_size: 10,
    total_pages: 1,
    total_records: 0,
    has_next: false,
    has_prev: false,
  };

  const coupons = data?.data?.results ?? [];

  return {
    coupons,
    isLoading,
    isError,
    pagination,
  };
};

/**
 * Coupon Detail Response Lib
 */
export const CouponDetail = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useCouponDetail(id, refreshKey);

  const coupon = data?.data ?? null;

  return {
    coupon,
    isLoading,
    isError,
  };
};

/**
 * Coupon Codes Response Lib
 */
export const CouponCodeList = (couponId: string, refreshKey: number) => {
  const { data, isLoading, isError } = useCouponCodes(couponId, refreshKey);

  const codes = data?.data ?? [];

  return {
    codes,
    isLoading,
    isError,
  };
};

/**
 * Coupon Can Redeem Response Lib
 */
export const CouponCanRedeem = (id: string) => {
  const { data, isLoading, isError } = useCouponCanRedeem(id);

  const canRedeem = data?.data ?? null;

  return {
    canRedeem,
    isLoading,
    isError,
  };
};

/**
 * Coupon Code By ID Response Lib
 */
export const CouponCodeById = (id: string, refreshKey: number) => {
  const { data, isLoading, isError } = useCouponCodeById(id, refreshKey);

  const code = data?.data ?? null;

  return {
    code,
    isLoading,
    isError,
  };
};

/**
 * Coupon Code By Code String Response Lib
 */
export const CouponCodeByCode = (code: string, refreshKey: number) => {
  const { data, isLoading, isError } = useCouponCodeByCode(code, refreshKey);

  const couponCode = data?.data ?? null;

  return {
    couponCode,
    isLoading,
    isError,
  };
};
