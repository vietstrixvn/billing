'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Skeleton,
} from '@/components/ui';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Icons } from '@/assets/icons';
import {
  UpdateCouponCodeDTO,
} from '@/types';
import {
  useCreateCouponCode,
  useUpdateCouponCode,
  useDeleteCouponCode,
  useGenerateCouponCodes,
} from '@/hooks/billing';
import { CouponCodeList } from '@/libs/responses';
import { QuestionDialog } from '@/components/panels/question.panel';
import { toast } from 'sonner';

interface CouponCodesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  couponId: string;
  refreshKey: number;
  onClose?: () => void;
}

export const CouponCodesDialog: React.FC<CouponCodesDialogProps> = ({
  open,
  onOpenChange,
  couponId,
  refreshKey: parentRefreshKey,
  onClose,
}) => {
  const [refreshKey, setRefreshKey] = useState(parentRefreshKey);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [codeToDelete, setCodeToDelete] = useState<string | null>(null);
  const [editingCodeId, setEditingCodeId] = useState<string | null>(null);
  const [showBulkGenerate, setShowBulkGenerate] = useState(false);

  const { codes, isLoading } = CouponCodeList(couponId, refreshKey);
  const createMutation = useCreateCouponCode(couponId);
  const updateMutation = useUpdateCouponCode(editingCodeId || '', couponId);
  const deleteMutation = useDeleteCouponCode(couponId);
  const generateMutation = useGenerateCouponCodes(couponId);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      code: '',
      max_redemptions: undefined as number | undefined,
      is_active: true,
    },
  });

  const {
    register: registerBulk,
    handleSubmit: handleSubmitBulk,
    reset: resetBulk,
  } = useForm({
    defaultValues: {
      prefix: '',
      count: 10,
      length: 8,
      max_redemptions: undefined as number | undefined,
    },
  });

  const handleClose = () => {
    reset();
    resetBulk();
    setEditingCodeId(null);
    setShowBulkGenerate(false);
    onClose?.();
    onOpenChange(false);
  };

  const onSubmit = async (data: any) => {
    try {
      await createMutation.mutateAsync(data);
      reset();
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Error creating coupon code');
    }
  };

  const onSubmitBulk = async (data: any) => {
    try {
      await generateMutation.mutateAsync(data);
      resetBulk();
      setShowBulkGenerate(false);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Error generating coupon codes');
    }
  };

  const handleToggleActive = async (codeId: string, isActive: boolean) => {
    try {
      setEditingCodeId(codeId);
      const updateData: UpdateCouponCodeDTO = {
        is_active: !isActive,
      };
      await updateMutation.mutateAsync(updateData);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Error updating coupon code');
    } finally {
      setEditingCodeId(null);
    }
  };

  const handleDeleteClick = (codeId: string) => {
    setCodeToDelete(codeId);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!codeToDelete) return;

    try {
      await deleteMutation.mutateAsync(codeToDelete);
      setRefreshKey((prev) => prev + 1);
    } catch (error: any) {
      toast.error(error.message || 'Error deleting coupon code');
    } finally {
      setDeleteDialogOpen(false);
      setCodeToDelete(null);
    }
  };

  return (
    <>
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto bg-white border-gray-300">
          <DialogHeader>
            <DialogTitle>Manage Coupon Codes</DialogTitle>
            <DialogDescription>
              Create and manage redeemable codes for this coupon
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Tab Buttons */}
            <div className="flex gap-2 border-b border-gray-200">
              <button
                onClick={() => setShowBulkGenerate(false)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${!showBulkGenerate
                    ? 'border-main text-main'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Tạo Mã Đơn
              </button>
              <button
                onClick={() => setShowBulkGenerate(true)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${showBulkGenerate
                    ? 'border-main text-main'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                  }`}
              >
                Tạo Hàng Loạt
              </button>
            </div>

            {/* Create Single Code Form */}
            {!showBulkGenerate && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-3">Create New Code</h4>
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="code">
                        Code <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="code"
                        placeholder="E.g.: SUMMER2026"
                        {...register('code')}
                        className="rounded-md border-gray-300 uppercase"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                        }}
                      />
                      {errors.code && (
                        <p className="text-red-500 text-sm">
                          {errors.code.message}
                        </p>
                      )}
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="max_redemptions">Max Redemptions</Label>
                      <Input
                        id="max_redemptions"
                        type="number"
                        min="1"
                        placeholder="Leave blank = unlimited"
                        {...register('max_redemptions', {
                          valueAsNumber: true,
                        })}
                        className="rounded-md border-gray-300"
                      />
                    </div>

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

                    <Button
                      type="submit"
                      disabled={createMutation.isPending}
                      className="bg-main text-white rounded-md hover:bg-main-700"
                    >
                      {createMutation.isPending ? 'Creating...' : 'Create Code'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Bulk Generate Form */}
            {showBulkGenerate && (
              <div className="border rounded-lg p-4 bg-gradient-to-br from-blue-50 to-purple-50">
                <h4 className="font-semibold mb-3 flex items-center gap-2">
                  <Icons.Plus className="w-5 h-5 text-purple-600" />
                  Bulk Generate Codes
                </h4>
                <form onSubmit={handleSubmitBulk(onSubmitBulk)}>
                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="prefix">Prefix (Optional)</Label>
                      <Input
                        id="prefix"
                        placeholder="E.g.: SALE"
                        {...registerBulk('prefix')}
                        className="rounded-md border-gray-300 uppercase"
                        onChange={(e) => {
                          e.target.value = e.target.value.toUpperCase();
                        }}
                      />
                      <p className="text-xs text-gray-500">
                        Codes will look like: SALE-XXXXXXXX
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                        <Label htmlFor="count">
                          Quantity <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="count"
                          type="number"
                          min="1"
                          max="1000"
                          placeholder="10"
                          {...registerBulk('count', { valueAsNumber: true })}
                          className="rounded-md border-gray-300"
                        />
                      </div>

                      <div className="grid gap-2">
                        <Label htmlFor="length">
                          Length <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="length"
                          type="number"
                          min="4"
                          max="20"
                          placeholder="8"
                          {...registerBulk('length', { valueAsNumber: true })}
                          className="rounded-md border-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid gap-2">
                      <Label htmlFor="bulk_max_redemptions">
                        Max Redemptions (Per Code)
                      </Label>
                      <Input
                        id="bulk_max_redemptions"
                        type="number"
                        min="1"
                        placeholder="Leave blank = unlimited"
                        {...registerBulk('max_redemptions', {
                          valueAsNumber: true,
                        })}
                        className="rounded-md border-gray-300"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={generateMutation.isPending}
                      className="bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-md hover:from-purple-700 hover:to-blue-700"
                    >
                      {generateMutation.isPending
                        ? 'Generating...'
                        : 'Bulk Generate'}
                    </Button>
                  </div>
                </form>
              </div>
            )}

            {/* Codes List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold">Code List ({codes.length})</h4>
                {codes.length > 0 && (
                  <span className="text-xs text-gray-500">
                    Total used:{' '}
                    {codes.reduce((sum, c) => sum + c.redemption_count, 0)}
                  </span>
                )}
              </div>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader className="bg-gray-100">
                    <TableRow>
                      <TableHead className="text-xs">Code</TableHead>
                      <TableHead className="text-xs">Used</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-xs">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      Array.from({ length: 3 }).map((_, index) => (
                        <TableRow key={index}>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                          <TableCell>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        </TableRow>
                      ))
                    ) : codes && codes.length > 0 ? (
                      codes.map((code) => (
                        <TableRow key={code.id}>
                          <TableCell>
                            <span className="font-mono font-semibold">
                              {code.code}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm">
                              {code.redemption_count}
                              {code.max_redemptions ? (
                                <span className="text-gray-500">
                                  {' '}
                                  / {code.max_redemptions}
                                </span>
                              ) : (
                                <span className="text-gray-500"> / ∞</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell>
                            {code.is_active ? (
                              <span className="px-2 py-1 text-xs rounded-md font-medium bg-green-100 text-green-700">
                                Active
                              </span>
                            ) : (
                              <span className="px-2 py-1 text-xs rounded-md font-medium bg-red-100 text-red-700">
                                Inactive
                              </span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                className={
                                  code.is_active
                                    ? 'text-orange-600'
                                    : 'text-green-600'
                                }
                                onClick={() =>
                                  handleToggleActive(code.id, code.is_active)
                                }
                                disabled={
                                  updateMutation.isPending &&
                                  editingCodeId === code.id
                                }
                              >
                                {code.is_active ? (
                                  <Icons.EyeOff className="w-4 h-4" />
                                ) : (
                                  <Icons.Eye className="w-4 h-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                className="text-red-600"
                                onClick={() => handleDeleteClick(code.id)}
                              >
                                <Icons.Trash className="w-4 h-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-8">
                          <p className="text-gray-500">
                            No codes yet. Create your first code above.
                          </p>
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Are you sure?"
        description="This action cannot be undone. This action will permanently delete the coupon."
        onConfirm={handleDeleteConfirm}
      />
    </>
  );
};
