'use client';

import { Button, Input, Label, Textarea } from '@/components/ui';
import { CurrencyInput } from '@/components/ui/input';
import { SlideToggle } from '@/components/ui/toggle';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreatePlanDTO, Plan } from '@/types';
import { useCreatePlan, useUpdatePlan } from '@/hooks/billing';
import { generateSlug } from '@/utils/helpers/gen-slug.helper';

interface PlanFormProps {
  onSuccess?: () => void;
  initialData?: Plan;
  mode?: 'create' | 'edit';
}

export const PlanForm: React.FC<PlanFormProps> = ({
  onSuccess,
  initialData,
  mode = 'create',
}) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState(initialData?.code || '');

  const createMutation = useCreatePlan();
  const updateMutation = useUpdatePlan(initialData?.id || '');

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreatePlanDTO>({
    defaultValues: initialData
      ? {
          name: initialData.name,
          code: initialData.code,
          description: initialData.description || '',
          sort_order: initialData.sort_order || 0,
          is_active: initialData.is_active,
        }
      : {
          name: '',
          code: '',
          description: '',
          sort_order: 0,
          is_active: true,
        },
  });

  const nameValue = watch('name');

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditingSlug && nameValue) {
      const autoSlug = generateSlug(nameValue);
      setCustomSlug(autoSlug);
    }
  }, [nameValue, isEditingSlug]);

  const onSubmit = async (data: CreatePlanDTO) => {
    try {
      const submitData: CreatePlanDTO = {
        ...data,
        code: customSlug || generateSlug(data.name),
      };

      if (mode === 'edit') {
        await updateMutation.mutateAsync(submitData);
      } else {
        await createMutation.mutateAsync(submitData);
      }

      // Reset form only in create mode
      if (mode === 'create') {
        reset();
        setIsEditingSlug(false);
        setCustomSlug('');
      }
      onSuccess?.();
    } catch (error: any) {
      toast.error(
        error.message ||
          `Error ${mode === 'edit' ? 'updating' : 'creating'} plan`
      );
    }
  };

  return (
    <div className="w-full bg-white  border border-gray-300 p-6">
      <form onSubmit={handleFormSubmit(onSubmit)}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Row 1: Name, Sort Order */}
          <div className="grid gap-2">
            <Label htmlFor="name">
              Plan Name <span className="text-red-500">*</span>
            </Label>
            <Input
              id="name"
              placeholder="e.g., Basic Plan"
              {...register('name', { required: 'Plan name is required' })}
              className="rounded-md border-gray-300"
            />
            {errors.name && (
              <p className="text-red-500 text-sm">{errors.name.message}</p>
            )}
            <p className="text-gray-500 text-sm">
              The name of the subscription plan.
            </p>
          </div>

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

          {/* Row 2: Code - Full width */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="code">Code</Label>
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
                    id="code"
                    placeholder="custom-code"
                    value={customSlug}
                    onChange={(e) => {
                      const slugified = generateSlug(
                        e.target.value.replace(/-/g, ' ')
                      );
                      setCustomSlug(slugified);
                    }}
                    className="flex-1 rounded-md border-gray-300 font-mono text-sm"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsEditingSlug(false);
                      setCustomSlug(generateSlug(nameValue || ''));
                    }}
                    className="shrink-0"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
            <p className="text-gray-500 text-sm">
              Unique identifier for this plan.
            </p>
          </div>

          {/* Row 3: Description - Full width */}
          <div className="grid gap-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the plan features..."
              {...register('description')}
              className="rounded-md border-gray-300 resize-none"
              rows={3}
            />
            <p className="text-gray-500 text-sm">
              Optional description of the plan.
            </p>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2 md:col-span-2">
            <Controller
              name="is_active"
              control={control}
              render={({ field }) => (
                <SlideToggle
                  checked={field.value}
                  onChange={field.onChange}
                  label="Active"
                  variant="success"
                  size="md"
                />
              )}
            />
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200">
          <Button
            type="submit"
            disabled={
              mode === 'edit'
                ? updateMutation.isPending
                : createMutation.isPending
            }
            className="bg-main text-white rounded-md hover:bg-main-700"
          >
            {mode === 'edit'
              ? updateMutation.isPending
                ? 'Updating...'
                : 'Update Plan'
              : createMutation.isPending
                ? 'Creating...'
                : 'Create Plan'}
          </Button>
        </div>
      </form>
    </div>
  );
};
