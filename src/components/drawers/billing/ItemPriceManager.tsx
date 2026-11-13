'use client';

import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Button,
  Input,
  Label,
} from '@/components/ui';
import { CurrencyInput } from '@/components/ui/input';
import { Icons } from '@/assets/icons';
import {
  useCreateItemPrice,
  useUpdateItemPrice,
  useDeleteItemPrice,
} from '@/hooks/billing';
import type {
  CreateItemPriceRequest,
  ItemPrice,
} from '@/types/billing/analytics';
import { toast } from 'sonner';
import { QuestionDialog } from '@/components/panels/question.panel';
import { formatCurrency } from '@/utils';
import { DollarSign, Calendar, Tag, CheckCircle2, XCircle, Pencil, Trash2, Plus } from 'lucide-react';

const PriceSchema = z.object({
  name: z.string().max(100).optional(),
  unit_amount: z.number().min(0, 'Price must be 0 or positive'),
  currency: z.string().min(1, 'Currency is required').max(10),
  is_active: z.boolean(),
  valid_from: z.string().optional(),
  valid_until: z.string().optional(),
});

type PriceFormData = z.infer<typeof PriceSchema>;

interface ItemPriceManagerProps {
  itemId: string;
  prices: ItemPrice[];
  onUpdate: () => void;
  refreshKey?: number;
}

export const ItemPriceManager: React.FC<ItemPriceManagerProps> = ({
  itemId,
  prices,
  onUpdate,
}) => {
  const [editingPrice, setEditingPrice] = useState<ItemPrice | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [priceToDelete, setPriceToDelete] = useState<string | null>(null);

  const createMutation = useCreateItemPrice(itemId);
  const updateMutation = useUpdateItemPrice();
  const deleteMutation = useDeleteItemPrice(itemId);

  const {
    register,
    handleSubmit,
    reset,
    control,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PriceFormData>({
    resolver: zodResolver(PriceSchema),
    defaultValues: {
      name: '',
      unit_amount: 0,
      currency: 'VND',
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
    },
  });

  useEffect(() => {
    if (editingPrice) {
      setValue('name', editingPrice.name || '');
      setValue(
        'unit_amount',
        Number(editingPrice.unit_amount ?? editingPrice.price ?? 0)
      );
      setValue('currency', editingPrice.currency || 'VND');
      setValue('is_active', editingPrice.is_active ?? true);
      setValue(
        'valid_from',
        editingPrice.valid_from
          ? new Date(editingPrice.valid_from).toISOString().split('T')[0]
          : editingPrice.effective_from
            ? new Date(editingPrice.effective_from).toISOString().split('T')[0]
            : ''
      );
      setValue(
        'valid_until',
        editingPrice.valid_until
          ? new Date(editingPrice.valid_until).toISOString().split('T')[0]
          : editingPrice.effective_to
            ? new Date(editingPrice.effective_to).toISOString().split('T')[0]
            : ''
      );
    } else {
      reset({
        name: '',
        unit_amount: 0,
        currency: 'VND',
        is_active: true,
        valid_from: new Date().toISOString().split('T')[0],
        valid_until: '',
      });
    }
  }, [editingPrice, setValue, reset]);

  const onSubmit = async (data: PriceFormData) => {
    try {
      const payload: CreateItemPriceRequest = {
        name: data.name?.trim() || undefined,
        unit_amount: Number(data.unit_amount) || 0,
        currency: data.currency.trim().toUpperCase() || 'VND',
        is_active: data.is_active,
        valid_from: data.valid_from
          ? new Date(data.valid_from).toISOString()
          : new Date().toISOString(),
        valid_until: data.valid_until
          ? new Date(data.valid_until).toISOString()
          : undefined,
      };

      if (editingPrice) {
        await updateMutation.mutateAsync({
          priceId: editingPrice.id,
          updateDto: payload,
        });
        toast.success('Price updated successfully');
        setEditingPrice(null);
      } else {
        await createMutation.mutateAsync(payload);
        toast.success('Price added successfully');
      }

      reset();
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to save price');
    }
  };

  const handleCancelEdit = () => {
    setEditingPrice(null);
    reset({
      name: '',
      unit_amount: 0,
      currency: 'VND',
      is_active: true,
      valid_from: new Date().toISOString().split('T')[0],
      valid_until: '',
    });
  };

  const handleDeleteConfirm = async () => {
    if (!priceToDelete) return;
    try {
      await deleteMutation.mutateAsync(priceToDelete);
      toast.success('Price deleted successfully');
      setDeleteDialogOpen(false);
      setPriceToDelete(null);
      onUpdate();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete price');
    }
  };

  return (
    <div className="space-y-6">
      {/* Active / Configured Prices List */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-slate-500" />
            Configured Prices ({prices.length})
          </h4>
        </div>

        {prices.length === 0 ? (
          <div className="bg-slate-50 border border-dashed border-slate-300 p-6 text-center text-xs text-slate-500">
            No prices configured yet for this item. Add a price below.
          </div>
        ) : (
          <div className="space-y-2.5">
            {prices.map((p) => {
              const amount = p.unit_amount ?? p.price ?? 0;
              const isSelected = editingPrice?.id === p.id;

              return (
                <div
                  key={p.id}
                  className={`p-4 border transition-all ${
                    isSelected
                      ? 'border-main bg-blue-50/50'
                      : p.is_active
                        ? 'border-slate-200 bg-white hover:border-slate-300'
                        : 'border-slate-200 bg-slate-50 opacity-70'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-base text-slate-900">
                          {formatCurrency(amount, p.currency || 'VND')}
                        </span>
                        {p.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 text-[10px] font-medium">
                            <XCircle className="w-3 h-3" /> Inactive
                          </span>
                        )}
                        {isSelected && (
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-semibold px-2 py-0.5">
                            Editing
                          </span>
                        )}
                      </div>

                      {p.name && (
                        <p className="text-xs text-slate-600 font-medium">
                          {p.name}
                        </p>
                      )}

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-400" />
                          Valid: {new Date(p.valid_from || p.effective_from || '').toLocaleDateString()}
                          {(p.valid_until || p.effective_to) &&
                            ` – ${new Date(p.valid_until || p.effective_to || '').toLocaleDateString()}`}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => setEditingPrice(p)}
                        className="h-8 px-2 text-slate-600 hover:text-main hover:bg-slate-100"
                        title="Edit price"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setPriceToDelete(p.id);
                          setDeleteDialogOpen(true);
                        }}
                        className="h-8 px-2 text-slate-600 hover:text-red-600 hover:bg-red-50"
                        title="Delete price"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Form: Add or Edit Price */}
      <div className="border border-slate-200 bg-white">
        <div className="px-4 py-3 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            {editingPrice ? (
              <>
                <Pencil className="w-3.5 h-3.5 text-main" /> Edit Price
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5 text-main" /> Add Item Price
              </>
            )}
          </span>
          {editingPrice && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="text-xs text-slate-500 hover:text-slate-800 underline"
            >
              Cancel Edit
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Unit Price */}
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Unit Price <span className="text-red-500">*</span>
              </Label>
              <Controller
                name="unit_amount"
                control={control}
                render={({ field }) => (
                  <CurrencyInput
                    value={field.value}
                    onChange={(val) => field.onChange(val)}
                    placeholder="0"
                    className="w-full text-sm font-mono"
                  />
                )}
              />
              {errors.unit_amount && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.unit_amount.message}
                </p>
              )}
            </div>

            {/* Currency */}
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Currency <span className="text-red-500">*</span>
              </Label>
              <Input
                {...register('currency')}
                placeholder="VND"
                className="text-sm uppercase font-mono"
              />
              {errors.currency && (
                <p className="text-[11px] text-red-500 mt-1">
                  {errors.currency.message}
                </p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Price Name / Label */}
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Price Label (Optional)
              </Label>
              <Input
                {...register('name')}
                placeholder="e.g. Standard Rate"
                className="text-sm"
              />
            </div>

            {/* Valid From */}
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Valid From
              </Label>
              <Input
                type="date"
                {...register('valid_from')}
                className="text-sm"
              />
            </div>

            {/* Valid Until */}
            <div>
              <Label className="text-xs font-bold text-slate-600 uppercase tracking-wide block mb-1">
                Valid Until (Optional)
              </Label>
              <Input
                type="date"
                {...register('valid_until')}
                className="text-sm"
              />
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
            <input
              type="checkbox"
              id="is_active_price"
              {...register('is_active')}
              className="h-4 w-4 rounded border-slate-300 text-main focus:ring-main"
            />
            <Label
              htmlFor="is_active_price"
              className="text-xs font-medium text-slate-700 cursor-pointer"
            >
              Set as active price
            </Label>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            {editingPrice && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleCancelEdit}
                className="text-xs"
              >
                Cancel
              </Button>
            )}
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting}
              className="bg-main text-white text-xs px-4"
            >
              {isSubmitting
                ? 'Saving...'
                : editingPrice
                  ? 'Update Price'
                  : 'Add Price'}
            </Button>
          </div>
        </form>
      </div>

      <QuestionDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        question="Delete Item Price?"
        description="Are you sure you want to delete this price configuration? This action cannot be undone."
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};
