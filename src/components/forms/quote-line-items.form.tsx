'use client';

import {
  Input,
  Label,
  Textarea,
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui';
import { Plus, Trash2, Pencil, Save, X, Search, Check } from 'lucide-react';
import React, { useEffect, useState, useMemo } from 'react';
import { toast } from 'sonner';
import {
  useQuoteLineItems,
  useSetQuoteLineItems,
  useServiceItems,
} from '@/hooks/billing';
import { Loader } from '../loading/loader';
import type { ItemPrice } from '@/types';
import { formatNumber } from '@/utils';

function pickItemPrice(
  prices: ItemPrice[] | undefined
): { unit_amount: number; currency: string } {
  if (!prices?.length) return { unit_amount: 0, currency: 'VND' };
  const row = prices.find((p) => p.is_active) ?? prices[0];
  return {
    unit_amount: Number(row.unit_amount) || Number(row.price) || 0,
    currency: row.currency || 'VND',
  };
}

interface QuoteLineItemsFormProps {
  quoteId: string;
  billingCycle?: string;
  onSuccess?: () => void;
}

interface FormItem {
  tempId: string;
  service_item_id?: string;
  quantity: number;
  unit_price?: number;
  discount_amount?: number;
  currency?: string;
  name?: string;
  description?: string;
}

function quoteLineSubtotal(item: FormItem): number {
  const qty = Number(item.quantity) || 0;
  const unit = Number(item.unit_price) || 0;
  const discount = Number(item.discount_amount) || 0;
  return Math.round(unit * qty - discount);
}

export const QuoteLineItemsForm: React.FC<QuoteLineItemsFormProps> = ({
  quoteId,
  billingCycle = 'monthly',
  onSuccess,
}) => {
  const [items, setItems] = useState<FormItem[]>([]);
  const [editingItem, setEditingItem] = useState<FormItem | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: quoteLineItems, isLoading: loadingQuoteItems } =
    useQuoteLineItems(quoteId, 1);

  const { data: serviceItemsData, isLoading: loadingServiceItems } =
    useServiceItems(1, { page_size: 100, active_only: 'true', include_prices: 'true' }, 0);

  const updateMutation = useSetQuoteLineItems(quoteId);

  const totalsByCurrency = useMemo(() => {
    const m = new Map<string, number>();
    for (const item of items) {
      const c = item.currency?.trim() || 'VND';
      m.set(c, (m.get(c) ?? 0) + quoteLineSubtotal(item));
    }
    return m;
  }, [items]);

  const formattedGrandTotal = useMemo(() => {
    if (totalsByCurrency.size === 0) return '';
    return Array.from(totalsByCurrency.entries())
      .map(([cur, n]) => `${formatNumber(Math.round(n))} ${cur}`)
      .join(' · ');
  }, [totalsByCurrency]);

  useEffect(() => {
    if (quoteLineItems?.data) {
      setItems(
        quoteLineItems.data.map((item) => ({
          tempId: item.id,
          service_item_id: item.service_item_id ?? undefined,
          quantity: Number(item.quantity) || 1,
          discount_amount: Number(item.discount_amount) || 0,
          unit_price: (() => {
            const up = Number(item.unit_price);
            return Number.isFinite(up) ? up : undefined;
          })(),
          currency: item.currency,
          name: item.item_name,
          description: item.notes,
        }))
      );
    }
  }, [quoteLineItems]);

  const catalog = useMemo(() => {
    return (serviceItemsData?.results ?? []).map((s) => ({
      id: s.id,
      name: s.name,
      sub: s.description || '',
      item_prices: s.item_prices,
      raw: s,
    }));
  }, [serviceItemsData]);

  const filteredCatalog = useMemo(() => {
    const q = searchQuery.toLowerCase();
    return q
      ? catalog.filter((c) => c.name.toLowerCase().includes(q))
      : catalog;
  }, [catalog, searchQuery]);

  const selectedIds = useMemo(() => {
    const ids = new Set<string>();
    items.forEach((item) => {
      if (item.service_item_id) {
        ids.add(item.service_item_id);
      }
    });
    return ids;
  }, [items]);

  const handleToggleCatalogItem = (entry: (typeof filteredCatalog)[number]) => {
    const key = entry.id;
    const isAdded = selectedIds.has(key);

    if (isAdded) {
      setItems((prev) => prev.filter((i) => i.service_item_id !== key));
    } else {
      const svc = entry.raw;
      const { unit_amount, currency } = pickItemPrice(svc.item_prices);
      setItems((prev) => [
        ...prev,
        {
          tempId: `temp-${Date.now()}-${svc.id}`,
          service_item_id: svc.id,
          quantity: 1,
          discount_amount: 0,
          unit_price: unit_amount,
          currency,
          name: svc.name,
          description: svc.description,
        },
      ]);
      toast.success(`Added ${svc.name}`);
    }
  };

  const handleRemoveItem = (tempId: string) =>
    setItems((prev) => prev.filter((i) => i.tempId !== tempId));

  const handleEditItem = (item: FormItem) => {
    setEditingItem({ ...item });
    setShowEditDialog(true);
  };

  const handleSaveEdit = () => {
    if (!editingItem) return;
    setItems((prev) =>
      prev.map((i) => (i.tempId === editingItem.tempId ? editingItem : i))
    );
    setShowEditDialog(false);
    setEditingItem(null);
  };

  const handleSubmit = async () => {
    try {
      if (items.length === 0) {
        toast.error('Please add at least one item');
        return;
      }
      await updateMutation.mutateAsync({
        items: items.map((item) => ({
          source: 'custom',
          item_name: item.name || 'Unnamed Item',
          quantity: Number(item.quantity) || 1,
          unit_price: Number(item.unit_price) || 0,
          currency: item.currency || 'VND',
          service_item_id: item.service_item_id,
          discount_amount: Number(item.discount_amount) || 0,
          notes: item.description || '',
        })),
      });
      onSuccess?.();
    } catch (error: any) {
      toast.error(error.message || 'Error updating quote items');
    }
  };

  if (loadingQuoteItems) {
    return (
      <div className="w-full border border-slate-200 bg-white">
        <div className="flex justify-center py-16">
          <Loader />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="w-full border border-slate-200 bg-white">
        <div className="border-b border-slate-200">
          <div className="px-6 py-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase">
              Add Line Items
            </span>
            <span className="text-[11px] text-slate-500 font-mono">
              {items.length} item{items.length !== 1 ? 's' : ''} selected
            </span>
          </div>

          <div
            className="grid grid-cols-2 divide-x divide-slate-200 bg-white"
            style={{ height: 340 }}
          >
            {/* LEFT CATALOG PANEL */}
            <div className="flex flex-col overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2 border-b border-slate-200 flex-shrink-0 bg-white">
                <Search className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search catalog services…"
                  className="flex-1 text-xs bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                />
              </div>

              <div className="flex-1 overflow-y-auto">
                {loadingServiceItems ? (
                  <div className="flex items-center justify-center h-full">
                    <Loader />
                  </div>
                ) : filteredCatalog.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Search className="w-5 h-5" />
                    <span className="text-xs">No matching services</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredCatalog.map((entry) => {
                      const isAdded = selectedIds.has(entry.id);
                      const { unit_amount, currency } = pickItemPrice(
                        entry.item_prices
                      );

                      return (
                        <button
                          key={entry.id}
                          type="button"
                          onClick={() => handleToggleCatalogItem(entry)}
                          className={[
                            'w-full flex items-center gap-3 px-4 py-2.5 text-left transition-colors group',
                            isAdded ? 'bg-slate-50' : 'hover:bg-slate-50',
                          ].join(' ')}
                        >
                          <div
                            className={[
                              'w-4 h-4 flex-shrink-0 border flex items-center justify-center transition-colors',
                              isAdded
                                ? 'border-slate-900 bg-slate-900'
                                : 'border-slate-300 group-hover:border-slate-500',
                            ].join(' ')}
                          >
                            {isAdded && (
                              <Check
                                className="w-2.5 h-2.5 text-white"
                                strokeWidth={3}
                              />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <p
                              className={[
                                'text-xs font-medium truncate',
                                isAdded ? 'text-slate-400' : 'text-slate-800',
                              ].join(' ')}
                            >
                              {entry.name}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              <span className="text-xs font-semibold text-slate-700 font-mono">
                                {formatNumber(unit_amount)} {currency}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* RIGHT SELECTED PANEL */}
            <div className="flex flex-col overflow-hidden bg-slate-50/50">
              <div className="flex items-center justify-between px-4 py-2 border-b border-slate-200 flex-shrink-0 bg-slate-100">
                <span className="text-[11px] font-bold tracking-widest text-slate-600 uppercase">
                  Selected Lines
                </span>
                {items.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setItems([])}
                    className="text-[11px] text-slate-500 hover:text-red-600 transition-colors uppercase tracking-wider font-semibold"
                  >
                    Clear all
                  </button>
                )}
              </div>

              <div className="flex-1 overflow-y-auto">
                {items.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full gap-2 text-slate-400">
                    <Plus className="w-5 h-5" />
                    <span className="text-xs">Select items from the catalog</span>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200/60">
                    {items.map((item) => (
                      <div
                        key={item.tempId}
                        className="flex items-center gap-2 px-4 py-2.5 group hover:bg-white transition-colors"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-slate-800 truncate">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-slate-500 font-mono mt-0.5">
                            Qty: {item.quantity}
                            {(item.discount_amount ?? 0) > 0 && (
                              <span className="text-amber-600 ml-1.5 font-semibold">
                                • Disc: {formatNumber(item.discount_amount ?? 0)}
                              </span>
                            )}
                            {item.unit_price != null && (
                              <span className="text-slate-600 ml-1.5">
                                · {formatNumber(Number(item.unit_price))}{' '}
                                {item.currency ?? 'VND'}
                              </span>
                            )}
                          </p>
                        </div>
                        <div className="text-right flex-shrink-0 pr-1">
                          <p className="text-xs font-bold font-mono text-slate-900 tabular-nums">
                            {formatNumber(quoteLineSubtotal(item))}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {item.currency ?? 'VND'}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <button
                            type="button"
                            onClick={() => handleEditItem(item)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-200/60"
                          >
                            <Pencil className="w-3 h-3" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.tempId)}
                            className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between px-4 py-2.5 border-t border-slate-200 bg-slate-100 flex-shrink-0 gap-3">
                <div className="min-w-0">
                  <span className="text-[11px] font-bold tracking-widest text-slate-500 uppercase block">
                    Subtotal
                  </span>
                </div>
                <div className="text-right flex-shrink-0">
                  <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                    {formattedGrandTotal || '—'}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* DETAILED TABLE */}
        {items.length > 0 && (
          <div className="bg-white">
            <div className="grid grid-cols-[minmax(0,1fr)_52px_110px_120px_64px] border-b border-slate-200 bg-slate-50">
              {['Service Description', 'Qty', 'Unit Price', 'Line Subtotal', ''].map(
                (col, i) => (
                  <div
                    key={i}
                    className={[
                      'px-4 py-2.5 text-[11px] font-bold tracking-wider text-slate-600 uppercase',
                      i > 0 && i < 4 ? 'text-right' : '',
                      i === 4 ? 'text-center' : '',
                    ].join(' ')}
                  >
                    {col}
                  </div>
                )
              )}
            </div>

            <div className="divide-y divide-slate-200/60">
              {items.map((item) => (
                <div
                  key={item.tempId}
                  className="grid grid-cols-[minmax(0,1fr)_52px_110px_120px_64px] hover:bg-slate-50/70 transition-colors group"
                >
                  <div className="px-4 py-3">
                    <p className="text-xs font-semibold text-slate-900">
                      {item.name}
                    </p>
                    {item.description && (
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {item.description}
                      </p>
                    )}
                    {(item.discount_amount ?? 0) > 0 && (
                      <p className="text-[11px] text-amber-700 mt-0.5 font-mono font-medium">
                        −{formatNumber(item.discount_amount ?? 0)} discount applied
                      </p>
                    )}
                  </div>
                  <div className="px-4 py-3 flex items-center justify-end">
                    <span className="text-xs text-slate-700 font-mono font-medium">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-end">
                    <span className="text-xs text-slate-800 font-mono tabular-nums">
                      {formatNumber(Number(item.unit_price ?? 0))}{' '}
                      <span className="text-[10px] text-slate-400 font-sans">
                        {item.currency ?? 'VND'}
                      </span>
                    </span>
                  </div>
                  <div className="px-4 py-3 flex items-center justify-end">
                    <span className="text-xs font-bold text-slate-900 font-mono tabular-nums">
                      {formatNumber(quoteLineSubtotal(item))}{' '}
                      <span className="text-[10px] text-slate-400 font-sans font-normal">
                        {item.currency ?? 'VND'}
                      </span>
                    </span>
                  </div>
                  <div className="px-2 py-3 flex items-center justify-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleEditItem(item)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100 transition-colors"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(item.tempId)}
                      className="w-6 h-6 flex items-center justify-center text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* FOOTER BAR */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-500">
            {items.length} line item{items.length !== 1 ? 's' : ''} · Billing cycle:{' '}
            <span className="font-mono text-slate-700 font-semibold">{billingCycle}</span>
            {items.length > 0 && formattedGrandTotal && (
              <>
                {' '}
                · Total:{' '}
                <span className="font-bold text-slate-900 font-mono">
                  {formattedGrandTotal}
                </span>
              </>
            )}
          </p>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={updateMutation.isPending || items.length === 0}
            className="h-9 px-6 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? 'Saving Quote Items…' : 'Save Line Items →'}
          </button>
        </div>
      </div>

      {/* EDIT DIALOG */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-md rounded-none p-0 gap-0 border border-slate-200 shadow-lg">
          <DialogHeader className="px-6 py-4 border-b border-slate-200 bg-slate-50">
            <DialogTitle className="text-xs font-bold uppercase tracking-wider text-slate-800">
              Edit Line Item Parameters
            </DialogTitle>
          </DialogHeader>

          {editingItem && (
            <div className="divide-y divide-slate-100 bg-white">
              <div className="px-6 py-4 bg-slate-50/50">
                <p className="text-[11px] font-bold tracking-widest text-slate-400 uppercase mb-1">
                  Item Name
                </p>
                <p className="text-xs font-bold text-slate-900">
                  {editingItem.name}
                </p>
              </div>

              <div className="px-6 py-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Quantity
                  </Label>
                  <Input
                    type="number"
                    min="1"
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: parseInt(e.target.value) || 1,
                      })
                    }
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Discount Amount
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={editingItem.discount_amount || 0}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        discount_amount: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="px-6 py-4 grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Unit Price
                  </Label>
                  <Input
                    type="number"
                    min="0"
                    step="1"
                    value={
                      editingItem.unit_price === undefined ||
                      editingItem.unit_price === null
                        ? ''
                        : editingItem.unit_price
                    }
                    onChange={(e) => {
                      const raw = e.target.value;
                      setEditingItem({
                        ...editingItem,
                        unit_price:
                          raw === ''
                            ? undefined
                            : Math.max(0, parseFloat(raw) || 0),
                      });
                    }}
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900 font-mono"
                  />
                </div>
                <div>
                  <Label className="text-xs font-semibold text-slate-600 block mb-1.5">
                    Currency
                  </Label>
                  <Input
                    type="text"
                    value={editingItem.currency || 'VND'}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        currency: e.target.value.trim() || 'VND',
                      })
                    }
                    className="rounded-none border-slate-300 h-9 text-xs focus:ring-0 focus:border-slate-900 font-mono uppercase"
                  />
                </div>
              </div>

              <div className="px-6 py-4">
                <Label className="text-xs font-semibold text-slate-600 block mb-1.5">
                  Description / Line Notes
                </Label>
                <Textarea
                  value={editingItem.description || ''}
                  onChange={(e) =>
                    setEditingItem({
                      ...editingItem,
                      description: e.target.value,
                    })
                  }
                  placeholder="Optional line notes visible to customer…"
                  className="rounded-none border-slate-300 text-xs focus:ring-0 focus:border-slate-900 resize-none"
                  rows={2}
                />
              </div>

              <div className="px-6 py-3 flex items-center justify-end gap-2 bg-slate-50 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditDialog(false);
                    setEditingItem(null);
                  }}
                  className="h-8 px-4 border border-slate-300 text-xs font-medium text-slate-700 hover:bg-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="h-8 px-4 bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 transition-colors flex items-center gap-1.5"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Changes
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
