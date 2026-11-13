'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2, RotateCcw } from 'lucide-react';
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
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToggleAutoRenew } from '@/hooks/billing';
import { ToggleAutoRenewSchema, type ToggleAutoRenewDTO } from '@/types';

interface ToggleAutoRenewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  subscriptionId: string;
  currentValue: boolean;
  onSuccess?: () => void;
}

export function ToggleAutoRenewDialog({
  open,
  onOpenChange,
  subscriptionId,
  currentValue,
  onSuccess,
}: ToggleAutoRenewDialogProps) {
  const toggleAutoRenew = useToggleAutoRenew(subscriptionId);
  const newValue = !currentValue;

  const form = useForm<ToggleAutoRenewDTO>({
    resolver: zodResolver(ToggleAutoRenewSchema),
    defaultValues: {
      auto_renew: newValue,
      reason: '',
    },
  });

  const onSubmit = async (data: ToggleAutoRenewDTO) => {
    try {
      await toggleAutoRenew.mutateAsync(data);
      onOpenChange(false);
      form.reset();
      onSuccess?.();
    } catch {
      // Error is handled by useErrorHandler in the hook
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[420px] bg-white p-0 gap-0 overflow-hidden rounded-none border border-slate-200 shadow-xl">
        {/* Header */}
        <DialogHeader className="px-6 pt-5 pb-4 border-b border-slate-100">
          <DialogTitle className="text-base font-semibold text-slate-900">
            {newValue ? 'Enable' : 'Disable'} Auto-Renewal
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-500 mt-0.5">
            {newValue
              ? 'Subscription will renew automatically at the next billing date.'
              : 'Subscription will expire and require manual renewal.'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <div className="px-6 py-5 space-y-5">
              {/* State indicator */}
              <div
                className={`flex items-start gap-3 px-3 py-3 border-l-2 ${
                  newValue
                    ? 'border-l-emerald-500 bg-emerald-50'
                    : 'border-l-amber-500 bg-amber-50'
                }`}
              >
                <RotateCcw
                  className={`w-4 h-4 mt-0.5 shrink-0 ${
                    newValue ? 'text-emerald-600' : 'text-amber-600'
                  }`}
                />
                <div className="space-y-0.5">
                  <p
                    className={`text-xs font-semibold uppercase tracking-wide ${
                      newValue ? 'text-emerald-700' : 'text-amber-700'
                    }`}
                  >
                    {newValue ? 'Will be enabled' : 'Will be disabled'}
                  </p>
                  <p
                    className={`text-xs ${
                      newValue ? 'text-emerald-600' : 'text-amber-600'
                    }`}
                  >
                    {newValue
                      ? 'Billing will be charged automatically on renewal date.'
                      : 'No charge will occur. Subscription ends at expiry.'}
                  </p>
                </div>
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
                        placeholder={
                          newValue
                            ? 'e.g. Customer confirmed continued subscription'
                            : 'e.g. Customer requested cancellation at period end'
                        }
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
                disabled={toggleAutoRenew.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={toggleAutoRenew.isPending}
                className={`rounded-none text-white text-sm h-8 px-4 disabled:opacity-40 ${
                  newValue
                    ? 'bg-slate-900 hover:bg-slate-800'
                    : 'bg-amber-600 hover:bg-amber-700'
                }`}
              >
                {toggleAutoRenew.isPending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Saving…
                  </>
                ) : (
                  <>{newValue ? 'Enable' : 'Disable'} Auto-Renewal</>
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
