'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ChevronRight, Loader2, Minus, Plus } from 'lucide-react';
import { ProvisionSubscriptionForm } from '@/components/forms/provision-subscription.form';
import { ProvisionResultDialog } from '@/components/dialogs/billing/provision-result.dialog';
import {
  useProvisionSubscription,
  useSubscriptionItems,
  useUpdateSubscriptionItemQuantity,
  useFinalizeSubscription,
} from '@/hooks/billing/useSubscription';
import type { CreateProvisionSubscriptionDTO } from '@/types';
import type { ProvisionResult } from '@/types/billing/responses';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ProvisionSubscriptionPage() {
  const router = useRouter();

  // Step 1: form, Step 2: review
  const [step, setStep] = useState<1 | 2>(1);
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [result, setResult] = useState<ProvisionResult | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [finalizeNotes, setFinalizeNotes] = useState('');
  const [pendingQuantities, setPendingQuantities] = useState<Record<string, number>>({});

  const provisionMutation = useProvisionSubscription();
  const finalizeMutation = useFinalizeSubscription(subscriptionId || '');

  // Only fetch items if we are on step 2 and have a subscription ID
  const { data: itemsResponse, isLoading: isLoadingItems } = useSubscriptionItems(
    subscriptionId || '',
    0
  );
  const items = itemsResponse?.data ?? [];

  const updateQtyMutation = useUpdateSubscriptionItemQuantity(subscriptionId || '');

  const handleSubmit = (data: CreateProvisionSubscriptionDTO) => {
    const payload: CreateProvisionSubscriptionDTO = {
      ...data,
      discount_code: data.discount_code?.trim() || null,
      notes: data.notes?.trim() || null,
      addons: data.addons ?? [],
    };

    provisionMutation.mutate(payload, {
      onSuccess: (response) => {
        const provisioned = response?.data;
        if (provisioned?.subscription?.id) {
          setSubscriptionId(provisioned.subscription.id);
          setResult(provisioned); // Temporary result from step 1
          setStep(2);
        }
      },
    });
  };

  const handlePendingQuantityChange = (itemId: string, newQty: number) => {
    if (newQty < 1) return;
    setPendingQuantities((prev) => ({
      ...prev,
      [itemId]: newQty,
    }));
  };

  const handleSaveQuantity = (itemId: string) => {
    const qty = pendingQuantities[itemId];
    if (!qty) return;
    updateQtyMutation.mutate(
      { itemId, data: { quantity: qty } },
      {
        onSuccess: () => {
          setPendingQuantities((prev) => {
            const next = { ...prev };
            delete next[itemId];
            return next;
          });
        },
      }
    );
  };

  const handleFinalize = () => {
    if (!subscriptionId) return;

    finalizeMutation.mutate(
      { notes: finalizeNotes.trim() || undefined },
      {
        onSuccess: (response: any) => {
          const provisioned = response?.data;
          if (provisioned?.subscription) {
            setResult(provisioned);
            setShowResult(true);
          }
        }
      }
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-6 py-4">
          <button
            type="button"
            onClick={() => {
              if (step === 2) {
                if (window.confirm('Are you sure you want to go back? The current subscription will remain pending.')) {
                  router.push('/billing');
                }
              } else {
                router.push('/billing');
              }
            }}
            className="flex h-8 w-8 items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <p className="text-xs uppercase tracking-wider text-gray-400">
              Billing / Sell package
            </p>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold text-gray-900">
                Provision subscription
              </h1>
              {step === 2 && (
                <>
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                  <span className="text-base font-semibold text-main">Review Items</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto">
        <div className="border border-gray-200 bg-white p-6">
          {step === 1 && (
            <ProvisionSubscriptionForm
              onSubmit={handleSubmit}
              isLoading={provisionMutation.isPending}
            />
          )}

          {step === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-lg font-medium">Review Line Items</h2>
                <p className="text-sm text-gray-500">
                  Review and adjust quantities for the generated invoice line items before finalizing.
                </p>
              </div>

              {isLoadingItems ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-main" />
                </div>
              ) : (
                <div className="overflow-x-auto rounded-md border">
                  <table className="w-full text-left text-sm">
                    <thead className="bg-gray-50 text-xs uppercase text-gray-500">
                      <tr>
                        <th className="px-4 py-3 font-medium">Item</th>
                        <th className="px-4 py-3 font-medium">Category</th>
                        <th className="px-4 py-3 font-medium">Unit Price</th>
                        <th className="px-4 py-3 font-medium">Quantity</th>
                        <th className="px-4 py-3 font-medium">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {items.map((item: any) => (
                        <tr key={item.id} className="bg-white hover:bg-gray-50">
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.item_name}
                            {item.source === 'plan' && (
                              <span className="ml-2 inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
                                Plan
                              </span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-gray-500">
                            {item.source === 'plan' ? 'Subscription' : 'Add-on'}
                          </td>
                          <td className="px-4 py-3 text-gray-700">
                            {item.unit_price.toLocaleString()} {item.currency}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              {(() => {
                                const currentQty = pendingQuantities[item.id] !== undefined ? pendingQuantities[item.id] : item.quantity;
                                const isChanged = pendingQuantities[item.id] !== undefined && pendingQuantities[item.id] !== item.quantity;
                                return (
                                  <>
                                    <div className="flex items-center gap-2 rounded-md border p-0.5">
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-sm"
                                        onClick={() => handlePendingQuantityChange(item.id, currentQty - 1)}
                                        disabled={currentQty <= 1 || updateQtyMutation.isPending}
                                      >
                                        <Minus className="h-3 w-3" />
                                      </Button>
                                      <span className="w-8 text-center tabular-nums text-sm">
                                        {currentQty}
                                      </span>
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-7 w-7 rounded-sm"
                                        onClick={() => handlePendingQuantityChange(item.id, currentQty + 1)}
                                        disabled={updateQtyMutation.isPending}
                                      >
                                        <Plus className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    {isChanged && (
                                      <Button
                                        type="button"
                                        size="sm"
                                        className="h-8 bg-green-600 hover:bg-green-700 text-white"
                                        onClick={() => handleSaveQuantity(item.id)}
                                        disabled={updateQtyMutation.isPending}
                                      >
                                        {updateQtyMutation.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : 'OK'}
                                      </Button>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-900">
                            {item.total_price.toLocaleString()} {item.currency}
                          </td>
                        </tr>
                      ))}
                      {items.length === 0 && (
                        <tr>
                          <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                            No items found.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="space-y-3 border-t pt-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Finalization Notes (Optional)
                  </label>
                  <Input
                    placeholder="E.g. Adjusted quantities as per customer request"
                    value={finalizeNotes}
                    onChange={(e) => setFinalizeNotes(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      if (window.confirm('Are you sure you want to cancel? The subscription is already provisioned but will remain pending.')) {
                        router.push('/billing');
                      }
                    }}
                  >
                    Cancel
                  </Button>
                  <Button
                    className="bg-main text-white hover:bg-main/90"
                    onClick={handleFinalize}
                    disabled={finalizeMutation.isPending || isLoadingItems}
                  >
                    {finalizeMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Finalize Subscription
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <ProvisionResultDialog
        open={showResult}
        onOpenChange={setShowResult}
        result={result}
        onDone={() => {
          if (result?.subscription?.id) {
            router.push(
              `/packages/subscriptions/${result.subscription.id}`
            );
          }
        }}
      />
    </div>
  );
}
