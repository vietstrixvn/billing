'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import React from 'react';
import { useServiceItemDetail } from '@/hooks/billing';
import { Loader } from '@/components/loading/loader';
import { formatPrice } from '@/utils/helpers/format.helper';

interface ViewServiceItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemId: string;
}

export const ViewServiceItemDialog: React.FC<ViewServiceItemDialogProps> = ({
  open,
  onOpenChange,
  itemId,
}) => {
  const { data: item, isLoading } = useServiceItemDetail(itemId, open ? 1 : 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] bg-white border-gray-300">
        <DialogHeader>
          <DialogTitle>Service Item Details</DialogTitle>
          <DialogDescription>
            View detailed information about this service item
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 flex justify-center">
            <Loader />
          </div>
        ) : item ? (
          <div className="space-y-4">
            {/* Basic Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Name
                </label>
                <p className="mt-1 text-sm text-main font-semibold">
                  {item.name}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-gray-700">
                  Code
                </label>
                <p className="mt-1 text-sm text-main font-semibold font-mono bg-gray-50 px-2 py-1 rounded">
                  {item.code}
                </p>
              </div>

              {item.unit && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Unit
                  </label>
                  <p className="mt-1 text-sm text-main font-semibold">
                    {item.unit}
                  </p>
                </div>
              )}

              {item.is_metered !== undefined && (
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Metered
                  </label>
                  <p className="mt-1">
                    {item.is_metered ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                        Yes
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                        No
                      </span>
                    )}
                  </p>
                </div>
              )}
            </div>

            {/* Category */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Category
              </label>
              <p className="mt-1 text-sm text-main font-semibold">
                {item.category?.name || 'N/A'}
              </p>
            </div>

            {/* Description */}
            {item.description && (
              <div>
                <label className="text-sm font-medium text-gray-700">
                  Description
                </label>
                <p className="mt-1 text-sm text-gray-600">{item.description}</p>
              </div>
            )}

            {/* Pricing Information */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Pricing Information
              </h4>

              {item.item_prices && item.item_prices.length > 0 ? (
                <div className="space-y-3">
                  {item.item_prices.map((price) => (
                    <div
                      key={price.id}
                      className="p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          {price.name && (
                            <p className="text-xs font-medium text-gray-500 mb-0.5">
                              {price.name}
                            </p>
                          )}
                          <p className="text-base font-bold text-main font-mono">
                            {formatPrice(
                              price.unit_amount || price.price || price.flat_amount || 0
                            )}{' '}
                            {price.currency}
                            {item.unit && (
                              <span className="text-xs font-normal text-gray-500">
                                {' '}/ {item.unit}
                              </span>
                            )}
                          </p>
                        </div>

                        <div>
                          {price.is_active ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              Inactive
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 italic">
                  No pricing configured
                </p>
              )}
            </div>

            {/* Additional Information */}
            <div className="border-t pt-4">
              <h4 className="text-sm font-semibold text-gray-800 mb-3">
                Additional Information
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Sort Order
                  </label>
                  <p className="mt-1 text-sm text-main font-semibold">
                    {item.sort_order ?? 0}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Status
                  </label>
                  <p className="mt-1">
                    {item.is_active ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-red-100 text-red-800">
                        Inactive
                      </span>
                    )}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Created At
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(item.created_at).toLocaleString('vi-VN')}
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-700">
                    Updated At
                  </label>
                  <p className="mt-1 text-sm text-gray-600">
                    {new Date(item.updated_at).toLocaleString('vi-VN')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-gray-500">
            Service item not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
