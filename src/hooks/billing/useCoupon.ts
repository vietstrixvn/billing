import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { endpoints, handleAPI } from '@/apis';
import type { Filters } from '@/types';
import { buildQueryParams, logError } from '@/utils';
import type {
  FetchCouponsResponse,
  CouponResponse,
  CreateCouponDTO,
  UpdateCouponDTO,
  CouponCodesResponse,
  CreateCouponCodeDTO,
  UpdateCouponCodeDTO,
  ValidateCouponCodeDTO,
  CouponValidationApiResponse,
} from '@/types';
import { useErrorHandler } from '@/hooks/use-error-handler';

/**
 * ==========================
 * 📌 Coupon Hooks
 * ==========================
 */

// Fetch coupons list
const fetchCoupons = async (
  pageParam = 1,
  filters: Filters
): Promise<FetchCouponsResponse> => {
  try {
    const queryString = buildQueryParams(filters, pageParam);
    const response = await handleAPI<FetchCouponsResponse>(
      `${endpoints.coupons.list}${queryString ? `?${queryString}` : ''}`,
      'GET'
    );
    return response.data;
  } catch (error) {
    logError('Error fetching coupons:', error);
    throw error;
  }
};

export const useCoupons = (
  page: number,
  filters: Filters = {},
  refreshKey: number
) => {
  return useQuery<FetchCouponsResponse, Error>({
    queryKey: ['coupons', 'list', page, filters, refreshKey],
    queryFn: () => fetchCoupons(page, filters),
    enabled: page > 0,
    staleTime: 60000,
  });
};

// Fetch coupon detail
const fetchCouponDetail = async (id: string): Promise<CouponResponse> => {
  try {
    const response = await handleAPI<CouponResponse>(endpoints.coupons.detail(id), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching coupon detail:', error);
    throw error;
  }
};

export const useCouponDetail = (id: string, refreshKey: number) => {
  return useQuery<CouponResponse, Error>({
    queryKey: ['coupon', 'detail', id, refreshKey],
    queryFn: () => fetchCouponDetail(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Create coupon
const createCoupon = async (createDto: CreateCouponDTO): Promise<any> => {
  const response = await handleAPI(endpoints.coupons.list, 'POST', createDto);
  return response;
};

export const useCreateCoupon = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateCouponDTO>({
    mutationFn: async (createDto: CreateCouponDTO) => {
      return createCoupon(createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['coupons', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update coupon
const updateCoupon = async (
  id: string,
  updateDto: UpdateCouponDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupons.detail(id),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateCoupon = (id: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateCouponDTO>({
    mutationFn: async (updateDto: UpdateCouponDTO) => {
      return updateCoupon(id, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['coupons', 'list'] });
        queryClient.invalidateQueries({ queryKey: ['coupon', 'detail', id] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete coupon
const deleteCoupon = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.coupons.detail(id), 'DELETE');
  return response;
};

export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deleteCoupon(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['coupons', 'list'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Check if coupon can be redeemed
const checkCouponCanRedeem = async (id: string): Promise<any> => {
  try {
    const response = await handleAPI(endpoints.coupons.canRedeem(id), 'GET');
    return response;
  } catch (error) {
    logError('Error checking coupon redeemability:', error);
    throw error;
  }
};

export const useCouponCanRedeem = (id: string) => {
  return useQuery<any, Error>({
    queryKey: ['coupon', 'can-redeem', id],
    queryFn: () => checkCouponCanRedeem(id),
    enabled: !!id,
    staleTime: 0, // Always fresh check
  });
};

// Calculate discount
const calculateDiscount = async (id: string, data: any): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupons.calculateDiscount(id),
    'POST',
    data
  );
  return response;
};

export const useCalculateDiscount = (id: string) => {
  const { handleError } = useErrorHandler();

  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      return calculateDiscount(id, data);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

/**
 * ==========================
 * 📌 Coupon Code Hooks
 * ==========================
 */

// Fetch coupon codes
const fetchCouponCodes = async (
  couponId: string
): Promise<CouponCodesResponse> => {
  try {
    const response = await handleAPI<CouponCodesResponse>(endpoints.coupons.codes(couponId), 'GET');
    return response.data;
  } catch (error) {
    logError('Error fetching coupon codes:', error);
    throw error;
  }
};

export const useCouponCodes = (couponId: string, refreshKey: number) => {
  return useQuery<CouponCodesResponse, Error>({
    queryKey: ['coupon', 'codes', couponId, refreshKey],
    queryFn: () => fetchCouponCodes(couponId),
    enabled: !!couponId,
    staleTime: 30000,
  });
};

// Fetch coupon code by ID
const fetchCouponCodeById = async (id: string): Promise<any> => {
  try {
    const response = await handleAPI(endpoints.coupon_codes.detail(id), 'GET');
    return response;
  } catch (error) {
    logError('Error fetching coupon code by ID:', error);
    throw error;
  }
};

export const useCouponCodeById = (id: string, refreshKey: number) => {
  return useQuery<any, Error>({
    queryKey: ['coupon_code', 'detail', id, refreshKey],
    queryFn: () => fetchCouponCodeById(id),
    enabled: !!id,
    staleTime: 30000,
  });
};

// Fetch coupon code by code string
const fetchCouponCodeByCode = async (code: string): Promise<any> => {
  try {
    const response = await handleAPI(
      endpoints.coupon_codes.byCode(code),
      'GET'
    );
    return response;
  } catch (error) {
    logError('Error fetching coupon code by code:', error);
    throw error;
  }
};

export const useCouponCodeByCode = (code: string, refreshKey: number) => {
  return useQuery<any, Error>({
    queryKey: ['coupon_code', 'by_code', code, refreshKey],
    queryFn: () => fetchCouponCodeByCode(code),
    enabled: !!code,
    staleTime: 30000,
  });
};

// Create coupon code
const createCouponCode = async (
  couponId: string,
  createDto: CreateCouponCodeDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupons.codes(couponId),
    'POST',
    createDto
  );
  return response;
};

export const useCreateCouponCode = (couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, CreateCouponCodeDTO>({
    mutationFn: async (createDto: CreateCouponCodeDTO) => {
      return createCouponCode(couponId, createDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code created successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Generate coupon codes
const generateCouponCodes = async (
  couponId: string,
  data: any
): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupons.generateCodes(couponId),
    'POST',
    data
  );
  return response;
};

export const useGenerateCouponCodes = (couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, any>({
    mutationFn: async (data: any) => {
      return generateCouponCodes(couponId, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon codes generated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Update coupon code
const updateCouponCode = async (
  codeId: string,
  updateDto: UpdateCouponCodeDTO
): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupon_codes.detail(codeId),
    'PUT',
    updateDto
  );
  return response;
};

export const useUpdateCouponCode = (codeId: string, couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, UpdateCouponCodeDTO>({
    mutationFn: async (updateDto: UpdateCouponCodeDTO) => {
      return updateCouponCode(codeId, updateDto);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code updated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
        queryClient.invalidateQueries({
          queryKey: ['coupon_code', 'detail', codeId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Delete coupon code
const deleteCouponCode = async (codeId: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupon_codes.detail(codeId),
    'DELETE'
  );
  return response;
};

export const useDeleteCouponCode = (couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (codeId: string) => {
      return deleteCouponCode(codeId);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code deleted successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Validate coupon code
const validateCouponCode = async (
  validateDto: ValidateCouponCodeDTO
): Promise<CouponValidationApiResponse> => {
  try {
    const response = await handleAPI<CouponValidationApiResponse>(
      endpoints.coupon_codes.validate,
      'POST',
      validateDto
    );
    return response.data;
  } catch (error) {
    logError('Error validating coupon code:', error);
    throw error;
  }
};

export const useValidateCouponCode = () => {
  const { handleError } = useErrorHandler();

  return useMutation<CouponValidationApiResponse, Error, ValidateCouponCodeDTO>(
    {
      mutationFn: async (validateDto: ValidateCouponCodeDTO) => {
        return validateCouponCode(validateDto);
      },
      onError: (error: any) => {
        handleError(error);
      },
    }
  );
};

// Check if code can be redeemed
const checkCodeCanRedeem = async (code: string): Promise<any> => {
  try {
    const response = await handleAPI(
      endpoints.coupon_codes.canRedeem(code),
      'GET'
    );
    return response;
  } catch (error) {
    logError('Error checking code redeemability:', error);
    throw error;
  }
};

export const useCodeCanRedeem = (code: string) => {
  return useQuery<any, Error>({
    queryKey: ['coupon_code', 'can-redeem', code],
    queryFn: () => checkCodeCanRedeem(code),
    enabled: !!code,
    staleTime: 0, // Always fresh check
  });
};

// Redeem coupon code
const redeemCouponCode = async (code: string, data: any): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupon_codes.redeem(code),
    'POST',
    data
  );
  return response;
};

export const useRedeemCouponCode = () => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, { code: string; data: any }>({
    mutationFn: async ({ code, data }) => {
      return redeemCouponCode(code, data);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code redeemed successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['coupon', 'codes'] });
        queryClient.invalidateQueries({ queryKey: ['coupon_code'] });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Activate coupon code
const activateCouponCode = async (id: string): Promise<any> => {
  const response = await handleAPI(endpoints.coupon_codes.activate(id), 'POST');
  return response;
};

export const useActivateCouponCode = (couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return activateCouponCode(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code activated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};

// Deactivate coupon code
const deactivateCouponCode = async (id: string): Promise<any> => {
  const response = await handleAPI(
    endpoints.coupon_codes.deactivate(id),
    'POST'
  );
  return response;
};

export const useDeactivateCouponCode = (couponId: string) => {
  const queryClient = useQueryClient();
  const { handleError, handleSuccess } = useErrorHandler();

  return useMutation<any, Error, string>({
    mutationFn: async (id: string) => {
      return deactivateCouponCode(id);
    },
    onSuccess: async (response: any) => {
      handleSuccess(response, 'Coupon code deactivated successfully');

      setTimeout(() => {
        queryClient.invalidateQueries({
          queryKey: ['coupon', 'codes', couponId],
        });
      }, 1000);
    },
    onError: (error: any) => {
      handleError(error);
    },
  });
};
