'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useUpdateBilling } from '@/hooks/billing';
import { UpdateBillingSchema, type UpdateBillingDTO } from '@/types';
import { logError } from '@/utils';

interface UpdateBillingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentBillingCycle?: string;
  currentAmount?: number;
  planPrices?: {
    monthly?: number;
    quarterly?: number;
    semi_annually?: number;
    yearly?: number;
  };
  onSuccess?: () => void;
}

const cycleLabels: Record<string, string> = {
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  semi_annually: 'Semi-Annually',
  annual: 'Annual',
};

export function UpdateBillingDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentBillingCycle,
  currentAmount,
  planPrices,
  onSuccess,
}: UpdateBillingDialogProps) {
  const [useCustomPrice, setUseCustomPrice] = useState(false);
  const updateBilling = useUpdateBilling(subscriptionId);

  const form = useForm<UpdateBillingDTO>({
    resolver: zodResolver(UpdateBillingSchema),
    defaultValues: {
      billing_cycle: currentBillingCycle as any,
      billing_amount: currentAmount,
      discount_code: '',
      discount_amount: undefined,
      reason: '',
    },
  });

  const selectedCycle = form.watch('billing_cycle');
  const estimatedPrice =
    selectedCycle && planPrices
      ? planPrices[selectedCycle as keyof typeof planPrices]
      : undefined;

  const onSubmit = async (data: UpdateBillingDTO) => {
    try {
      const payload = { ...data };
      if (!useCustomPrice) {
        delete payload.billing_amount;
        delete payload.original_price;
      }
      await updateBilling.mutateAsync(payload);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch (error: any) {
      logError('Update billing error:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px] bg-white p-0 gap-0 overflow-hidden rounded-none border border-slate-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900">
            Update Billing
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-0.5">
            Change billing cycle, amount, or apply discounts.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-5">
              {/* Billing Cycle + Estimated Price inline */}
              <FormField
                control={form.control}
                name="billing_cycle"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-xs font-medium text-slate-600">
                        Billing Cycle
                      </FormLabel>
                      {estimatedPrice !== undefined && (
                        <span className="text-xs text-slate-400">
                          Plan price:{' '}
                          <span className="font-semibold text-slate-700 font-mono">
                            {estimatedPrice.toLocaleString()} VND
                          </span>
                        </span>
                      )}
                    </div>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="h-9 text-sm rounded-none border-slate-200 bg-white focus:ring-1 focus:ring-slate-400">
                          <SelectValue placeholder="Select billing cycle" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="rounded-none border-slate-200">
                        {Object.entries(cycleLabels).map(([value, label]) => (
                          <SelectItem
                            key={value}
                            value={value}
                            className="text-sm"
                          >
                            <div className="flex items-center justify-between gap-6 w-full">
                              <span>{label}</span>
                              {planPrices?.[
                                value as keyof typeof planPrices
                              ] !== undefined && (
                                <span className="text-xs text-slate-400 font-mono">
                                  {planPrices[
                                    value as keyof typeof planPrices
                                  ]!.toLocaleString()}{' '}
                                  VND
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />

              {/* Custom pricing toggle */}
              <div className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  id="useCustomPrice"
                  checked={useCustomPrice}
                  onChange={(e) => setUseCustomPrice(e.target.checked)}
                  className="w-3.5 h-3.5 border-slate-300 accent-slate-800"
                />
                <label
                  htmlFor="useCustomPrice"
                  className="text-xs font-medium text-slate-600 cursor-pointer select-none"
                >
                  Override with custom pricing
                </label>
              </div>

              {/* Custom pricing fields */}
              {useCustomPrice && (
                <div className="grid grid-cols-2 gap-3">
                  <FormField
                    control={form.control}
                    name="billing_amount"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Billing Amount{' '}
                          <span className="text-slate-400 font-normal">
                            VND
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm rounded-none border-slate-200 focus:ring-1 focus:ring-slate-400"
                            value={field.value || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v ? parseFloat(v) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="original_price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs font-medium text-slate-600">
                          Original Price{' '}
                          <span className="text-slate-400 font-normal">
                            VND
                          </span>
                        </FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="0"
                            className="h-9 text-sm rounded-none border-slate-200 focus:ring-1 focus:ring-slate-400"
                            value={field.value || ''}
                            onChange={(e) => {
                              const v = e.target.value;
                              field.onChange(v ? parseFloat(v) : undefined);
                            }}
                          />
                        </FormControl>
                        <FormMessage className="text-xs" />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              {/* Divider */}
              <div className="border-t border-slate-100" />

              {/* Discount row */}
              <div className="grid grid-cols-2 gap-3">
                <FormField
                  control={form.control}
                  name="discount_code"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-600">
                        Discount Code{' '}
                        <span className="text-slate-400 font-normal">
                          (optional)
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. SUMMER2024"
                          className="h-9 text-sm rounded-none border-slate-200 placeholder:text-slate-400 font-mono focus:ring-1 focus:ring-slate-400"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="discount_amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs font-medium text-slate-600">
                        Discount Amount{' '}
                        <span className="text-slate-400 font-normal">VND</span>
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="0"
                          className="h-9 text-sm rounded-none border-slate-200 focus:ring-1 focus:ring-slate-400"
                          value={field.value || ''}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v ? parseFloat(v) : undefined);
                          }}
                        />
                      </FormControl>
                      <FormMessage className="text-xs" />
                    </FormItem>
                  )}
                />
              </div>

              {/* Reason */}
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-xs font-medium text-slate-600">
                      Reason{' '}
                      <span className="text-slate-400 font-normal">
                        (optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g. Customer requested cycle change to annual billing"
                        className="resize-none text-sm rounded-none border-slate-200 placeholder:text-slate-400 focus:ring-1 focus:ring-slate-400"
                        rows={3}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage className="text-xs" />
                  </FormItem>
                )}
              />
            </div>

            {/* Footer */}
            <DialogFooter className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex flex-row justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-none border-slate-200 text-slate-600 hover:bg-slate-100 text-sm h-8 px-3"
                onClick={() => onOpenChange(false)}
                disabled={updateBilling.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={updateBilling.isPending}
                className="rounded-none bg-slate-900 text-white hover:bg-slate-800 disabled:opacity-40 text-sm h-8 px-4"
              >
                {updateBilling.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Updating…
                  </>
                ) : (
                  'Update Billing'
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
