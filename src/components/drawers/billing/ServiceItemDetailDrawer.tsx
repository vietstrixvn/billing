'use client';

import React, { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  Skeleton,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui';
import { ServiceItemDetail } from '@/libs/responses';
import { ItemPriceList } from '@/libs/responses';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { formatCurrency } from '@/utils';
import { ItemPriceManager } from '@/components/drawers/billing/ItemPriceManager';
import { DollarSign, Settings } from 'lucide-react';

interface ServiceItemDetailDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
  refreshKey?: number;
}

export const ServiceItemDetailDrawer: React.FC<
  ServiceItemDetailDrawerProps
> = ({ open, onOpenChange, itemId, refreshKey = 0 }) => {
  const [priceRefreshKey, setPriceRefreshKey] = useState(0);

  const { item, isLoading } = ServiceItemDetail(itemId, refreshKey);
  const { prices, isLoading: pricesLoading } = ItemPriceList(
    itemId,
    priceRefreshKey
  );

  const handlePriceUpdate = () => {
    setPriceRefreshKey((prev) => prev + 1);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto bg-white">
        <SheetHeader>
          <SheetTitle>Service Item Details</SheetTitle>
          <SheetDescription>
            View and manage service item information and pricing
          </SheetDescription>
        </SheetHeader>

        {isLoading ? (
          <div className="space-y-4 mt-6">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-32 w-full" />
          </div>
        ) : item ? (
          <div className="mt-6 space-y-6 p-8">
            {/* Basic Information */}
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    Code: <span className="font-mono">{item.code}</span>
                  </p>
                </div>
                <Badge variant={item.is_active ? 'default' : 'secondary'}>
                  {item.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>

              {item.description && (
                <p className="text-sm text-gray-600">{item.description}</p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Category
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {item.category?.name || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Unit
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {item.unit || item.unit_label || '—'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Metered
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {item.is_metered ? (
                      <Badge variant="outline" className="bg-blue-50">
                        Yes
                      </Badge>
                    ) : (
                      <Badge variant="outline">No</Badge>
                    )}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 uppercase tracking-wide">
                    Created
                  </p>
                  <p className="text-sm font-medium mt-1">
                    {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Pricing Section */}
            <Tabs defaultValue="prices" className="w-full">
              <TabsList className="grid w-full grid-cols-2 bg-main text-white">
                <TabsTrigger value="prices">
                  <DollarSign className="w-4 h-4 mr-2" />
                  Prices ({prices.length})
                </TabsTrigger>
                <TabsTrigger value="manage">
                  <Settings className="w-4 h-4 mr-2" />
                  Manage
                </TabsTrigger>
              </TabsList>

              <TabsContent value="prices" className="space-y-4 mt-4">
                {pricesLoading ? (
                  <div className="space-y-3">
                    {[1, 2].map((i) => (
                      <Skeleton key={i} className="h-24 w-full" />
                    ))}
                  </div>
                ) : prices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No prices configured</p>
                    <p className="text-xs mt-1">Add prices in the Manage tab</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {prices.map((price) => (
                      <div key={price.id} className="border p-4 space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            {price.name && (
                              <p className="text-sm font-medium text-gray-700 mb-1">
                                {price.name}
                              </p>
                            )}
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-semibold text-lg font-mono">
                                {formatCurrency(
                                  price.unit_amount || price.price || 0,
                                  price.currency
                                )}
                              </span>
                              {item.unit && (
                                <span className="text-xs text-gray-500">
                                  / {item.unit}
                                </span>
                              )}
                              {price.is_active ? (
                                <Badge className="bg-green-500 text-xs">
                                  Active
                                </Badge>
                              ) : (
                                <Badge variant="secondary" className="text-xs">
                                  Inactive
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 mt-1">
                              Valid from:{' '}
                              {new Date(
                                price.valid_from || price.effective_from || ''
                              ).toLocaleDateString()}
                              {(price.valid_until || price.effective_to) &&
                                ` to ${new Date(price.valid_until || price.effective_to || '').toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="manage" className="mt-4">
                <ItemPriceManager
                  itemId={itemId}
                  prices={prices}
                  onUpdate={handlePriceUpdate}
                  refreshKey={priceRefreshKey}
                />
              </TabsContent>
            </Tabs>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>Item not found</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};
