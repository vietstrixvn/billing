'use client';

import { Button, Input, Label, Textarea } from '@/components/ui';
import { SlideToggle } from '@/components/ui/toggle';
import { Pencil, Package, DollarSign, Check, ArrowRight, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { toast } from 'sonner';
import type { CreateServiceItemRequest } from '@/types';
import { useCreateServiceItem } from '@/hooks/billing';
import { ServiceCategorySelect } from '@/components/selects/ser-cate.select';
import { generateSlug } from '@/utils/helpers/gen-slug.helper';
import { ItemPriceManager } from '@/components/drawers/billing/ItemPriceManager';

interface ServiceItemFormProps {
  onSuccess?: () => void;
}

export const ServiceItemForm: React.FC<ServiceItemFormProps> = ({
  onSuccess,
}) => {
  const [isEditingSlug, setIsEditingSlug] = useState(false);
  const [customSlug, setCustomSlug] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [step, setStep] = useState<'item' | 'price'>('item');
  const [createdItemId, setCreatedItemId] = useState<string | null>(null);
  const [priceRefreshKey, setPriceRefreshKey] = useState(0);

  const createMutation = useCreateServiceItem();

  const {
    register,
    handleSubmit: handleFormSubmit,
    watch,
    reset,
    control,
    formState: { errors },
  } = useForm<CreateServiceItemRequest>({
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

  // Auto-generate slug from name
  useEffect(() => {
    if (!isEditingSlug && nameValue) {
      const autoSlug = generateSlug(nameValue);
      setCustomSlug(autoSlug);
    }
  }, [nameValue, isEditingSlug]);

  const onSubmit = async (data: CreateServiceItemRequest) => {
    try {
      if (!selectedCategory || selectedCategory === 'all') {
        toast.error('Please select a category');
        return;
      }

      const submitData: CreateServiceItemRequest = {
        ...data,
        category_id: selectedCategory,
        code: customSlug || generateSlug(data.name),
      };

      const response = await createMutation.mutateAsync(submitData);

      // Extract item ID from multiple possible response shapes
      const rawItem = response?.data?.data || response?.data || response;
      const resolvedItem = Array.isArray(rawItem) ? rawItem[0] : rawItem;
      const itemId = resolvedItem?.id;

      if (itemId) {
        setCreatedItemId(itemId);
        setStep('price');
        toast.success('Service item created! Now add pricing (optional)');
      } else {
        // If no ID could be extracted, just finish
        handleFinish();
      }
    } catch (error: any) {
      toast.error(error.message || 'Error creating service item');
    }
  };

  const handleSkipPrice = () => {
    handleFinish();
  };

  const handleFinish = () => {
    reset();
    setIsEditingSlug(false);
    setCustomSlug('');
    setSelectedCategory('');
    setStep('item');
    setCreatedItemId(null);
    onSuccess?.();
  };

  const handlePriceUpdate = () => {
    setPriceRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="space-y-6">
      {/* Step Progress Indicator */}
      <div className="bg-white border border-slate-200 p-4">
        <div className="flex items-center gap-0">
          {/* Step 1 */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-all ${
                step === 'item'
                  ? 'bg-main text-white border-main'
                  : 'bg-emerald-600 text-white border-emerald-600'
              }`}
            >
              {step === 'item' ? '1' : <Check className="w-4 h-4" />}
            </div>
            <span
              className={`text-xs font-semibold ${
                step === 'item' ? 'text-slate-900' : 'text-emerald-700'
              }`}
            >
              Item Details
            </span>
          </div>

          {/* Connector */}
          <div className="flex-1 mx-4">
            <div
              className={`h-px w-full ${
                step === 'price' ? 'bg-emerald-400' : 'bg-slate-200'
              }`}
            />
          </div>

          {/* Step 2 */}
          <div className="flex items-center gap-2.5">
            <div
              className={`w-7 h-7 flex items-center justify-center text-xs font-bold border transition-all ${
                step === 'price'
                  ? 'bg-main text-white border-main'
                  : 'bg-slate-100 text-slate-400 border-slate-200'
              }`}
            >
              2
            </div>
            <span
              className={`text-xs font-semibold ${
                step === 'price' ? 'text-slate-900' : 'text-slate-400'
              }`}
            >
              Pricing (Optional)
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* LEFT COLUMN (3/5): Service Item Form */}
        <div className="lg:col-span-3 bg-white border border-slate-200 shadow-sm">
          {/* Section Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2.5">
            <Package className="h-4 w-4 text-main" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Service Item Information
            </h2>
          </div>

          <form onSubmit={handleFormSubmit(onSubmit)} className="p-5">
            <div className="space-y-5">
              {/* Category */}
              <div className="space-y-1.5">
                <Label htmlFor="category_id" className="text-xs font-medium text-slate-700">
                  Category <span className="text-red-500">*</span>
                </Label>
                <ServiceCategorySelect
                  selectedCategory={selectedCategory}
                  handleCategoryChange={setSelectedCategory}
                />
                <p className="text-[11px] text-slate-400">
                  Group this item under a service category for organization.
                </p>
              </div>

              {/* Name + Unit in same row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 space-y-1.5">
                  <Label htmlFor="name" className="text-xs font-medium text-slate-700">
                    Item Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="name"
                    placeholder="e.g., Cloud Storage, Web Hosting, SSL Certificate"
                    {...register('name', { required: 'Name is required' })}
                    className="text-xs h-9 border-slate-300 rounded-none"
                    disabled={step === 'price'}
                  />
                  {errors.name && (
                    <p className="text-red-500 text-[11px]">{errors.name.message}</p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="unit" className="text-xs font-medium text-slate-700">
                    Unit of Measure
                  </Label>
                  <Input
                    id="unit"
                    placeholder="e.g., GB, user, month"
                    {...register('unit')}
                    className="text-xs h-9 border-slate-300 rounded-none font-mono"
                    disabled={step === 'price'}
                  />
                </div>
              </div>

              {/* Code / Slug */}
              <div className="space-y-1.5">
                <Label htmlFor="code" className="text-xs font-medium text-slate-700">
                  Item Code
                </Label>
                <div className="flex items-center gap-2">
                  {!isEditingSlug ? (
                    <>
                      <div className="flex-1 px-3 py-2 bg-slate-50 border border-slate-200 text-slate-700 font-mono text-xs h-9 flex items-center">
                        {customSlug || 'auto-generated-code'}
                      </div>
                      <button
                        type="button"
                        onClick={() => setIsEditingSlug(true)}
                        className="p-2 border border-slate-300 bg-white hover:bg-slate-50 text-slate-600 transition-colors"
                        title="Edit code manually"
                        disabled={step === 'price'}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                    </>
                  ) : (
                    <>
                      <Input
                        id="code"
                        placeholder="custom-item-code"
                        value={customSlug}
                        onChange={(e) => {
                          const slugified = generateSlug(
                            e.target.value.replace(/-/g, ' ')
                          );
                          setCustomSlug(slugified);
                        }}
                        className="flex-1 text-xs h-9 border-slate-300 rounded-none font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setIsEditingSlug(false);
                          setCustomSlug(generateSlug(nameValue || ''));
                        }}
                        className="p-2 border border-slate-300 bg-white hover:bg-red-50 text-slate-500 hover:text-red-600 transition-colors"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
                <p className="text-[11px] text-slate-400">
                  Auto-generated from the item name. Click the pencil to customize.
                </p>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <Label htmlFor="description" className="text-xs font-medium text-slate-700">
                  Description
                </Label>
                <Textarea
                  id="description"
                  placeholder="Provide a brief description of what this service item covers..."
                  {...register('description')}
                  className="text-xs border-slate-300 rounded-none resize-none"
                  rows={3}
                  disabled={step === 'price'}
                />
              </div>

              {/* Toggles Row */}
              <div className="bg-slate-50 border border-slate-200 p-4 space-y-3">
                <h4 className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                  Item Properties
                </h4>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">Metered Service</p>
                    <p className="text-[11px] text-slate-400">
                      Enable if billing is based on usage (e.g., API calls, bandwidth).
                    </p>
                  </div>
                  <Controller
                    name="is_metered"
                    control={control}
                    render={({ field }) => (
                      <SlideToggle
                        checked={field.value}
                        onChange={field.onChange}
                        label=""
                        variant="default"
                        size="md"
                        disabled={step === 'price'}
                      />
                    )}
                  />
                </div>

                <div className="border-t border-slate-200" />

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <p className="text-xs font-medium text-slate-700">Active Status</p>
                    <p className="text-[11px] text-slate-400">
                      Inactive items won&apos;t appear in invoices or subscriptions.
                    </p>
                  </div>
                  <Controller
                    name="is_active"
                    control={control}
                    render={({ field }) => (
                      <SlideToggle
                        checked={field.value}
                        onChange={field.onChange}
                        label=""
                        variant="success"
                        size="md"
                        disabled={step === 'price'}
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center justify-end mt-6 pt-4 border-t border-slate-200 gap-3">
              <Button
                type="submit"
                disabled={createMutation.isPending || step === 'price'}
                className="bg-main text-white rounded-none hover:bg-blue-700 px-6 text-xs h-9"
              >
                {createMutation.isPending ? (
                  'Creating...'
                ) : (
                  <span className="flex items-center gap-2">
                    Create Item
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </div>

        {/* RIGHT COLUMN (2/5): Price Management */}
        <div className="lg:col-span-2 bg-white border border-slate-200 shadow-sm">
          {/* Section Header */}
          <div className="bg-slate-50 border-b border-slate-200 px-5 py-3 flex items-center gap-2.5">
            <DollarSign className="h-4 w-4 text-main" />
            <h2 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Pricing Configuration
            </h2>
          </div>

          <div className="p-5">
            {step === 'item' ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 bg-slate-100 border border-slate-200 flex items-center justify-center mb-4">
                  <DollarSign className="w-8 h-8 text-slate-300" />
                </div>
                <p className="text-xs font-semibold text-slate-700 mb-1">
                  Create the item first
                </p>
                <p className="text-[11px] text-slate-400 max-w-[240px]">
                  After creating the service item on the left, you can configure
                  its unit price here.
                </p>
              </div>
            ) : createdItemId ? (
              <div className="space-y-5">
                {/* Success Banner */}
                <div className="bg-emerald-50 border border-emerald-200 p-3">
                  <div className="flex items-start gap-2">
                    <Check className="h-4 w-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-semibold text-emerald-800">
                        Item created successfully
                      </p>
                      <p className="text-[11px] text-emerald-600 mt-0.5">
                        Now add pricing or skip to finish.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Manager */}
                <ItemPriceManager
                  itemId={createdItemId}
                  prices={[]}
                  onUpdate={handlePriceUpdate}
                  refreshKey={priceRefreshKey}
                />

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-200">
                  <button
                    type="button"
                    onClick={handleSkipPrice}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors"
                  >
                    Skip & Finish
                  </button>
                  <button
                    type="button"
                    onClick={handleFinish}
                    className="flex-1 px-4 py-2.5 text-xs font-semibold text-white bg-main hover:bg-blue-700 transition-colors"
                  >
                    Done — Finish
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
};
