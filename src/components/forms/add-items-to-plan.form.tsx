'use client';

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Plus, X, Save, Loader2, PackagePlus, Minus, DollarSign } from 'lucide-react';
import { ServiceItemList, ServiceCategoryList } from '@/libs/responses';
import { useAddItemToPlan } from '@/hooks/billing/usePlanIncludedItem';
import type { ServiceItem, ItemPrice } from '@/types';
import { logError } from '@/utils';
import { ServiceItemPriceCell } from '@/components/tables/billing/ServiceItemPriceCell';

interface AddItemsToPlanFormProps {
  planId: string;
  existingItemIds: string[];
  onSuccess: () => void;
}

interface PendingItem extends ServiceItem {
  quantity: number;
  is_unlimited: boolean;
  selectedPriceId?: string;
  selectedPrice?: ItemPrice;
}

export function AddItemsToPlanForm({
  planId,
  existingItemIds,
  onSuccess,
}: AddItemsToPlanFormProps) {
  const [refreshKey] = useState(0);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [pendingItems, setPendingItems] = useState<PendingItem[]>([]);
  const [itemQuantities, setItemQuantities] = useState<Record<string, number>>({});
  const [selectedPrices, setSelectedPrices] = useState<Record<string, string>>({});
  const [isSaving, setIsSaving] = useState(false);

  const { items, isLoading } = ServiceItemList(
    1,
    { page_size: 100, include_prices: 'true' },
    refreshKey
  );
  const { categories } = ServiceCategoryList(1, { page_size: 50 }, refreshKey);
  const addMutation = useAddItemToPlan(planId);

  // Filter available items (not already in plan and not in pending)
  const availableItems = useMemo(() => {
    const pendingIds = new Set(pendingItems.map((item) => String(item.id)));
    const existingSet = new Set(existingItemIds.map((id) => String(id)));

    const filtered = items.filter((item) => {
      const itemIdStr = String(item.id);
      const notInPlan = !existingSet.has(itemIdStr);
      const notPending = !pendingIds.has(itemIdStr);
      const matchSearch =
        !search ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.code.toLowerCase().includes(search.toLowerCase());
      const matchCategory =
        categoryFilter === 'all' || String(item.category_id) === categoryFilter;
      return notInPlan && notPending && matchSearch && matchCategory;
    });

    return filtered;
  }, [items, existingItemIds, pendingItems, search, categoryFilter]);

  const handleAvailableQtyChange = (itemId: string, val: number) => {
    const qty = Math.max(1, isNaN(val) ? 1 : val);
    setItemQuantities((prev) => ({ ...prev, [itemId]: qty }));
  };

  const handleSelectPrice = (itemId: string, priceId: string) => {
    setSelectedPrices((prev) => ({ ...prev, [itemId]: priceId }));
  };

  const handleAddItem = (item: ServiceItem) => {
    const qty = itemQuantities[item.id] || 1;
    const prices = item.item_prices || [];
    const priceId = selectedPrices[item.id] || (prices.length > 0 ? prices[0].id : undefined);
    const chosenPrice = prices.find((p) => p.id === priceId) || prices[0];

    setPendingItems((prev) => [
      ...prev,
      {
        ...item,
        quantity: qty,
        is_unlimited: false,
        selectedPriceId: priceId,
        selectedPrice: chosenPrice,
      },
    ]);
  };

  const handleUpdatePendingQuantity = (itemId: string, quantity: number) => {
    const validQty = Math.max(1, isNaN(quantity) ? 1 : quantity);
    setPendingItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, quantity: validQty } : item
      )
    );
  };

  const handleTogglePendingUnlimited = (itemId: string, isUnlimited: boolean) => {
    setPendingItems((prev) =>
      prev.map((item) =>
        item.id === itemId ? { ...item, is_unlimited: isUnlimited } : item
      )
    );
  };

  const handleRemovePending = (itemId: string) => {
    setPendingItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleSaveAll = async () => {
    if (pendingItems.length === 0) return;

    setIsSaving(true);
    try {
      for (const item of pendingItems) {
        await addMutation.mutateAsync({
          service_item_id: item.id,
          quantity: item.is_unlimited ? 0 : item.quantity,
          is_unlimited: item.is_unlimited,
          item_price_id: item.selectedPriceId,
          price_id: item.selectedPriceId,
        });
      }
      setPendingItems([]);
      onSuccess();
    } catch (error) {
      logError('Error adding items:', error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Card className="border border-gray-300 shadow-xs bg-white">
      <CardHeader className="border-b border-gray-100 pb-4">
        <CardTitle className="text-base font-bold text-main flex items-center gap-2">
          <PackagePlus className="w-5 h-5 text-main" />
          Add Items to Plan
        </CardTitle>
        <CardDescription className="text-xs text-gray-500">
          Select service items, choose pricing tier, and specify quantities to include in this plan
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5 pt-4">
        {/* Pending Items */}
        {pendingItems.length > 0 && (
          <div className="bg-blue-50/60 border border-blue-200 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Pending Items ({pendingItems.length})
              </span>
              <Button
                size="sm"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="bg-main hover:bg-primary-800 text-white h-8 text-xs px-3 shadow-xs"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5 mr-1.5" />
                    Save All Items
                  </>
                )}
              </Button>
            </div>
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {pendingItems.map((item) => {
                const price = item.selectedPrice;
                const priceAmount = price ? (price.unit_amount ?? price.price ?? 0) : null;

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-blue-200 rounded-md shadow-2xs gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        {item.unit && (
                          <span className="text-xs text-gray-400">
                            Unit: {item.unit}
                          </span>
                        )}
                        {price && priceAmount !== null && (
                          <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                            <DollarSign className="w-3 h-3 mr-0.5" />
                            {price.billing_cycle}: {priceAmount.toLocaleString()} {price.currency}
                          </Badge>
                        )}
                      </div>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex items-center gap-3 self-end sm:self-center">
                      <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-md p-1">
                        <label className="text-xs font-medium text-gray-600 pl-1">
                          Qty:
                        </label>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-gray-900"
                          onClick={() =>
                            handleUpdatePendingQuantity(item.id, item.quantity - 1)
                          }
                          disabled={item.is_unlimited || item.quantity <= 1}
                        >
                          <Minus className="w-3 h-3" />
                        </Button>
                        <Input
                          type="number"
                          min={1}
                          value={item.quantity}
                          disabled={item.is_unlimited}
                          onChange={(e) =>
                            handleUpdatePendingQuantity(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-14 h-7 text-center text-xs font-bold border-gray-300 focus-visible:ring-1 focus-visible:ring-main p-0"
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-gray-500 hover:text-gray-900"
                          onClick={() =>
                            handleUpdatePendingQuantity(item.id, item.quantity + 1)
                          }
                          disabled={item.is_unlimited}
                        >
                          <Plus className="w-3 h-3" />
                        </Button>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <Checkbox
                          id={`unlimited-${item.id}`}
                          checked={item.is_unlimited}
                          onCheckedChange={(checked) =>
                            handleTogglePendingUnlimited(item.id, !!checked)
                          }
                        />
                        <label
                          htmlFor={`unlimited-${item.id}`}
                          className="text-xs text-gray-600 select-none cursor-pointer whitespace-nowrap"
                        >
                          Unlimited
                        </label>
                      </div>

                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleRemovePending(item.id)}
                        className="h-7 w-7 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 rounded"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            <Input
              placeholder="Search items by name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm border-gray-300 focus-visible:ring-1 focus-visible:ring-main"
            />
          </div>

          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="h-9 text-sm border-gray-300">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((cat) => (
                <SelectItem key={cat.id} value={cat.id}>
                  {cat.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Available Items List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold text-gray-600">
            <span>AVAILABLE SERVICE ITEMS</span>
            <span className="text-gray-400 tabular-nums">
              {availableItems.length} items
            </span>
          </div>
          <div className="space-y-2 max-h-96 overflow-y-auto border border-gray-200 rounded-md p-2 bg-gray-50/50">
            {isLoading ? (
              <div className="text-center py-8 text-xs text-gray-400">
                Loading service items...
              </div>
            ) : availableItems.length === 0 ? (
              <div className="text-center py-8 text-xs text-gray-400">
                No items available to add
              </div>
            ) : (
              availableItems.map((item) => {
                const currentQty = itemQuantities[item.id] || 1;
                const prices = item.item_prices || [];
                const currentPriceId = selectedPrices[item.id] || (prices.length > 0 ? prices[0].id : '');

                return (
                  <div
                    key={item.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-3 bg-white border border-gray-200 rounded-md hover:border-gray-300 transition-colors gap-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-800 truncate">
                        {item.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <span className="text-xs text-gray-500 font-mono bg-gray-100 px-1.5 py-0.5 rounded">
                          {item.code}
                        </span>
                        {item.unit && (
                          <Badge variant="outline" className="text-[10px] text-gray-500 font-normal">
                            {item.unit}
                          </Badge>
                        )}

                        {/* Price selector or price display */}
                        {prices.length > 1 ? (
                          <Select
                            value={currentPriceId}
                            onValueChange={(val) => handleSelectPrice(item.id, val)}
                          >
                            <SelectTrigger className="h-6 text-[11px] px-2 w-auto bg-gray-50 border-gray-300 font-medium">
                              <SelectValue placeholder="Select price" />
                            </SelectTrigger>
                            <SelectContent>
                              {prices.map((p) => {
                                const amt = p.unit_amount ?? p.price ?? 0;
                                return (
                                  <SelectItem key={p.id} value={p.id} className="text-xs">
                                    {p.billing_cycle}: {amt.toLocaleString()} {p.currency}
                                  </SelectItem>
                                );
                              })}
                            </SelectContent>
                          </Select>
                        ) : (
                          <ServiceItemPriceCell item_prices={prices} />
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <div className="flex items-center gap-1 border border-gray-300 rounded-md px-1 py-0.5 bg-white">
                        <span className="text-xs text-gray-500 pl-1 font-medium">Qty:</span>
                        <Input
                          type="number"
                          min={1}
                          value={currentQty}
                          onChange={(e) =>
                            handleAvailableQtyChange(
                              item.id,
                              parseInt(e.target.value) || 1
                            )
                          }
                          className="w-14 h-7 text-center text-xs font-bold border-0 focus-visible:ring-0 p-0"
                        />
                      </div>
                      <Button
                        size="sm"
                        onClick={() => handleAddItem(item)}
                        className="bg-main hover:bg-primary-800 text-white h-8 text-xs px-3 shadow-xs"
                      >
                        <Plus className="w-3.5 h-3.5 mr-1" />
                        Add
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
