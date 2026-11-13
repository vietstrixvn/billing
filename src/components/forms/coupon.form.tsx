'use client';

import { Button, Input, Label, CurrencyInput } from '@/components/ui';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  CreateCouponDTO,
  CreateCouponSchema,
  UpdateCouponDTO,
  UpdateCouponSchema,
} from '@/types';
import { useCreateCoupon, useUpdateCoupon } from '@/hooks/billing';
import type { Coupon } from '@/types';
import { datetimeLocalToISO } from '@/utils/dateHelpers';

interface CouponFormProps {
  coupon?: Coupon;
  onSuccess?: () => void;
}

export const CreateCouponForm: React.FC<CouponFormProps> = ({
  coupon,
  onSuccess,
}) => {
  const isEditing = !!coupon;
  const createMutation = useCreateCoupon();
  const updateMutation = useUpdateCoupon(coupon?.id || '');

  const [discountValue, setDiscountValue] = useState<number>(
    coupon?.discount_value || 0
  );
  const [minAmount, setMinAmount] = useState<number>(coupon?.min_amount || 0);

  const form = useForm<CreateCouponDTO | UpdateCouponDTO>({
    resolver: zodResolver(isEditing ? UpdateCouponSchema : CreateCouponSchema),
    defaultValues: coupon
      ? {
          name: coupon.name,
          discount_type: coupon.discount_type,
          currency: coupon.currency || 'VND',
          duration: coupon.duration,
          duration_months: coupon.duration_months,
          max_redemptions: coupon.max_redemptions,
          applies_to: coupon.applies_to,
          is_active: coupon.is_active,
          valid_from: coupon.valid_from
            ? new Date(coupon.valid_from).toISOString().slice(0, 16)
            : '',
          valid_until: coupon.valid_until
            ? new Date(coupon.valid_until).toISOString().slice(0, 16)
            : '',
        }
      : {
          name: '',
          discount_type: 'percentage',
          currency: 'VND',
          duration: 'once',
          applies_to: 'all',
          is_active: true,
          valid_from: new Date().toISOString().slice(0, 16),
        },
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors },
  } = form;

  const discountType = watch('discount_type');
  const duration = watch('duration');

  const onSubmit = async (data: CreateCouponDTO | UpdateCouponDTO) => {
    try {
      console.log('🔍 Form data received:', data);

      // Convert datetime-local to backend format with UTC timezone
      const validFrom = data.valid_from
        ? datetimeLocalToISO(data.valid_from, false)
        : new Date().toISOString();

      const validUntil = data.valid_until
        ? datetimeLocalToISO(data.valid_until, true)
        : undefined;

      // Build submit data
      const submitData: any = {
        name: data.name,
        discount_type: data.discount_type,
        discount_value: discountValue,
        duration: data.duration,
        applies_to: data.applies_to,
        is_active: data.is_active,
        valid_from: validFrom,
        valid_until: validUntil,
      };

      // Only add currency for fixed_amount type
      if (data.discount_type === 'fixed_amount') {
        submitData.currency = data.currency || 'VND';
      }

      // Optional fields
      if (data.duration_months) {
        submitData.duration_months = data.duration_months;
      }
      if (data.max_redemptions) {
        submitData.max_redemptions = data.max_redemptions;
      }
      if (minAmount > 0) {
        submitData.min_amount = minAmount;
      }

      console.log('📤 Sending to API:', {
        discount_type: data.discount_type,
        has_currency: !!submitData.currency,
        valid_from_converted: validFrom,
        valid_until_converted: validUntil,
        full_payload: submitData,
      });

      if (isEditing) {
        await updateMutation.mutateAsync(submitData as UpdateCouponDTO);
      } else {
        await createMutation.mutateAsync(submitData as CreateCouponDTO);
      }

      if (!isEditing) {
        reset();
        setDiscountValue(0);
        setMinAmount(0);
      }
      onSuccess?.();
    } catch (error: any) {
      console.error('❌ Submit error:', error);
      console.error('Error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      toast.error(error.message || 'Lỗi khi lưu coupon');
    }
  };

  return (
    <div className="w-full mx-auto bg-white p-6 border">
      <h3 className="text-lg font-semibold mb-4">
        {isEditing ? 'Edit Coupon' : 'Create New Coupon'}
      </h3>
      <form onSubmit={handleFormSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Coupon Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="E.g.: Summer Promotion 2026"
              {...register('name')}
              className="rounded-md border-gray-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
          </div>

          {/* Discount Type */}
          <div className="grid gap-2">
            <Label htmlFor="discount_type">
              Discount Type <span className="text-red-500">*</span>
            </Label>
            <select
              id="discount_type"
              {...register('discount_type')}
              className="rounded-md border-gray-300 px-3 py-2 border"
            >
              <option value="percentage">Percentage (%)</option>
              <option value="fixed_amount">Fixed Amount</option>
              <option value="free_trial">Free Trial</option>
            </select>
            {errors.discount_type && (
              <p className="text-red-500 text-sm">
                {errors.discount_type.message}
              </p>
            )}
          </div>

          {/* Discount Value */}
          <div className="grid gap-2">
            <Label htmlFor="discount_value">
              Discount Value <span className="text-red-500">*</span>
            </Label>
            {discountType === 'percentage' ? (
              <Input
                id="discount_value"
                type="number"
                step="0.01"
                min="0"
                max="100"
                placeholder="E.g.: 10"
                value={discountValue}
                onChange={(e) =>
                  setDiscountValue(parseFloat(e.target.value) || 0)
                }
                className="rounded-md border-gray-300"
              />
            ) : (
              <CurrencyInput
                value={discountValue}
                onChange={setDiscountValue}
                placeholder="0"
                locale="vi-VN"
                currency="VND"
                showSymbol={true}
                className="rounded-md"
              />
            )}
            <p className="text-gray-500 text-sm">
              {discountType === 'percentage'
                ? 'Enter percentage (E.g.: 10 for 10%)'
                : 'Enter the discount amount'}
            </p>
          </div>

          {/* Currency (only for fixed_amount) */}
          {discountType === 'fixed_amount' && (
            <div className="grid gap-2">
              <Label htmlFor="currency">Currency</Label>
              <Input
                id="currency"
                placeholder="VND"
                {...register('currency')}
                className="rounded-md border-gray-300"
                disabled
              />
            </div>
          )}

          {/* Duration */}
          <div className="grid gap-2">
            <Label htmlFor="duration">
              Duration <span className="text-red-500">*</span>
            </Label>
            <select
              id="duration"
              {...register('duration')}
              className="rounded-md border-gray-300 px-3 py-2 border"
            >
              <option value="once">Once</option>
              <option value="repeating">Repeating</option>
              <option value="forever">Forever</option>
            </select>
          </div>

          {/* Duration Months (only for repeating) */}
          {duration === 'repeating' && (
            <div className="grid gap-2">
              <Label htmlFor="duration_months">Number of Months</Label>
              <Input
                id="duration_months"
                type="number"
                min="1"
                placeholder="E.g.: 3"
                {...register('duration_months', { valueAsNumber: true })}
                className="rounded-md border-gray-300"
              />
              <p className="text-gray-500 text-sm">
                Number of months the discount applies
              </p>
            </div>
          )}

          {/* Max Redemptions */}
          <div className="grid gap-2">
            <Label htmlFor="max_redemptions">Max Redemptions</Label>
            <Input
              id="max_redemptions"
              type="number"
              min="1"
              placeholder="Leave blank = unlimited"
              {...register('max_redemptions', { valueAsNumber: true })}
              className="rounded-md border-gray-300"
            />
          </div>

          {/* Applies To */}
          <div className="grid gap-2">
            <Label htmlFor="applies_to">
              Applies To <span className="text-red-500">*</span>
            </Label>
            <select
              id="applies_to"
              {...register('applies_to')}
              className="rounded-md border-gray-300 px-3 py-2 border"
            >
              <option value="all">All Plans</option>
              <option value="specific_categories">Specific Categories</option>
            </select>
          </div>

          {/* Min Amount */}
          <div className="grid gap-2">
            <Label htmlFor="min_amount">Minimum Amount</Label>
            <CurrencyInput
              value={minAmount}
              onChange={setMinAmount}
              placeholder="0"
              locale="vi-VN"
              currency="VND"
              showSymbol={true}
              className="rounded-md"
            />
            <p className="text-gray-500 text-sm">
              Minimum subscription amount required to apply the coupon
            </p>
          </div>

          {/* Valid From */}
          <div className="grid gap-2">
            <Label htmlFor="valid_from">
              Valid From <span className="text-red-500">*</span>
            </Label>
            <Input
              id="valid_from"
              type="datetime-local"
              {...register('valid_from')}
              className="rounded-md border-gray-300"
            />
            {errors.valid_from && (
              <p className="text-red-500 text-sm">
                {errors.valid_from.message}
              </p>
            )}
          </div>

          {/* Valid Until */}
          <div className="grid gap-2">
            <Label htmlFor="valid_until">Valid Until</Label>
            <Input
              id="valid_until"
              type="datetime-local"
              {...register('valid_until')}
              className="rounded-md border-gray-300"
            />
            <p className="text-gray-500 text-sm">
              Leave blank if there is no expiration date
            </p>
          </div>

          {/* Is Active */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              {...register('is_active')}
              className="rounded border-gray-300"
            />
            <Label htmlFor="is_active" className="cursor-pointer">
              Active
            </Label>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={createMutation.isPending || updateMutation.isPending}
            className="bg-main text-white rounded-md hover:bg-main-700"
          >
            {createMutation.isPending || updateMutation.isPending
              ? 'Saving...'
              : isEditing
                ? 'Update Coupon'
                : 'Create Coupon'}
          </Button>
        </div>
      </form>
    </div>
  );
};
