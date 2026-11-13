'use client';

import React, { useState } from 'react';
import { useItemPrices } from '@/hooks/billing/useItemPrice';
import { Skeleton, Button } from '@/components/ui';
import type { ItemPrice } from '@/types';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { formatCurrency } from '@/utils';

export interface ServiceItemPriceCellProps {
  /** When provided (and non-empty), no API call — use list/detail embedded prices */
  item_prices?: ItemPrice[];
  /** Fetch detail prices when `item_prices` is omitted or empty */
  itemId?: string;
  refreshKey?: number;
}

export const ServiceItemPriceCell: React.FC<ServiceItemPriceCellProps> = ({
  item_prices: itemPricesProp,
  itemId,
  refreshKey = 0,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const hasPropPrices = Array.isArray(itemPricesProp) && itemPricesProp.length > 0;
  const shouldFetch = !hasPropPrices && !!itemId;

  const { data: fetchedPrices, isLoading } = useItemPrices(
    shouldFetch ? itemId! : '',
    refreshKey
  );

  const prices = hasPropPrices ? itemPricesProp : fetchedPrices;
  const showSkeleton = shouldFetch && isLoading;

  if (showSkeleton) {
    return <Skeleton className="h-4 w-24" />;
  }

  if (!prices || prices.length === 0) {
    return <span className="text-gray-400 text-xs font-medium">—</span>;
  }

  const activePrice = prices.find((p) => p.is_active) ?? prices[0];
  const otherPrices = prices.filter((p) => p.id !== activePrice.id);
  const hasMultiplePrices = otherPrices.length > 0;
  const amount = activePrice.unit_amount ?? activePrice.price ?? 0;

  return (
    <div className="flex flex-col gap-1">
      <div className="text-xs flex items-center gap-1.5">
        <span className="font-semibold font-mono text-gray-900">
          {formatCurrency(amount, activePrice.currency || 'VND')}
        </span>
        {hasMultiplePrices && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="h-5 w-5 p-0 hover:bg-gray-100 text-slate-500"
            title={isExpanded ? 'Collapse other prices' : 'View other prices'}
          >
            {isExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>

      {hasMultiplePrices && !isExpanded && (
        <span className="text-[10px] text-gray-400 pl-0.5">
          +{otherPrices.length} more price{otherPrices.length > 1 ? 's' : ''}
        </span>
      )}

      {hasMultiplePrices && isExpanded && (
        <div className="flex flex-col gap-1 pl-2 border-l-2 border-slate-200 mt-1">
          {otherPrices.map((price: ItemPrice) => {
            const rowAmount = price.unit_amount ?? price.price ?? 0;
            return (
              <div key={price.id} className="text-xs flex items-center gap-1.5">
                <span className="font-mono text-gray-600">
                  {formatCurrency(rowAmount, price.currency || 'VND')}
                </span>
                {!price.is_active && (
                  <span className="text-[9px] text-gray-400 font-medium">(inactive)</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
