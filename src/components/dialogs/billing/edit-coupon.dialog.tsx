'use client';

import {
  Dialog,
  DialogContent
} from '@/components/ui';
import React from 'react';
import { CreateCouponForm } from '@/components/forms/coupon.form';
import { useCouponDetail } from '@/hooks/billing';

interface EditCouponDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId: string;
  refreshKey: number;
  onSuccess?: () => void;
}

export const EditCouponDialog: React.FC<EditCouponDialogProps> = ({
  open,
  onOpenChange,
  couponId,
  refreshKey,
  onSuccess,
}) => {
  const { data, isLoading } = useCouponDetail(couponId, refreshKey);

  const handleClose = () => {
    onOpenChange(false);
  };

  const handleSuccess = () => {
    onSuccess?.();
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto bg-white border-gray-300">
        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading coupon data...
          </div>
        ) : data?.data ? (
          <CreateCouponForm coupon={data.data} onSuccess={handleSuccess} />
        ) : (
          <div className="py-8 text-center text-red-500">
            Failed to load coupon data
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
