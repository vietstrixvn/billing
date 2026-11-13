'use client';

import { Button, Input, Label, Textarea } from '@/components/ui';
import { SlideToggle } from '@/components/ui/toggle';
import { Pencil } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { UpdateServiceItemRequest } from '@/types';
import {
  useUpdateServiceItem,
  useServiceItemDetail,
  useItemPrices,
} from '@/hooks/billing';
import { ServiceCategorySelect } from '@/components/selects/ser-cate.select';
import { generateSlug } from '@/utils/helpers/gen-slug.helper';
import { ItemPriceManager } from '@/components/drawers/billing/ItemPriceManager';
import { Loader } from '../loading/loader';

interface EditServiceItemFormProps {
  itemId: string;
  onSuccess?: () => void;
}

export const EditServiceItemForm: React.FC<EditServiceItemFormProps> = ({
  itemId,
  onSuccess,
}) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [isDataLoaded, setIsDataLoaded] = useState(false);
  const [priceRefreshKey, setPriceRefreshKey] = useState(0);

  const { data: item, isLoading } = useServiceItemDetail(itemId, 1);
  const { data: prices = [] } = useItemPrices(itemId, priceRefreshKey);
  const updateMutation = useUpdateServiceItem(itemId);

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<UpdateServiceItemRequest>({
    defaultValues: {
      category_id: '',
      name: '',
      code: '',
      description: '',
      unit: '',
      is_metered: false,
      is_active: true,
    },
  });

  const nameValue = watch('name');

  // Load item data when available
  useEffect(() => {
    if (item && !isDataLoaded) {
      reset({
        category_id: item.category_id,
        name: item.name,
        code: item.code,
        description: item.description || '',
        unit: item.unit || '',
        is_metered: item.is_metered,
        is_active: item.is_active,
      });
      setCustomSlug(item.code);
      setSelectedCategory(item.category_id);
      setIsDataLoaded(true);
    }
  }, [item, reset, isDataLoaded]);

  // Auto-generate slug from name (only for new entries, not when editing existing data)
  useEffect(() => {
    if (!isEditingSlug && nameValue && isDataLoaded) {
      const autoSlug = generateSlug(nameValue);
      setCustomSlug(autoSlug);
    }
  }, [nameValue, isEditingSlug, isDataLoaded]);

  const onSubmit = async (data: UpdateServiceItemRequest) => {
    try {
      if (!selectedCategory || selectedCategory === 'all') {
        toast.error('Please select a category');
        return;
      }

      const submitData: UpdateServiceItemRequest = {
        ...data,
        category_id: selectedCategory,
        code: customSlug || generateSlug(data.name || ''),
      };

      await updateMutation.mutateAsync(submitData);
      toast.success('Service item updated successfully');
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error updating service item');
    }
  };

  const handlePriceUpdate = () => {
    setPriceRefreshKey((prev) => prev + 1);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-md border border-gray-300 p-6">
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        </div>
        <div className="bg-white rounded-md border border-gray-300 p-6">
          <div className="flex justify-center py-8">
            <Loader />
          </div>
        </div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="w-full bg-white rounded-md border border-gray-300 p-6">
        <p className="text-red-500">Service item not found</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* LEFT COLUMN: Service Item Form */}
      <div className="bg-white border-r-2  border-r-gray-800 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Edit Service Item
        </h2>

        <form onSubmit={handleFormSubmit(onSubmit)}>
          <div className="grid gap-4">
            {/* Category */}
            <div className="grid gap-2">
              <Label htmlFor="category_id">
                Category <span className="text-red-500">*</span>
              </Label>
              <ServiceCategorySelect
                key={`category-${selectedCategory}`}
                selectedCategory={selectedCategory}
                handleCategoryChange={setSelectedCategory}
              />
            </div>

            {/* Name */}
            <div className="grid gap-2">
              <Label htmlFor="name">
                Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Cloud Storage"
                {...register('name', { required: 'Name is required' })}
                className="rounded-md border-gray-300"
              />
              {errors.name && (
                <p className="text-red-500 text-sm">{errors.name.message}</p>
              )}
            </div>

            {/* Code */}
            <div className="grid gap-2">
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
            </div>

            {/* Unit */}
            <div className="grid gap-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder="e.g., GB, user, month"
                {...register('unit')}
                className="rounded-md border-gray-300"
              />
              <p className="text-gray-500 text-sm">
                Unit of measurement (e.g., GB, user, month)
              </p>
            </div>

            {/* Description */}
            <div className="grid gap-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Describe the service..."
                {...register('description')}
                className="rounded-md border-gray-300 resize-none"
                rows={3}
              />
            </div>

            {/* Is Metered */}
            <div className="flex items-center gap-2">
              <Controller
                name="is_metered"
                control={control}
                render={({ field }) => (
                  <SlideToggle
                    checked={field.value}
                    onChange={field.onChange}
                    label="Metered Service"
                    variant="default"
                    size="md"
                  />
                )}
              />
              <p className="text-gray-500 text-sm">Usage-based billing</p>
            </div>

            {/* Active Status */}
            <div className="flex items-center gap-2">
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
              disabled={updateMutation.isPending}
              className="bg-main text-white rounded-md hover:bg-main-700"
            >
              {updateMutation.isPending ? 'Updating...' : 'Update Service Item'}
            </Button>
          </div>
        </form>
      </div>

      {/* RIGHT COLUMN: Price Management */}
      <div className="bg-white border border-gray-300 p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Manage Pricing</h2>

        <ItemPriceManager
          itemId={itemId}
          prices={prices}
          onUpdate={handlePriceUpdate}
          refreshKey={priceRefreshKey}
        />
      </div>
    </div>
  );
};
