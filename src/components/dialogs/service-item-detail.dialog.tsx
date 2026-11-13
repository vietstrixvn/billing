'use client';

import React, { useState } from 'react';
import {
  X,
  Package,
  DollarSign,
  Settings,
  Clock,
  Gauge,
  CheckCircle2,
  XCircle,
} from 'lucide-react';
import { Skeleton } from '@/components/ui';
import { ServiceItemDetail, ItemPriceList } from '@/libs/responses';
import { formatCurrency } from '@/utils';
import { ItemPriceManager } from '@/components/drawers/billing/ItemPriceManager';

interface ServiceItemDetailDialogProps {
  itemId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ServiceItemDetailDialog: React.FC<ServiceItemDetailDialogProps> = ({
  itemId,
  isOpen,
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'prices' | 'manage'>('overview');
  const [priceRefreshKey, setPriceRefreshKey] = useState(0);

  const { item, isLoading } = ServiceItemDetail(itemId || '', 0);
  const { prices, isLoading: pricesLoading } = ItemPriceList(
    itemId || '',
    priceRefreshKey
  );

  if (!isOpen || !itemId) return null;

  const handlePriceUpdate = () => {
    setPriceRefreshKey((prev) => prev + 1);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 w-full max-w-5xl shadow-xl overflow-hidden my-8">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-main text-white">
              <Package className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                {isLoading ? (
                  <Skeleton className="h-5 w-48 bg-slate-700" />
                ) : (
                  <>
                    {item?.name || 'Service Item'}
                    {item?.code && (
                      <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 font-mono font-normal border border-slate-700">
                        {item.code}
                      </span>
                    )}
                  </>
                )}
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {item?.category?.name || 'Uncategorized'} • ID: {itemId}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 flex items-center px-5 gap-2 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'overview'
                ? 'border-main text-main bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Package className="h-4 w-4" />
            Item Overview
          </button>
          <button
            onClick={() => setActiveTab('prices')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'prices'
                ? 'border-main text-main bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <DollarSign className="h-4 w-4" />
            Pricing ({prices.length})
          </button>
          <button
            onClick={() => setActiveTab('manage')}
            className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'manage'
                ? 'border-main text-main bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900'
            }`}
          >
            <Settings className="h-4 w-4" />
            Add / Edit Price
          </button>
        </div>

        {/* Dialog Content */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="space-y-4 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-12 bg-slate-100 w-full" />
              ))}
            </div>
          ) : !item ? (
            <div className="py-12 text-center text-xs text-red-500">
              Item not found or unavailable.
            </div>
          ) : (
            <>
              {/* TAB: OVERVIEW */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  {/* Status & Quick Stats Row */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Status
                      </span>
                      <div className="mt-1">
                        {item.is_active ? (
                          <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 px-2 py-0.5 text-xs font-bold">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 bg-amber-100 text-amber-800 px-2 py-0.5 text-xs font-bold">
                            <XCircle className="h-3.5 w-3.5" /> Inactive
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Metered
                      </span>
                      <div className="mt-1">
                        {item.is_metered ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-700">
                            <Gauge className="h-3.5 w-3.5" /> Usage-based
                          </span>
                        ) : (
                          <span className="text-xs font-medium text-slate-600">
                            Fixed
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Unit
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-1 font-mono">
                        {item.unit || item.unit_label || '—'}
                      </p>
                    </div>

                    <div className="bg-slate-50 p-4 border border-slate-200">
                      <span className="text-[11px] font-semibold text-slate-500 uppercase block">
                        Active Prices
                      </span>
                      <p className="text-sm font-bold text-slate-900 mt-1">
                        {prices.filter((p) => p.is_active).length} / {prices.length}
                      </p>
                    </div>
                  </div>

                  {/* Detail Section */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                        Item Identification
                      </h4>
                      <div className="space-y-2 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Name:</span>
                          <span className="font-semibold text-slate-900">
                            {item.name}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Item Code:</span>
                          <span className="font-mono font-bold text-slate-900 bg-slate-50 px-2 py-0.5 border border-slate-200">
                            {item.code}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-100">
                          <span className="text-slate-500">Category:</span>
                          <span className="text-slate-800 font-medium">
                            {item.category?.name || '—'}
                          </span>
                        </div>
                        <div className="flex justify-between py-1">
                          <span className="text-slate-500">Created:</span>
                          <span className="text-slate-700">
                            {item.created_at
                              ? new Date(item.created_at).toLocaleDateString()
                              : '—'}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="border border-slate-200 p-4 space-y-3">
                      <h4 className="text-xs font-bold text-slate-900 uppercase border-b border-slate-200 pb-2">
                        Description
                      </h4>
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {item.description || (
                          <span className="italic text-slate-400">
                            No description provided for this service item.
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB: PRICES */}
              {activeTab === 'prices' && (
                <div className="space-y-4">
                  {pricesLoading ? (
                    <div className="space-y-3 animate-pulse">
                      {[1, 2].map((i) => (
                        <div key={i} className="h-24 bg-slate-100 w-full" />
                      ))}
                    </div>
                  ) : prices.length === 0 ? (
                    <div className="bg-slate-50 border border-slate-200 p-10 text-center">
                      <DollarSign className="w-10 h-10 mx-auto mb-2 text-slate-300" />
                      <p className="text-xs font-semibold text-slate-700">
                        No prices configured
                      </p>
                      <p className="text-[11px] text-slate-400 mt-1">
                        Switch to the "Add / Edit Price" tab to create pricing.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {prices.map((price) => (
                        <div
                          key={price.id}
                          className={`border p-4 space-y-2 transition-all ${
                            price.is_active
                              ? 'border-slate-200 bg-white'
                              : 'border-slate-200 bg-slate-50 opacity-60'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              {price.name && (
                                <p className="text-sm font-semibold text-slate-900">
                                  {price.name}
                                </p>
                              )}
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-bold text-lg text-slate-900 font-mono">
                                  {formatCurrency(
                                    price.unit_amount || price.price || 0,
                                    price.currency
                                  )}
                                </span>
                                {item.unit && (
                                  <span className="text-xs text-slate-500">
                                    / {item.unit}
                                  </span>
                                )}
                                {price.is_active ? (
                                  <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 text-[10px] font-bold">
                                    Active
                                  </span>
                                ) : (
                                  <span className="bg-slate-100 text-slate-500 border border-slate-200 px-2 py-0.5 text-[10px] font-bold">
                                    Inactive
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Validity */}
                          <div className="flex items-center gap-2 text-[11px] text-slate-500">
                            <Clock className="h-3.5 w-3.5" />
                            <span>
                              Valid from{' '}
                              {new Date(
                                price.valid_from || price.effective_from || ''
                              ).toLocaleDateString()}
                              {(price.valid_until || price.effective_to) &&
                                ` to ${new Date(
                                  price.valid_until || price.effective_to || ''
                                ).toLocaleDateString()}`}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB: MANAGE (Add / Edit Price) */}
              {activeTab === 'manage' && (
                <div>
                  <ItemPriceManager
                    itemId={itemId}
                    prices={prices}
                    onUpdate={handlePriceUpdate}
                    refreshKey={priceRefreshKey}
                  />
                </div>
              )}
            </>
          )}
        </div>

        {/* Dialog Footer */}
        <div className="bg-slate-100 border-t border-slate-200 p-4 flex items-center justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
