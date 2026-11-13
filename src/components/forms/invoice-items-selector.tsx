'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui';
import { Plus, Trash2 } from 'lucide-react';
import { usePlans, useServiceItems } from '@/hooks/billing';
import type { InvoiceItemInput } from '@/types/billing/responses';
import type { Plan, ServiceItem } from '@/types/billing/responses';

interface InvoiceItemsSelectorProps {
  items: InvoiceItemInput[];
  onChange: (items: InvoiceItemInput[]) => void;
  onSubTotalChange: (subTotal: number) => void;
}

export const InvoiceItemsSelector: React.FC<InvoiceItemsSelectorProps> = ({
  items,
  onChange,
  onSubTotalChange,
}) => {
  const [itemSource, setItemSource] = useState<'plan' | 'custom'>('custom');

  // Fetch plans and service items
  const { data: plansData } = usePlans(1, { page_size: 100 }, 0);
  const { data: serviceItemsData } = useServiceItems(
    1,
    { page_size: 100, include_prices: 'true' },
    0
  );

  const plans = plansData?.data?.results || [];
  const serviceItems = serviceItemsData?.results || [];

  // Calculate subtotal
  const calculateSubTotal = (currentItems: InvoiceItemInput[]) => {
    const total = currentItems.reduce((sum, item) => {
      const itemTotal = item.quantity * (item.unit_price || 0);
      const discount = (itemTotal * (item.discount_percent || 0)) / 100;
      return sum + (itemTotal - discount);
    }, 0);
    onSubTotalChange(total);
    return total;
  };

  // Add new item
  const addItem = () => {
    const newItem: InvoiceItemInput = {
      source: itemSource,
      plan_id: itemSource === 'plan' ? undefined : undefined,
      service_item_id: itemSource === 'custom' ? undefined : undefined,
      quantity: 1,
      unit_price: 0,
      discount_percent: 0,
      notes: '',
    };
    const newItems = [...items, newItem];
    onChange(newItems);
  };

  // Remove item
  const removeItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    onChange(newItems);
    calculateSubTotal(newItems);
  };

  // Update item
  const updateItem = (
    index: number,
    field: keyof InvoiceItemInput,
    value: any
  ) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };

    // If changing source, reset related fields
    if (field === 'source') {
      newItems[index].plan_id = undefined;
      newItems[index].service_item_id = undefined;
      newItems[index].unit_price = 0;
    }

    // If selecting plan, auto-fill price from included items
    if (field === 'plan_id' && value) {
      const plan = plans.find((p: Plan) => p.id === value);
      if (plan && plan.included_items && plan.included_items.length > 0) {
        // Use the first included item's service_item price as default
        const firstItem = plan.included_items[0];
        if (
          firstItem.service_item?.item_prices &&
          firstItem.service_item.item_prices.length > 0
        ) {
          const activePrice = firstItem.service_item.item_prices.find(
            (p) => p.is_active
          );
          const price = activePrice || firstItem.service_item.item_prices[0];
          newItems[index].unit_price =
            price.unit_amount || price.flat_amount || 0;
        }
      }
    }

    // If selecting service item, auto-fill price from item_prices
    if (field === 'service_item_id' && value) {
      const serviceItem = serviceItems.find((s: ServiceItem) => s.id === value);
      if (
        serviceItem &&
        serviceItem.item_prices &&
        serviceItem.item_prices.length > 0
      ) {
        // Use the first active price
        const activePrice = serviceItem.item_prices.find((p) => p.is_active);
        const price = activePrice || serviceItem.item_prices[0];
        newItems[index].unit_price =
          price.unit_amount || price.flat_amount || 0;
      }
    }

    onChange(newItems);
    calculateSubTotal(newItems);
  };

  // Calculate item total
  const getItemTotal = (item: InvoiceItemInput) => {
    const subtotal = item.quantity * (item.unit_price || 0);
    const discount = (subtotal * (item.discount_percent || 0)) / 100;
    return subtotal - discount;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700">Invoice Items</h3>
        <div className="flex items-center gap-2">
          <Select
            value={itemSource}
            onValueChange={(value: 'plan' | 'custom') => setItemSource(value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="plan">From Plan</SelectItem>
              <SelectItem value="custom">Custom Item</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addItem}
            className="flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-8 text-gray-500 border-2 border-dashed rounded-md">
          No items added yet. Click{' '}
          <span className="font-medium">Add Item</span> to start.
        </div>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <div
              key={index}
              className="p-4 border rounded-md bg-gray-50 space-y-3"
            >
              <div className="flex items-start justify-between">
                <span className="text-xs font-semibold text-gray-600">
                  Item #{index + 1}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Source Type */}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Source</Label>
                  <Select
                    value={item.source}
                    onValueChange={(value: 'plan' | 'custom') =>
                      updateItem(index, 'source', value)
                    }
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="plan">Plan</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Plan or Service Item Selection */}
                {item.source === 'plan' ? (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Plan</Label>
                    <Select
                      value={item.plan_id || ''}
                      onValueChange={(value) =>
                        updateItem(index, 'plan_id', value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select plan" />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map((plan: Plan) => (
                          <SelectItem key={plan.id} value={plan.id}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : (
                  <div className="grid gap-1.5">
                    <Label className="text-xs">Service Item</Label>
                    <Select
                      value={item.service_item_id || ''}
                      onValueChange={(value) =>
                        updateItem(index, 'service_item_id', value)
                      }
                    >
                      <SelectTrigger className="h-9">
                        <SelectValue placeholder="Select service" />
                      </SelectTrigger>
                      <SelectContent>
                        {serviceItems.map((service: ServiceItem) => {
                          // Get price from item_prices
                          const activePrice = service.item_prices?.find(
                            (p) => p.is_active
                          );
                          const price = activePrice || service.item_prices?.[0];
                          const priceDisplay = price
                            ? `${(price.unit_amount || price.flat_amount || 0).toLocaleString()} ${price.currency}`
                            : 'No price';

                          return (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name} - {priceDisplay}
                            </SelectItem>
                          );
                        })}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Quantity */}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Quantity</Label>
                  <Input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'quantity',
                        parseInt(e.target.value) || 1
                      )
                    }
                    className="h-9"
                  />
                </div>

                {/* Unit Price */}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Unit Price (VND)</Label>
                  <Input
                    type="number"
                    min="0"
                    value={item.unit_price}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'unit_price',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-9"
                  />
                </div>

                {/* Discount */}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Discount (%)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={item.discount_percent || 0}
                    onChange={(e) =>
                      updateItem(
                        index,
                        'discount_percent',
                        parseFloat(e.target.value) || 0
                      )
                    }
                    className="h-9"
                  />
                </div>

                {/* Item Total */}
                <div className="grid gap-1.5">
                  <Label className="text-xs">Total</Label>
                  <div className="h-9 px-3 py-2 bg-gray-100 border rounded-md flex items-center font-semibold text-sm">
                    {getItemTotal(item).toLocaleString()} VND
                  </div>
                </div>

                {/* Notes */}
                <div className="grid gap-1.5 md:col-span-2">
                  <Label className="text-xs">Notes (optional)</Label>
                  <Input
                    value={item.notes || ''}
                    onChange={(e) => updateItem(index, 'notes', e.target.value)}
                    placeholder="Additional notes..."
                    className="h-9"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Summary */}
      {items.length > 0 && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-semibold text-blue-800">
              Subtotal ({items.length} item{items.length > 1 ? 's' : ''}):
            </span>
            <span className="text-lg font-bold text-blue-900">
              {calculateSubTotal(items).toLocaleString()} VND
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
