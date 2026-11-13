'use client';

import { Button } from '@/components/ui';
import { GripVertical, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { ServiceItem } from '@/types';
import { usePlanIncludedItems, useSetPlanIncludedItems } from '@/hooks/billing';
import { useServiceItems } from '@/hooks/billing';
import { Loader } from '../loading/loader';

interface PlanItemsFormProps {
  planId: string;
  onSuccess?: () => void;
}

interface SelectedItem {
  id: string;
  service_item: ServiceItem;
  sort_order: number;
}

export const PlanItemsForm: React.FC<PlanItemsFormProps> = ({
  planId,
  onSuccess,
}) => {
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);
  const [availableItems, setAvailableItems] = useState<ServiceItem[]>([]);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [showAddMenu, setShowAddMenu] = useState(false);

  // Fetch current plan items
  const { data: planItems, isLoading: loadingPlanItems } = usePlanIncludedItems(
    planId,
    1,
    false // No need for prices in this form
  );

  // Fetch all service items
  const { data: serviceItemsData, isLoading: loadingServiceItems } =
    useServiceItems(1, { page_size: 100, active_only: 'true' }, 0);

  const updateMutation = useSetPlanIncludedItems(planId);

  // Initialize selected items from plan
  useEffect(() => {
    if (planItems?.data) {
      const items = planItems.data.map((item, index) => ({
        id: item.service_item_id,
        service_item: item.service_item!,
        sort_order: index,
      }));
      setSelectedItems(items);
    }
  }, [planItems]);

  // Update available items (exclude already selected)
  useEffect(() => {
    if (serviceItemsData?.results) {
      const selectedIds = selectedItems.map((item) => item.id);
      const available = serviceItemsData.results.filter(
        (item) => !selectedIds.includes(item.id)
      );
      setAvailableItems(available);
    }
  }, [serviceItemsData, selectedItems]);

  const handleAddItem = (item: ServiceItem) => {
    const newItem: SelectedItem = {
      id: item.id,
      service_item: item,
      sort_order: selectedItems.length,
    };
    setSelectedItems([...selectedItems, newItem]);
    setShowAddMenu(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(selectedItems.filter((item) => item.id !== itemId));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = [...selectedItems];
    const draggedItem = items[draggedIndex];
    items.splice(draggedIndex, 1);
    items.splice(index, 0, draggedItem);

    // Update sort orders
    const reordered = items.map((item, idx) => ({
      ...item,
      sort_order: idx,
    }));

    setSelectedItems(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleSubmit = async () => {
    try {
      const items = selectedItems.map((item) => ({
        service_item_id: item.id,
        quantity: 1, // Default quantity
        is_unlimited: false,
      }));

      await updateMutation.mutateAsync({ items });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error updating plan items');
    }
  };

  if (loadingPlanItems || loadingServiceItems) {
    return (
      <div className="w-full bg-white rounded-md border border-gray-300 p-6">
        <div className="flex justify-center py-8">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-white rounded-md border border-gray-300 p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Plan Included Items
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Select and reorder service items included in this plan
          </p>
        </div>
        <Button
          type="button"
          onClick={() => setShowAddMenu(!showAddMenu)}
          className="bg-main text-white rounded-md hover:bg-main-700"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Item
        </Button>
      </div>

      {/* Add Item Menu */}
      {showAddMenu && (
        <div className="mb-4 p-4 bg-gray-50 rounded-md border border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-700">
              Available Service Items
            </h3>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowAddMenu(false)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {availableItems.length === 0 ? (
            <p className="text-sm text-gray-500">
              No more items available to add
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {availableItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleAddItem(item)}
                  className="flex items-center justify-between p-3 bg-white rounded-md border border-gray-200 hover:border-main hover:bg-blue-50 transition-colors text-left"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {item.category?.name}
                    </p>
                  </div>
                  <Plus className="w-4 h-4 text-main" />
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Selected Items List */}
      <div className="space-y-2 mb-6">
        {selectedItems.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No items selected</p>
            <p className="text-sm mt-1">
              Click <span className="font-medium">Add Item</span> to get started
            </p>
          </div>
        ) : (
          selectedItems.map((item, index) => (
            <div
              key={item.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={`flex items-center gap-3 p-3 bg-white rounded-md border border-gray-200 cursor-move hover:border-main transition-colors ${draggedIndex === index ? 'opacity-50' : ''
                }`}
            >
              <GripVertical className="w-5 h-5 text-gray-400 flex-shrink-0" />

              <div className="flex-1">
                <p className="text-sm font-medium text-gray-800">
                  {item.service_item.name}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs text-gray-500">
                    {item.service_item.category?.name}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    Order: {index + 1}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {item.service_item.unit && (
                  <span className="px-2 py-1 text-xs rounded-md font-medium bg-gray-100 text-gray-700">
                    {item.service_item.unit}
                  </span>
                )}

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveItem(item.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Info Box */}
      <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-200">
        <p className="text-sm text-blue-800">
          <strong>Tip:</strong> Drag and drop items to reorder them. The order
          determines how they appear in invoices and subscription details.
        </p>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-4 border-t border-gray-200">
        <Button
          type="button"
          onClick={handleSubmit}
          disabled={updateMutation.isPending}
          className="bg-main text-white rounded-md hover:bg-main-700"
        >
          {updateMutation.isPending ? 'Saving...' : 'Save Plan Items'}
        </Button>
      </div>
    </div>
  );
};
