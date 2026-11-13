'use client';

import {
  Button,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Input,
  Label,
} from '@/components/ui';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pencil } from 'lucide-react';
import type { UpdateServiceCategoryRequest } from '@/types';
import {
  useUpdateServiceCategory,
  useServiceCategoryDetail,
} from '@/hooks/billing';
import { logError } from '@/utils';

interface EditServiceCategoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryId: string;
  onSuccess?: () => void;
}

// Util: generate slug from string
const generateSlug = (text: string): string =>
  text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');

export const EditServiceCategoryDialog: React.FC<
  EditServiceCategoryDialogProps
> = ({ open, onOpenChange, categoryId, onSuccess }) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');

  const { data: category, isLoading } = useServiceCategoryDetail(
    categoryId,
    open ? 1 : 0
  );
  const updateMutation = useUpdateServiceCategory(categoryId);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UpdateServiceCategoryRequest>({
    defaultValues: {
      name: '',
      code: '',
      sort_order: 0,
      is_active: true,
    },
  });

  const titleValue = watch('name');

  // Load category data when dialog opens
  useEffect(() => {
    if (category && open) {
      reset({
        name: category.name,
        code: category.code,
        sort_order: category.sort_order,
        is_active: category.is_active,
      });
      setCustomSlug(category.code);
    }
  }, [category, open, reset]);

  // Auto-generate slug from title (only when not manually editing)
  useEffect(() => {
    if (!isEditingSlug && titleValue && open) {
      const generated = generateSlug(titleValue);
      setCustomSlug(generated);
      setValue('code', generated);
    }
  }, [titleValue, isEditingSlug, setValue, open]);

  const onSubmit = async (data: UpdateServiceCategoryRequest) => {
    try {
      await updateMutation.mutateAsync({
        ...data,
        code: customSlug,
      });
      onSuccess?.();
      handleClose();
    } catch (error: any) {
      logError(error.message || 'Error updating category');
    }
  };

  const handleClose = () => {
    reset();
    setCustomSlug('');
    setIsEditingSlug(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px] bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle>Edit Service Category</DialogTitle>
          <DialogDescription>
            Update the service category information
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-gray-500">
            Loading category data...
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="grid gap-4 py-4">
              {/* Name */}
              <div className="grid gap-2">
                <Label htmlFor="name">
                  Name <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="Enter category name"
                  {...register('name', { required: 'Name is required' })}
                  className="rounded-md border-gray-300"
                />
                {errors.name && (
                  <p className="text-red-500 text-sm">{errors.name.message}</p>
                )}
                <p className="text-gray-500 text-sm">
                  The name is how it appears on your site.
                </p>
              </div>

              {/* Code/Slug */}
              <div className="grid gap-2">
                <Label htmlFor="code">Code</Label>
                <div className="flex items-center gap-2">
                  {!isEditingSlug ? (
                    <>
                      <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-mono text-sm truncate">
                        {customSlug || 'auto-generated-code'}
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setIsEditingSlug(true)}
                        className="shrink-0"
                        title="Edit code"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="code"
                        placeholder="custom-code"
                        value={customSlug}
                        onChange={(e) => {
                          const slugified = generateSlug(
                            e.target.value.replace(/-/g, ' ')
                          );
                          setCustomSlug(slugified);
                          setValue('code', slugified);
                        }}
                        className="flex-1 rounded-md border-gray-300 font-mono text-sm"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingSlug(false);
                          const reset = generateSlug(titleValue || '');
                          setCustomSlug(reset);
                          setValue('code', reset);
                        }}
                        className="shrink-0"
                      >
                        Cancel
                      </Button>
                    </>
                  )}
                </div>
                <p className="text-gray-500 text-sm">
                  URL-friendly version of the name. Auto-generated but editable.
                </p>
              </div>

              {/* Sort Order */}
              <div className="grid gap-2">
                <Label htmlFor="sort_order">Sort Order</Label>
                <Input
                  id="sort_order"
                  type="number"
                  placeholder="0"
                  {...register('sort_order', { valueAsNumber: true })}
                  className="rounded-md border-gray-300"
                />
                <p className="text-gray-500 text-sm">
                  Lower numbers appear first in lists.
                </p>
              </div>

              {/* Active Status */}
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

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={updateMutation.isPending}
                className="border-main text-main rounded-md bg-white"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-main text-white rounded-md hover:bg-main-700"
              >
                {updateMutation.isPending ? 'Updating...' : 'Update Category'}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
};
