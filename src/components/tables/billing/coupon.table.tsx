'use client';

import type React from 'react';
import { useCallback, useState } from 'react';
import {
  Button,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui';
import { Icons } from '@/assets/icons';
import type { Coupon } from '@/types';
import { useDeleteCoupon } from '@/hooks/billing';
import { ErrorCustom } from '@/components/loading/error_custom';
import { NotiPostNull } from '@/components/loading/null_custom';
import { QuestionDialog } from '@/components/panels/question.panel';
import { usePermissionContext } from '@/contexts/PermissionContext';
import { EditCouponDialog } from '@/components/dialogs/billing/edit-coupon.dialog';
import { CouponCodesDialog } from '@/components/dialogs/billing/coupon-codes.dialog';

const CouponColumns = [
  { key: 'index', label: '#', className: 'text-xs text-gray-800 w-8' },
  { key: 'name', label: 'Name', className: 'text-xs text-gray-800' },
  {
    key: 'discount',
    label: 'Discount',
    className: 'text-xs text-gray-800 w-32',
  },
  {
    key: 'duration',
    label: 'Duration',
    className: 'text-xs text-gray-800 w-24',
  },
  {
    key: 'redemptions',
    label: 'Redemptions',
    className: 'text-xs text-gray-800 w-32',
  },
  { key: 'validity', label: 'Validity', className: 'text-xs text-gray-800' },
  {
    key: 'is_active',
    label: 'Status',
    className: 'text-xs text-gray-800 w-24',
  },
  { key: 'action', label: 'Actions', className: 'text-xs text-gray-800 w-40' },
];

interface CouponTableProps {
  coupons: Coupon[];
  isLoading: boolean;
  isError: boolean;
  refreshKey: number;
}

export const CouponTable: React.FC<CouponTableProps> = ({
  coupons,
  isLoading,
  isError,
  refreshKey,
}) => {
  const { mutate: deleteCoupon } = useDeleteCoupon();
  const { can } = usePermissionContext();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [couponToDelete, setCouponToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [couponToEdit, setCouponToEdit] = useState<string | null>(null);
  const [codesDialogOpen, setCodesDialogOpen] = useState(false);
  const [couponForCodes, setCouponForCodes] = useState<string | null>(null);

  const handleEditClick = (couponId: string) => {
    setCouponToEdit(couponId);
    setEditDialogOpen(true);
  };

  const handleDeleteClick = (couponId: string) => {
    setCouponToDelete(couponId);
    setDeleteDialogOpen(true);
  };

  const handleCodesClick = (couponId: string) => {
    setCouponForCodes(couponId);
    setCodesDialogOpen(true);
  };

  const handleDeleteConfirm = useCallback(() => {
    if (!couponToDelete) return;

    setDeleteDialogOpen(false);
    deleteCoupon(couponToDelete);
    setCouponToDelete(null);
  }, [couponToDelete, deleteCoupon]);

  const formatDiscount = (coupon: Coupon) => {
    if (coupon.discount_type === 'percentage') {
      return `${coupon.discount_value}%`;
    } else if (coupon.discount_type === 'fixed_amount') {
      return `${coupon.discount_value.toLocaleString()} ${coupon.currency || 'VND'}`;
    } else {
      return 'Free Trial';
    }
  };

  const formatDuration = (coupon: Coupon) => {
    if (coupon.duration === 'once') return 'Once';
    if (coupon.duration === 'forever') return 'Forever';
    return `${coupon.duration_months || 0} months`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <>
      <div className="border border-gray-300">
        <Table className="rounded-md border-gray-300">
          <TableHeader className="bg-table-header text-gray-700 font-bold rounded-md">
            <TableRow>
              {CouponColumns.map((col) => (
                <TableHead key={col.key} className={col.className}>
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>

          <TableBody className="bg-row rounded-md">
            {isError ? (
              <TableRow>
                <TableCell
                  colSpan={CouponColumns.length}
                  className="text-center border-gray-300"
                >
                  <ErrorCustom />
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  {CouponColumns.map((col) => (
                    <TableCell key={col.key} className={col.className}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : coupons && coupons.length > 0 ? (
              coupons.map((coupon, index) => {
                const isPending = (coupon as any).isPending;
                const isUpdating = (coupon as any).isUpdating;

                return (
                  <TableRow
                    key={coupon.id}
                    className={`border-gray-300 transition-all duration-500 ${
                      isPending
                        ? 'opacity-60 bg-blue-50 pointer-events-none'
                        : isUpdating
                          ? 'opacity-70 bg-yellow-50 pointer-events-none'
                          : 'opacity-100'
                    }`}
                  >
                    {CouponColumns.map((col) => {
                      let cellContent: React.ReactNode = '';

                      if (col.key === 'index') {
                        cellContent = index + 1;
                      } else if (col.key === 'name') {
                        cellContent = (
                          <div className="flex flex-col">
                            <span className="font-bold text-primary-600">
                              {coupon.name}
                            </span>
                            {isPending && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-blue-500 font-medium animate-pulse">
                                <Icons.Plus className="w-3 h-3" />
                                Creating...
                              </span>
                            )}
                            {isUpdating && (
                              <span className="mt-1 inline-flex items-center gap-1 text-xs text-yellow-600 font-medium animate-pulse">
                                <Icons.PencilIcon className="w-3 h-3" />
                                Updating...
                              </span>
                            )}
                          </div>
                        );
                      } else if (col.key === 'discount') {
                        cellContent = (
                          <span className="font-semibold text-green-600">
                            {formatDiscount(coupon)}
                          </span>
                        );
                      } else if (col.key === 'duration') {
                        cellContent = (
                          <span className="text-sm">
                            {formatDuration(coupon)}
                          </span>
                        );
                      } else if (col.key === 'redemptions') {
                        cellContent = (
                          <div className="text-sm">
                            <span className="font-semibold">
                              {coupon.redemption_count}
                            </span>
                            {coupon.max_redemptions && (
                              <span className="text-gray-500">
                                {' '}
                                / {coupon.max_redemptions}
                              </span>
                            )}
                            {!coupon.max_redemptions && (
                              <span className="text-gray-500"> / ∞</span>
                            )}
                          </div>
                        );
                      } else if (col.key === 'validity') {
                        cellContent = (
                          <div className="text-xs">
                            <div>From: {formatDate(coupon.valid_from)}</div>
                            {coupon.valid_until && (
                              <div>To: {formatDate(coupon.valid_until)}</div>
                            )}
                          </div>
                        );
                      } else if (col.key === 'is_active') {
                        cellContent = coupon.is_active ? (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        ) : (
                          <span className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700">
                            Inactive
                          </span>
                        );
                      } else if (col.key === 'action') {
                        cellContent = (
                          <div className="flex items-center justify-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-blue-600"
                              onClick={() => handleCodesClick(coupon.id)}
                              disabled={isPending || isUpdating}
                              title="Manage Codes"
                            >
                              <Icons.Code className="w-4 h-4" />
                            </Button>
                            {can('billing', 'update') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-green-600"
                                onClick={() => handleEditClick(coupon.id)}
                                disabled={isPending || isUpdating}
                              >
                                <Icons.PencilIcon className="w-4 h-4" />
                              </Button>
                            )}
                            {can('billing', 'delete') && (
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleDeleteClick(coupon.id)}
                                disabled={isPending || isUpdating}
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        );
                      }

                      return (
                        <TableCell key={col.key} className={col.className}>
                          {cellContent}
                        </TableCell>
                      );
                    })}
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={CouponColumns.length}>
                  <NotiPostNull message="No coupons found." />
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Coupon?"
        description="Are you sure you want to delete this coupon? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />

      {couponToEdit && (
        <EditCouponDialog
          open={editDialogOpen}
          onOpenChange={setEditDialogOpen}
          couponId={couponToEdit}
          refreshKey={refreshKey}
          onSuccess={() => {
            setCouponToEdit(null);
          }}
        />
      )}

      {couponForCodes && (
        <CouponCodesDialog
          open={codesDialogOpen}
          onOpenChange={setCodesDialogOpen}
          couponId={couponForCodes}
          refreshKey={refreshKey}
          onClose={() => {
            setCouponForCodes(null);
          }}
        />
      )}
    </>
  );
};
