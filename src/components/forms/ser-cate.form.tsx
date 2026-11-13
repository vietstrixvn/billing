'use client';

import { Button, Input, Label, Textarea } from '@/components/ui';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';

import { toast } from 'sonner';
import { useForm } from 'react-hook-form';

import { CreateServiceCategoryRequest } from '@/types';
import { useCreateServiceCategory } from '@/hooks/billing';
import { ParentCategorySelect } from '@/components/selects/ParentCategorySelect';
import { Icons } from '@/assets';

interface CreateCategoryFormProps {
  onSuccess?: () => void;
  refreshKey?: number;
}

export const CreateServiceCategoryForm: React.FC<CreateCategoryFormProps> = ({
  onSuccess,
  refreshKey = 0,
}) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  const createCategoryMutation = useCreateServiceCategory();

  const createCateForm = useForm<CreateServiceCategoryRequest>({
    defaultValues: {
      parent_id: null,
      name: '',
      code: '',
      description: '',
      sort_order: 0,
      is_active: true,
    },
  });

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    formState: { errors },
  } = createCateForm;
  const titleValue = watch('name');

  // Generate slug from title
  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  // Auto-generate slug from title if not editing manually
  useEffect(() => {
    if (!isEditingSlug && titleValue) {
      const autoSlug = generateSlug(titleValue);
      setCustomSlug(autoSlug);
    }
  }, [titleValue, isEditingSlug]);

  const onSubmit = async (data: CreateServiceCategoryRequest) => {
    try {
      // Build submit data
      const submitData: CreateServiceCategoryRequest = {
        parent_id: parentId,
        name: data.name,
        code: customSlug || generateSlug(data.name),
        description: data.description,
        sort_order: data.sort_order || 0,
        is_active: data.is_active !== false,
      };

      await createCategoryMutation.mutateAsync(submitData);

      // Reset form
      reset();
      setIsEditingSlug(false);
      setCustomSlug('');
      setParentId(null);
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error creating category');
    }
  };

  return (
    <div className="w-full mx-auto">
      <form onSubmit={handleFormSubmit(onSubmit)}>
        <div className="grid gap-4">
          {/* Parent Category Select */}
          <ParentCategorySelect
            value={parentId}
            onChange={setParentId}
            refreshKey={refreshKey}
          />

          {/* Name */}
          <div className="grid gap-2">
            <Label htmlFor="title">
              Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="title"
              placeholder="Enter category name"
              {...register('name', { required: 'Category name is required' })}
              className="rounded-md border-gray-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
            <p className="text-gray-500 text-sm">
              The name is how it appears on your site.
            </p>
          </div>

          {/* Slug */}
          <div className="grid gap-2">
            <Label htmlFor="slug">
              Code <span className="text-red-500">*</span>
            </Label>
            <div className="flex items-center gap-2">
              {!isEditingSlug ? (
                <>
                  <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-300 rounded-md text-gray-700 font-mono text-sm">
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
                    id="slug"
                    placeholder="custom-code"
                    value={customSlug}
                    onChange={(e) => {
                      const value = e.target.value;
                      const slugified = value
                        .toLowerCase()
                        .normalize('NFD')
                        .replace(/[\u0300-\u036f]/g, '')
                        .replace(/đ/g, 'd')
                        .replace(/Đ/g, 'd')
                        .replace(/[^a-z0-9\s-]/g, '')
                        .replace(/\s+/g, '-')
                        .replace(/-+/g, '-');
                      setCustomSlug(slugified);
                    }}
                    className="flex-1 rounded-md border-gray-300 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingSlug(false);
                      setCustomSlug(generateSlug(titleValue || ''));
                    }}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              The{' '}
              <code className="rounded bg-gray-100 px-1 py-0.5 text-xs font-medium">
                code
              </code>{' '}
              is the unique identifier for this category.
            </p>
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Enter category description (optional)"
              {...register('description')}
              className="rounded-md border-gray-300 min-h-[100px]"
            />
            <p className="text-gray-500 text-sm">
              A brief description of this category.
            </p>
          </div>

          {/* Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              min="0"
              placeholder="0"
              {...register('sort_order', { valueAsNumber: true })}
              className="rounded-md border-gray-300"
            />
            <p className="text-gray-500 text-sm">
              Lower numbers appear first in lists.
            </p>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={createCategoryMutation.isPending}
            className="bg-main text-white rounded-none hover:bg-main-700"
          >
            {createCategoryMutation.isPending
              ? <Icons.Loader2 className="h-4 w-4 animate-spin" />
              : <Icons.Plus className="h-4 w-4" />
            }
            {createCategoryMutation.isPending
              ? 'Creating...'
              : 'Create Category'}
          </Button>
        </div>
      </form>
    </div>
  );
};
